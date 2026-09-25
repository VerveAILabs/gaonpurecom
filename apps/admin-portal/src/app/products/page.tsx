'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  X, 
  Upload, 
  FolderPlus, 
  Image as ImageIcon,
  FolderTree,
  AlertCircle
} from 'lucide-react';
import { uploadImageFile } from '@/lib/storage';

interface Variant {
  id?: string;
  weight: string;
  price: number;
  stock: number;
  sku?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  category: { id: string; name: string };
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  variants: Variant[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { products: number };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([
    { weight: '1kg', price: 100, stock: 50, sku: '' },
  ]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.products);
        setCategories(json.categories);
        if (json.categories.length > 0 && !categoryId) {
          setCategoryId(json.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop');
    setIsFeatured(false);
    setCategoryId(categories[0]?.id || '');
    setVariants([{ weight: '1kg', price: 100, stock: 50, sku: '' }]);
    setImageUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setImageUrl(p.imageUrl);
    setIsFeatured(p.isFeatured);
    setCategoryId(p.categoryId);
    setVariants(p.variants.map(v => ({
      id: v.id,
      weight: v.weight,
      price: Number(v.price),
      stock: v.stock,
      sku: v.sku || '',
    })));
    setImageUploadError(null);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      const uploadedUrl = await uploadImageFile(file, 'products');
      setImageUrl(uploadedUrl);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setImageUploadError(err.message || 'Image upload failed. Try again.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addVariantRow = () => {
    setVariants([...variants, { weight: '500g', price: 50, stock: 20, sku: '' }]);
  };

  const removeVariantRow = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id: editingProduct?.id,
        name,
        description,
        categoryId,
        imageUrl,
        isFeatured,
        isActive: true,
        variants,
      };

      const res = await fetch('/api/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCategorySaving(true);
    setCategoryError(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setNewCatName('');
        setNewCatDesc('');
        await fetchCategories();
      } else {
        setCategoryError(json.error || 'Failed to create category');
      }
    } catch (err: any) {
      setCategoryError(err.message || 'Error creating category');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/categories?id=${catId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        await fetchCategories();
      } else {
        alert(json.error || 'Failed to delete category');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Product Catalog</h1>
          <p className="text-xs text-stone-500 mt-1">Manage food items, multi-size packages, live pricing & stock</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchCategories();
              setIsCategoryModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 shadow-sm transition-colors"
          >
            <FolderTree className="w-4 h-4 text-stone-500" />
            Manage Categories
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-900/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-stone-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs font-medium">Fetching catalog...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-sm">No products found</h3>
          <p className="text-xs text-stone-500 mt-1">Start by adding your first pure food product</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Variants & Pricing</th>
                <th className="p-4 font-semibold">Total Stock</th>
                <th className="p-4 font-semibold">Featured</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => {
                const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                return (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{p.name}</div>
                          <div className="text-[10px] text-stone-400 line-clamp-1">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                        {p.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {p.variants.map((v) => (
                          <div key={v.id || v.weight} className="inline-flex items-center gap-1.5 mr-2 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded text-[11px]">
                            <span className="font-semibold text-stone-700">{v.weight}:</span>
                            <span className="font-bold text-emerald-700">₹{Number(v.price)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        totalStock === 0
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : totalStock < 20
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {totalStock} units
                      </span>
                    </td>
                    <td className="p-4">
                      {p.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[11px]">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Featured
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Standard</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Organic Mustard Oil"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="Describe nutritional value and origin..."
                />
              </div>

              {/* Direct Image File Upload & Preview */}
              <div className="space-y-2 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <label className="block font-semibold text-stone-700">Product Image</label>
                
                <div className="flex items-center gap-4">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg font-semibold text-stone-700 text-xs shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                            Uploading to Cloud...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-stone-500" />
                            Upload Image File
                          </>
                        )}
                      </button>
                      <span className="text-[10px] text-stone-400">PNG, JPG, WEBP up to 5MB</span>
                    </div>

                    {imageUploadError && (
                      <p className="text-[11px] text-red-600 font-medium">{imageUploadError}</p>
                    )}

                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-[11px] border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-500 bg-white"
                      placeholder="Or paste external image URL..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-200/60">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isFeatured" className="font-semibold text-stone-700 cursor-pointer">
                    Feature on Homepage Carousel
                  </label>
                </div>
              </div>

              {/* Package Variants Section */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                    Package Sizes, Pricing & Stock
                  </span>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="text-emerald-600 hover:text-emerald-700 font-bold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Size Variant
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2 items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">Weight / Size</label>
                        <input
                          type="text"
                          required
                          value={v.weight}
                          onChange={(e) => handleVariantChange(idx, 'weight', e.target.value)}
                          className="w-full px-2 py-1 border border-stone-200 rounded-lg text-xs bg-white"
                          placeholder="e.g. 500g, 1L"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={v.price}
                          onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                          className="w-full px-2 py-1 border border-stone-200 rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">Stock Count</label>
                        <input
                          type="number"
                          required
                          value={v.stock}
                          onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                          className="w-full px-2 py-1 border border-stone-200 rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-3">
                        <input
                          type="text"
                          value={v.sku || ''}
                          onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                          className="w-full px-2 py-1 border border-stone-200 rounded-lg text-xs font-mono text-[10px] bg-white"
                          placeholder="SKU"
                        />
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariantRow(idx)}
                            className="text-stone-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORIES MANAGEMENT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-base">Category Management</h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create Category Form */}
            <form onSubmit={handleCreateCategory} className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3 text-xs">
              <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wide">
                Create New Category
              </span>
              {categoryError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{categoryError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category Name (e.g. Cold-Pressed Oils)"
                  className="px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                />
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Description (Optional)"
                  className="px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={categorySaving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {categorySaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
                  Add Category
                </button>
              </div>
            </form>

            {/* Categories List */}
            <div className="space-y-2">
              <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wide">
                Existing Categories ({categories.length})
              </span>
              <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-xl">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-stone-50 text-xs">
                    <div>
                      <div className="font-bold text-stone-900">{cat.name}</div>
                      <div className="text-[10px] text-stone-400">
                        slug: <span className="font-mono">{cat.slug}</span>
                        {cat._count && ` • ${cat._count.products} products`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
