import React, { useState } from 'react';

export const ProductForm: React.FC = () => {
  const [product, setProduct] = useState({
    name: '',
    price: 0,
    quantity: 0,
    details: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    console.log('Product data:', product);
    console.log('Images to upload:', images);

    try {
      // Logic for Firebase Storage upload would go here:
      // const urls = await Promise.all(images.map(img => uploadToFirebase(img)));
      // await saveToFirestore({ ...product, imageUrls: urls });
      
      alert('Product and images uploaded successfully (Skeleton Logic)');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Create Product</h2>
      
      {/* Basic Details */}
      <div className="mb-4 space-y-2">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input 
            type="text" 
            value={product.name}
            onChange={(e) => setProduct({...product, name: e.target.value})}
            className="w-full border p-2 rounded" 
            required 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input 
              type="number" 
              value={product.price}
              onChange={(e) => setProduct({...product, price: Number(e.target.value)})}
              className="w-full border p-2 rounded" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input 
              type="number" 
              value={product.quantity}
              onChange={(e) => setProduct({...product, quantity: Number(e.target.value)})}
              className="w-full border p-2 rounded" 
              required 
            />
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Product Images (Multiple)</label>
        <input 
          type="file" 
          multiple 
          accept="image/*"
          onChange={handleImageChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 border italic">
              {img.name.substring(0, 10)}...
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Details</label>
        <textarea 
          value={product.details}
          onChange={(e) => setProduct({...product, details: e.target.value})}
          className="w-full border p-2 rounded"
          rows={3}
        />
      </div>

      <button 
        type="submit" 
        disabled={uploading}
        className={`w-full text-white px-4 py-2 rounded font-bold ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {uploading ? 'Uploading...' : 'Save Product with Images'}
      </button>
    </form>
  );
};
