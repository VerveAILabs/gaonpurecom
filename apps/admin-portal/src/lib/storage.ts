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

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${pathPrefix}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}
