'use client';

import { useEffect, useState, useRef } from 'react';
import { Edit, Trash2, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { addProduct, deleteProduct, subscribeToProducts, updateProduct, uploadProductImage, type Product, type ProductPrice } from '@/store/useCatalogStore';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';

const emptyProduct = {
  name: '',
  description: '',
  category: 'Flour',
  imageUrl: '',
  isActive: true,
  prices: [{ weight: '1kg', price: 0, stock: 0 }],
};

export default function CatalogManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formState, setFormState] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((items) => setProducts(items));
    return unsubscribe;
  }, []);

  const resetForm = () => {
    setFormState(emptyProduct);
    setEditingId(null);
    setImageFile(null);
    setFormError('');
  };

  const saveProduct = async () => {
    if (!formState.name.trim()) {
      setFormError('Product name is required.');
      return;
    }

    setFormError('');
    setIsUploading(true);
    try {
      let currentImageUrl = formState.imageUrl;

      if (imageFile) {
        currentImageUrl = await uploadProductImage(imageFile);
      }

      const finalProduct = { ...formState, imageUrl: currentImageUrl };

      if (editingId) {
        await updateProduct(editingId, finalProduct);
      } else {
        await addProduct(finalProduct);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      setFormError(getFirebaseErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormState({
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      prices: product.prices.map((p) => ({ ...p })),
    });
  };

  const removePrice = (index: number) => {
    if (formState.prices.length <= 1) return;
    setFormState({ ...formState, prices: formState.prices.filter((_, i) => i !== index) });
  };

  const setPriceField = (index: number, field: keyof ProductPrice, value: string | number) => {
    const updated = [...formState.prices];
    updated[index] = { ...updated[index], [field]: field === 'weight' ? String(value) : Number(value) };
    setFormState({ ...formState, prices: updated });
  };

  return (
    <div className="px-4 py-10 max-w-6xl mx-auto">
      <div className="mb-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-secondary mb-4">Product Onboarding</h2>

        {formError && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-px" />
            <p className="font-medium">{formError}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-700">Name</label>
            <input type="text" value={formState.name} onChange={(e) => { setFormState({ ...formState, name: e.target.value }); setFormError(''); }} className="w-full mt-1 rounded-lg border border-stone-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Category</label>
            <input type="text" value={formState.category} onChange={(e) => setFormState({ ...formState, category: e.target.value })} className="w-full mt-1 rounded-lg border border-stone-300 px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700">Description</label>
            <textarea value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} rows={3} className="w-full mt-1 rounded-lg border border-stone-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Product Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group w-32 h-32 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand-primary transition-all"
            >
              {(imageFile || formState.imageUrl) ? (
                <img 
                  src={imageFile ? URL.createObjectURL(imageFile) : formState.imageUrl} 
                  alt="Product" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <Camera className="w-8 h-8 text-stone-400 mx-auto mb-1 group-hover:text-brand-primary" />
                  <span className="text-[10px] text-stone-500 font-medium">Click to upload</span>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
                </div>
              )}
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="hidden" 
            />
          </div>
          <div className="flex items-center gap-2 pt-3">
            <input id="active" type="checkbox" checked={formState.isActive} onChange={(e) => setFormState({ ...formState, isActive: e.target.checked })} className="h-4 w-4" />
            <label htmlFor="active" className="text-sm text-stone-700 font-medium">Active</label>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-semibold text-stone-700">Price Options</h3>
          {formState.prices.map((price, index) => (
            <div key={`${price.weight}-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div>
                <label className="text-xs text-stone-500">Weight</label>
                <input type="text" value={price.weight} onChange={(e) => setPriceField(index, 'weight', e.target.value)} className="w-full rounded-lg border border-stone-300 px-2 py-1" />
              </div>
              <div>
                <label className="text-xs text-stone-500">Price</label>
                <input type="number" value={price.price} onChange={(e) => setPriceField(index, 'price', Number(e.target.value))} className="w-full rounded-lg border border-stone-300 px-2 py-1" />
              </div>
              <div>
                <label className="text-xs text-stone-500">Stock</label>
                <input type="number" value={price.stock} onChange={(e) => setPriceField(index, 'stock', Number(e.target.value))} className="w-full rounded-lg border border-stone-300 px-2 py-1" />
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => removePrice(index)} className="text-red-500 text-sm px-2 py-1 rounded border border-red-200 hover:bg-red-50">Remove</button>
                {index === formState.prices.length - 1 && (
                  <button type="button" onClick={() => setFormState({ ...formState, prices: [...formState.prices, { weight: '', price: 0, stock: 0 }] })} className="text-brand-primary text-sm px-2 py-1 rounded border border-brand-primary/30 hover:bg-brand-primary/10">Add Option</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button 
            onClick={saveProduct} 
            disabled={isUploading}
            className="bg-brand-primary text-white py-2.5 px-6 rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:translate-y-0 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {editingId ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingId ? 'Update Product' : 'Create Product'
            )}
          </button>
          <button onClick={resetForm} className="bg-stone-100 text-stone-600 py-2.5 px-6 rounded-xl font-bold hover:bg-stone-200 transition-colors">Clear</button>
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-secondary mb-4">Product Catalog</h2>
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-stone-500">No products yet.</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex flex-wrap md:flex-nowrap items-start md:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <div className="text-lg font-semibold">{product.name}</div>
                  <div className="text-sm text-stone-500">{product.category} - {product.isActive ? 'Active' : 'Inactive'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(product)} className="inline-flex items-center gap-1 text-sm text-brand-primary border border-brand-primary/30 px-2 py-1 rounded hover:bg-brand-primary/10"><Edit className="w-4 h-4" />Edit</button>
                  <button onClick={() => deleteProduct(product.id)} className="inline-flex items-center gap-1 text-sm text-red-600 border border-red-300 px-2 py-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" />Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
