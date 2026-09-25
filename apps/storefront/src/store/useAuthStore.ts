'use client';

import { create } from 'zustand';
import { auth, storage, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';

const ADMIN_EMAILS = [
  'rds087@gmail.com',
  'admin@gaonpure.com',
  'gaonpure01@gmail.com',
  'khiladi14290@gmail.com'
];
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type UserRole = 'Guest' | 'Customer' | 'Admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitialized: boolean;
  setUser: (firebaseUser: any | null) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ unverified?: boolean }>;
  signUpWithEmail: (email: string, password: string, name: string, photoFile?: File) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<Pick<UserProfile, 'name' | 'phone' | 'address' | 'city' | 'state' | 'pincode'>>) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isInitialized: false,
  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      throw error;
    }
  },
  loginWithEmail: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        await firebaseSignOut(auth);
        return { unverified: true };
      }
      return {};
    } catch (error) {
      throw error;
    }
  },
  signUpWithEmail: async (email, password, name, photoFile) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let photoURL = '';
      if (photoFile) {
        const storageRef = ref(storage, `profile-photos/${user.uid}-${photoFile.name}`);
        const snapshot = await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      await updateProfile(user, {
        displayName: name,
        photoURL: photoURL || undefined,
      });

      await sendEmailVerification(user);
      // Sign out immediately so they have to verify and log in
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  },
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  },
  setUser: async (firebaseUser) => {
    if (firebaseUser && firebaseUser.emailVerified) {
      const email = firebaseUser.email || '';
      const name = firebaseUser.displayName || email.split('@')[0] || 'Customer';
      
      // Admin role is determined by backend only (see Firestore admin_users collection)
      let role: UserRole = 'Customer';
      
      let phone = '', address = '', city = '', state = '', pincode = '';
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const adminRef = doc(db, 'admin_users', firebaseUser.uid);
        const adminSnap = await getDoc(adminRef);
        const isAdminUser = adminSnap.exists() && adminSnap.data()?.isAdmin === true;

        if (!userSnap.exists()) {
          let phoneVal = '', addressVal = '', cityVal = '', stateVal = '', pincodeVal = '';
          try {
            const { collection, getDocs, query, where, writeBatch, doc: firestoreDoc } = await import('firebase/firestore');
            const usersColl = collection(db, 'users');
            const guestQuery = query(usersColl, where('email', '==', email.toLowerCase().trim()));
            const guestSnap = await getDocs(guestQuery);
            
            let guestDocId = '';
            guestSnap.forEach(docSnap => {
              if (docSnap.id !== firebaseUser.uid) {
                const gdata = docSnap.data();
                phoneVal = gdata.phone || '';
                addressVal = gdata.address || '';
                cityVal = gdata.city || '';
                stateVal = gdata.state || '';
                pincodeVal = gdata.pincode || '';
                guestDocId = docSnap.id;
              }
            });

            if (guestDocId) {
              const ordersColl = collection(db, 'orders');
              const ordersQuery = query(ordersColl, where('userId', '==', guestDocId));
              const ordersSnap = await getDocs(ordersQuery);
              
              const batch = writeBatch(db);
              ordersSnap.forEach(orderDoc => {
                batch.update(orderDoc.ref, { userId: firebaseUser.uid });
              });
              
              batch.delete(firestoreDoc(db, 'users', guestDocId));
              await batch.commit();
            }
          } catch (e) {
            console.error("Error migrating guest user data:", e);
          }

          phone = phoneVal;
          address = addressVal;
          city = cityVal;
          state = stateVal;
          pincode = pincodeVal;

          await setDoc(userRef, {
            name,
            email,
            role,
            photoURL: firebaseUser.photoURL || null,
            phone: phoneVal || null,
            address: addressVal || null,
            city: cityVal || null,
            state: stateVal || null,
            pincode: pincodeVal || null,
            createdAt: new Date().toISOString()
          });
        } else {
          const userData = userSnap.data();
          phone = userData.phone || '';
          address = userData.address || '';
          city = userData.city || '';
          state = userData.state || '';
          pincode = userData.pincode || '';
        }

        if (ADMIN_EMAILS.includes(email.toLowerCase())) {
          await setDoc(adminRef, { isAdmin: true }, { merge: true });
          role = 'Admin';
        } else if (isAdminUser) {
          role = 'Admin';
        }
      } catch (error) {
        console.error("Error syncing user to Firestore:", error);
      }

      // Sync user profile with Neon PostgreSQL
      try {
        fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: firebaseUser.uid,
            email,
            name,
            phone,
            role,
          }),
        }).catch((err) => console.warn('Neon user sync notice:', err));
      } catch {}

      set({
        user: {
          id: firebaseUser.uid,
          name,
          email,
          role: role as UserRole,
          photoURL: firebaseUser.photoURL || undefined,
          phone,
          address,
          city,
          state,
          pincode,
        },
        isAuthenticated: true,
        isAdmin: role === 'Admin',
        isInitialized: true,
      });
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isInitialized: true,
      });
    }
  },
  updateUserProfile: async (data) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Not authenticated');
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, data as Record<string, unknown>);
    set({ user: { ...user, ...data } });
  },
  logout: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    set({ user: null, isAuthenticated: false, isAdmin: false, isInitialized: true });
  },
}));

