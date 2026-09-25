'use client';

import { db, storage } from '@/lib/firebase';
import { collection, getDocs, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface ProductPrice {
  id?: string;
  weight: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  prices: ProductPrice[];
  isActive: boolean;
  isFeatured?: boolean;
}

const productsCollection = collection(db, 'products');

export const getProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetch('/api/catalog');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.products && json.products.length > 0) {
        return json.products;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch catalog from Neon DB API, falling back:', err);
  }

  // Fallback to Firestore if needed
  try {
    const productsQuery = query(productsCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(productsQuery);
    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data) {
        products.push({ id: docSnap.id, ...(data as Omit<Product, 'id'>) });
      }
    });
    return products;
  } catch (err) {
    console.error('Firestore catalog fetch failed:', err);
    return [];
  }
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  let isMounted = true;

  // 1. Immediately fetch from PostgreSQL
  getProducts().then((items) => {
    if (isMounted && items.length > 0) {
      callback(items);
    }
  });

  // 2. Also attach Firestore listener for real-time fallback updates
  const productsQuery = query(productsCollection, orderBy('name', 'asc'));
  const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
    if (!isMounted) return;
    if (!snapshot.empty) {
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data) {
          products.push({ id: docSnap.id, ...(data as Omit<Product, 'id'>) });
        }
      });
      callback(products);
    }
  }, (err) => {
    // Ignore permissions/offline errors if Neon DB served the data
    console.warn('Firestore subscription notice:', err.message);
  });

  return () => {
    isMounted = false;
    unsubscribe();
  };
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const docRef = await addDoc(productsCollection, product);
  return { id: docRef.id, ...product };
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const productDoc = doc(db, 'products', id);
  await updateDoc(productDoc, updates);
};

export const deleteProduct = async (id: string) => {
  const productDoc = doc(db, 'products', id);
  await deleteDoc(productDoc);
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `product-images/${fileName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
