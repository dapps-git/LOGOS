'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ImageUploader } from '@/components/common/ImageUploader';
import { useStoreData } from '@/context/StoreDataContext';
import { useToast } from '@/context/ToastContext';
import {
  ArrowLeft,
  Save,
  BookOpen,
  Layers,
  DollarSign,
  CheckCircle2
} from 'lucide-react';

const COMMON_LANGUAGES = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Arabic', 'Kannada', 'Telugu', 'Bengali'];
const THEMES_LIST = ['Self-Help', 'Finance', 'Philosophy', 'Fiction', 'Science', 'History', 'Biography', 'Children', 'Poetry', 'Spirituality', 'Technology'];

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId');

  const { books = [], addBook, updateBook } = useStoreData();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    edition: '1st Edition',
    theme: 'Self-Help',
    customTheme: '',
    languages: ['English'],
    pageCount: 280,
    price: '',
    discountPrice: '',
    stock: 25,
    description: '',
    images: [],
    sku: '',
    isbn: '',
    isBestSeller: false,
    isNewArrival: true,
    isFeatured: false,
    isActive: true
  });

  // Load existing book if editing
  useEffect(() => {
    if (editId && books.length > 0) {
      const bookToEdit = books.find((b) => b._id === editId);
      if (bookToEdit) {
        setFormData({
          title: bookToEdit.title || bookToEdit.name || '',
          author: bookToEdit.author || '',
          publisher: bookToEdit.publisher || '',
          edition: bookToEdit.edition || '1st Edition',
          theme: THEMES_LIST.includes(bookToEdit.theme) ? bookToEdit.theme : 'Other',
          customTheme: THEMES_LIST.includes(bookToEdit.theme) ? '' : bookToEdit.theme,
          languages: bookToEdit.languages || ['English'],
          pageCount: bookToEdit.pageCount || 250,
          price: bookToEdit.price || '',
          discountPrice: bookToEdit.discountPrice || '',
          stock: bookToEdit.stock !== undefined ? bookToEdit.stock : 10,
          description: bookToEdit.description || '',
          images: bookToEdit.images || [],
          sku: bookToEdit.sku || '',
          isbn: bookToEdit.isbn || '',
          isBestSeller: Boolean(bookToEdit.isBestSeller),
          isNewArrival: Boolean(bookToEdit.isNewArrival),
          isFeatured: Boolean(bookToEdit.isFeatured),
          isActive: bookToEdit.isActive !== false
        });
      }
    }
  }, [editId, books]);

  const toggleLanguage = (lang) => {
    setFormData((prev) => {
      const exists = prev.languages.includes(lang);
      if (exists) {
        if (prev.languages.length === 1) return prev; // keep at least 1
        return { ...prev, languages: prev.languages.filter((l) => l !== lang) };
      }
      return { ...prev, languages: [...prev.languages, lang] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Product title / book name is required', 'error');
      return;
    }
    if (!formData.author.trim()) {
      showToast('Author name is required', 'error');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      showToast('Please specify a valid price / rate', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showToast('Product description is required', 'error');
      return;
    }
    if (!formData.images || formData.images.length === 0) {
      showToast('Please attach at least 1 image (up to 3+ recommended)', 'error');
      return;
    }

    const finalTheme = formData.theme === 'Other' ? (formData.customTheme || 'General') : formData.theme;

    const payload = {
      title: formData.title.trim(),
      name: formData.title.trim(),
      author: formData.author.trim(),
      publisher: formData.publisher.trim() || 'LOGOS Publishing',
      edition: formData.edition.trim() || '1st Edition',
      theme: finalTheme,
      genre: finalTheme,
      category: 'Books',
      languages: formData.languages,
      pageCount: Number(formData.pageCount) || 250,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      stock: Number(formData.stock),
      description: formData.description.trim(),
      images: formData.images,
      sku: formData.sku || `LGS-BK-${Date.now().toString().slice(-5)}`,
      isbn: formData.isbn || '',
      isBestSeller: formData.isBestSeller,
      isNewArrival: formData.isNewArrival,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive
    };

    setIsSubmitting(true);
    try {
      if (editId) {
        await updateBook(editId, payload);
        showToast(`Book "${payload.title}" updated successfully!`, 'success');
      } else {
        await addBook(payload);
        showToast(`Book "${payload.title}" added to catalog with ${payload.images.length} photos!`, 'success');
      }
      router.push('/products');
    } catch (err) {
      showToast(err.message || 'Error saving book', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-md transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Products
          </Link>

          <span className="text-xs font-semibold text-slate-400">
            {editId ? 'Editing Existing Book' : 'New Product Wizard'}
          </span>
        </div>

        {/* Title Card */}
        <div className="bg-white p-6 rounded-md border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-md bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {editId ? 'Edit Product Details' : 'Add New Book Product'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Attach product photos (up to 3+ images), language, author, publisher, rate, and stock status.
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Product Images (Up to 3+ images) */}
          <div className="bg-white p-6 rounded-md border border-slate-200 shadow-2xs">
            <ImageUploader
              images={formData.images}
              onChange={(imgs) => setFormData({ ...formData, images: imgs })}
              minImages={3}
              maxImages={6}
            />
          </div>

          {/* SECTION 2: General Book Details */}
          <div className="bg-white p-6 rounded-md border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-800" />
              General Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Product Name / Book Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Atomic Habits, The Psychology of Money"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Author <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g. James Clear, Morgan Housel"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
                />
              </div>

              {/* Publisher */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Publisher
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  placeholder="e.g. Penguin Random House, HarperCollins"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
                />
              </div>

              {/* Edition */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Edition
                </label>
                <input
                  type="text"
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  placeholder="e.g. 1st Edition, Paperback, Hardcover Collector"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
                />
              </div>

              {/* Page Count */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Page Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
                />
              </div>
            </div>

            {/* Theme / Genre */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Theme / Genre <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {THEMES_LIST.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme })}
                    className={`px-3 py-2 rounded-md text-xs font-semibold border transition-all text-left ${
                      formData.theme === theme
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages Multi-Selector */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Available Languages <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-400 mb-2">Select all languages available for this title edition:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_LANGUAGES.map((lang) => {
                  const isSelected = formData.languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {lang}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Product Description & Synopsis <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write an engaging overview of the book, key takeaways, and why readers love it..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
              />
            </div>
          </div>

          {/* SECTION 3: Pricing & Inventory */}
          <div className="bg-white p-6 rounded-md border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-800" />
              Pricing & Stock Management
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Original Rate / Price */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Original Rate (MRP ₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="799"
                    className="w-full pl-7 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
                  />
                </div>
              </div>

              {/* Discount Price */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Discounted Selling Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="499"
                    className="w-full pl-7 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
                  />
                </div>
                {formData.price && formData.discountPrice && Number(formData.discountPrice) < Number(formData.price) && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">
                    🎉 Save {Math.round(((formData.price - formData.discountPrice) / formData.price) * 100)}% OFF
                  </p>
                )}
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Inventory Stock Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="50"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Status: {formData.stock === 0 ? '❌ Out of stock' : formData.stock <= 5 ? '⚠️ Low stock alert' : '✅ In stock'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="LGS-BK-1001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ISBN Barcode Number
                </label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  placeholder="978-0735211292"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
                />
              </div>
            </div>

            {/* Badges & Flags */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isBestSeller}
                  onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-500 w-4 h-4"
                />
                Best Seller Badge ⭐
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-500 w-4 h-4"
                />
                New Arrival 🚀
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-500 w-4 h-4"
                />
                Featured in Spotlight 🌟
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/products"
              className="px-5 py-2.5 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold rounded-md bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : editId ? 'Update Product' : 'Save & Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default function ProductAddOrEditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading product form...</div>}>
      <ProductFormContent />
    </Suspense>
  );
}
