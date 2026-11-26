'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ImageUploader } from '@/components/common/ImageUploader';
import { useStoreData } from '@/context/StoreDataContext';
import { useToast } from '@/context/ToastContext';
import { apiClient } from '@/api/client';
import {
  ArrowLeft,
  Save,
  BookOpen,
  Layers,
  DollarSign,
  CheckCircle2,
  User,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Loader2,
  Plus,
  X,
  Globe,
  Link2
} from 'lucide-react';

const COMMON_LANGUAGES = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Arabic', 'Kannada', 'Telugu', 'Bengali'];
const THEMES_LIST = ['Self-Help', 'Finance', 'Philosophy', 'Fiction', 'Science', 'History', 'Biography', 'Children', 'Poetry', 'Spirituality', 'Technology'];

const sanitizeSlugInput = (val) => {
  return String(val || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
};

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId');

  const { books = [], addBook, updateBook } = useStoreData();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesList, setCategoriesList] = useState(THEMES_LIST);
  const [showNewCategoryBox, setShowNewCategoryBox] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    seoTitle: '',
    metaDescription: '',
    coverAltText: '',
    author: '',
    authorPhoto: '',
    authorBio: '',
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
    spotlightDescription: '',
    images: [],
    sku: '',
    isbn: '',
    isBestSeller: false,
    isNewArrival: false,
    isBookOfTheWeek: false,
    isComingSoon: false,
    isPreBook: false,
    isFeatured: false,
    isHandpicked: false,
    isAuthorSpotlight: false,
    isFeaturedSpotlight: false,
    isBestAuthor: false,
    isActive: true
  });

  // Load dynamic categories from backend
  useEffect(() => {
    let active = true;
    apiClient('/categories')
      .then((res) => {
        if (!active || !Array.isArray(res?.categories)) return;
        const fetchedNames = res.categories.map((c) => (c.name || '').trim()).filter(Boolean);
        setCategoriesList((prev) => Array.from(new Set([...prev, ...fetchedNames])));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      showToast('Please enter a category name', 'error');
      return;
    }
    setCreatingCategory(true);
    try {
      const res = await apiClient('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: trimmed })
      });
      const createdName = res?.category?.name || trimmed;
      setCategoriesList((prev) => (prev.some((c) => c.toLowerCase() === createdName.toLowerCase()) ? prev : [...prev, createdName]));
      setFormData((prev) => ({ ...prev, theme: createdName }));
      setNewCategoryName('');
      setShowNewCategoryBox(false);
      showToast(`Category "${createdName}" added and selected!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
    } finally {
      setCreatingCategory(false);
    }
  };

  // Extract known authors from catalog for author mapping
  const knownAuthors = useMemo(() => {
    const map = new Map();
    map.set('രാജേഷ് കെ.ആർ', {
      name: 'രാജേഷ് കെ.ആർ',
      photo: '/author_rajesh.png',
      bio: "പത്തനംതിട്ട സ്വദേശിയായ അധ്യാപകനും എഴുത്തുകാരനുമാണ്. 'ഘടോൽക്കചൻ' അദ്ദേഹത്തിന്റെ ആദ്യ നോവലാണ്. മഹാഭാരതത്തിലെ ഘടോൽക്കചന്റെയും മൗർവിയുടെയും ജീവിതത്തെ വ്യത്യസ്തമായ രീതിയിൽ അവതരിപ്പിക്കുന്നതാണ് ഈ കൃതി."
    });
    map.set('ടി. അനീഷ്', {
      name: 'ടി. അനീഷ്',
      photo: '',
      bio: 'തമിഴ് സിനിമയും രാഷ്ട്രീയവും തമ്മിലുള്ള ആഴത്തിലുള്ള ബന്ധം വ്യക്തമാക്കുന്ന പുസ്തകങ്ങളുടെ രചയിതാവ്.'
    });

    books.forEach((b) => {
      const aName = (b.author || '').trim();
      if (aName) {
        const existing = map.get(aName) || {};
        map.set(aName, {
          name: aName,
          photo: b.authorPhoto || existing.photo || '',
          bio: b.authorBio || existing.bio || ''
        });
      }
    });

    return Array.from(map.values());
  }, [books]);

  const handleAuthorChange = (newAuthorName) => {
    const found = knownAuthors.find(
      (a) => a.name.trim().toLowerCase() === newAuthorName.trim().toLowerCase()
    );
    setFormData((prev) => ({
      ...prev,
      author: newAuthorName,
      authorPhoto: found?.photo ? found.photo : prev.authorPhoto,
      authorBio: found?.bio ? found.bio : prev.authorBio
    }));
  };

  const [isLoadingBook, setIsLoadingBook] = useState(Boolean(editId));

  // Load existing book if editing (supports local cache + direct API fetch for all paginated catalog books)
  useEffect(() => {
    if (!editId) {
      setIsLoadingBook(false);
      return;
    }

    let isMounted = true;

    const populateForm = (b) => {
      if (!b) return;
      const existingTheme = (b.theme || 'Self-Help').trim();
      if (existingTheme) {
        setCategoriesList((prev) => (prev.some((c) => c.toLowerCase() === existingTheme.toLowerCase()) ? prev : [...prev, existingTheme]));
      }
      setFormData({
        title: b.title || b.name || '',
        slug: b.slug || '',
        seoTitle: b.seoTitle || '',
        metaDescription: b.metaDescription || '',
        coverAltText: b.coverAltText || '',
        author: b.author || '',
        authorPhoto: b.authorPhoto || '',
        authorBio: b.authorBio || '',
        publisher: b.publisher || '',
        edition: b.edition || '1st Edition',
        theme: existingTheme || 'Self-Help',
        customTheme: '',
        languages: Array.isArray(b.languages) && b.languages.length > 0 ? b.languages : ['English'],
        pageCount: b.pageCount || 250,
        price: b.price !== undefined && b.price !== null ? b.price : '',
        discountPrice: b.discountPrice !== undefined && b.discountPrice !== null ? b.discountPrice : '',
        stock: b.stock !== undefined && b.stock !== null ? b.stock : 10,
        description: b.description || '',
        spotlightDescription: b.spotlightDescription || '',
        images: Array.isArray(b.images) && b.images.length > 0 ? b.images : (b.coverImage ? [b.coverImage] : (b.image ? [b.image] : [])),
        sku: b.sku || '',
        isbn: b.isbn || '',
        isBestSeller: Boolean(b.isBestSeller),
        isNewArrival: Boolean(b.isNewArrival),
        isBookOfTheWeek: Boolean(b.isBookOfTheWeek),
        isComingSoon: Boolean(b.isComingSoon),
        isPreBook: Boolean(b.isPreBook),
        isFeatured: Boolean(b.isFeatured),
        isHandpicked: Boolean(b.isHandpicked),
        isAuthorSpotlight: Boolean(b.isAuthorSpotlight),
        isFeaturedSpotlight: Boolean(b.isFeaturedSpotlight),
        isBestAuthor: Boolean(b.isBestAuthor),
        isActive: b.isActive !== false
      });
      setIsLoadingBook(false);
    };

    // 1. Try local cache first for instant populate
    if (books && books.length > 0) {
      const cached = books.find((b) => b._id === editId || b.id === editId);
      if (cached) {
        populateForm(cached);
      }
    }

    // 2. Fetch fresh full book details from backend API (covers every book across all catalog pages)
    apiClient(`/books/${editId}`)
      .then((res) => {
        if (!isMounted) return;
        const fetchedBook = res?.book || (res?._id ? res : null);
        if (fetchedBook) {
          populateForm(fetchedBook);
        }
      })
      .catch((err) => {
        console.warn('[EditBook] Direct book fetch error:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingBook(false);
      });

    return () => {
      isMounted = false;
    };
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

    const finalTheme = (formData.theme === 'Other' ? formData.customTheme : formData.theme) || 'General';
    const firstCover = (Array.isArray(formData.images) && (formData.images.find(img => typeof img === 'string' && img.trim() && !img.includes('placeholder')) || formData.images[0])) || '';
    const cleanedSlug = formData.slug ? sanitizeSlugInput(formData.slug).replace(/(^-|-$)/g, '') : '';

    const payload = {
      title: formData.title.trim(),
      name: formData.title.trim(),
      ...(cleanedSlug ? { slug: cleanedSlug } : {}),
      seoTitle: (formData.seoTitle || '').trim(),
      metaDescription: (formData.metaDescription || '').trim(),
      coverAltText: (formData.coverAltText || '').trim(),
      author: formData.author.trim(),
      authorPhoto: (formData.authorPhoto || '').trim(),
      authorBio: (formData.authorBio || '').trim(),
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
      spotlightDescription: (formData.spotlightDescription || '').trim(),
      images: formData.images,
      coverImage: firstCover,
      image: firstCover,
      sku: formData.sku || `LGS-BK-${Date.now().toString().slice(-5)}`,
      isbn: formData.isbn || '',
      isBestSeller: formData.isBestSeller,
      isNewArrival: formData.isNewArrival,
      isBookOfTheWeek: formData.isBookOfTheWeek,
      isComingSoon: formData.isComingSoon,
      isPreBook: formData.isComingSoon || formData.isPreBook,
      isFeatured: formData.isFeatured,
      isHandpicked: formData.isHandpicked,
      isAuthorSpotlight: formData.isAuthorSpotlight,
      isFeaturedSpotlight: formData.isFeaturedSpotlight || formData.isFeatured,
      isBestAuthor: formData.isBestAuthor,
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

          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            {isLoadingBook && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
            {editId ? 'Editing Existing Book' : 'New Product Wizard'}
          </span>
        </div>

        {/* Loading Indicator */}
        {isLoadingBook && (
          <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-md flex items-center gap-2.5 text-xs text-blue-900 font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
            <span>Loading book data from catalog...</span>
          </div>
        )}

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
              onChange={(imgs) => setFormData((prev) => ({ ...prev, images: imgs }))}
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

              {/* Author with mapping options */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Author <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Map or enter author</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="authors-datalist"
                    value={formData.author}
                    onChange={(e) => handleAuthorChange(e.target.value)}
                    placeholder="e.g. രാജേഷ് കെ.ആർ, ടി. അനീഷ്, M. Mukundan"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
                  />
                  <datalist id="authors-datalist">
                    {knownAuthors.map((a) => (
                      <option key={a.name} value={a.name} />
                    ))}
                  </datalist>
                </div>

                {/* Quick Author Mapping Chips */}
                {knownAuthors.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">Map to:</span>
                    {knownAuthors.slice(0, 5).map((a) => (
                      <button
                        key={a.name}
                        type="button"
                        onClick={() => handleAuthorChange(a.name)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                          formData.author.trim().toLowerCase() === a.name.trim().toLowerCase()
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                )}
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

            {/* Theme / Category */}
            <div className="pt-2">
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="block text-xs font-bold text-slate-800">
                  Category / Theme <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryBox((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#1E3A8A] hover:bg-[#152e72] text-white shadow-2xs transition-colors cursor-pointer"
                >
                  {showNewCategoryBox ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {showNewCategoryBox ? 'Close' : '+ Add New Category'}
                </button>
              </div>

              {showNewCategoryBox && (
                <div className="mb-3 p-3.5 rounded-lg border border-blue-200 bg-blue-50/60 space-y-2">
                  <p className="text-[11px] font-bold text-[#1E3A8A]">
                    Create New Category (instantly available &amp; selected for this book)
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                      placeholder="e.g. Malayalam Novel, Theology, Thriller..."
                      className="flex-1 px-3 py-2 bg-white border border-blue-300 focus:border-[#1E3A8A] rounded-md text-xs font-medium outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-md text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {creatingCategory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      {creatingCategory ? 'Adding...' : 'Create & Select'}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {categoriesList.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme })}
                    className={`px-3 py-2 rounded-md text-xs font-semibold border transition-all text-left truncate cursor-pointer ${
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

            {/* Badges & Section Placements */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-medium text-slate-800 mb-2">
                Storefront Section Placements & Badges
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.isBestSeller ? 'border-[#1E3A8A] bg-blue-50/50 text-[#1E3A8A]' : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-medium block">Best Seller ⭐</span>
                    <span className="text-[10px] text-slate-400 font-light block">Display in Bestsellers section</span>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.isNewArrival ? 'border-[#1E3A8A] bg-blue-50/50 text-[#1E3A8A]' : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-medium block">New Arrival 🚀</span>
                    <span className="text-[10px] text-slate-400 font-light block">Display in Fresh from Press</span>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.isBookOfTheWeek ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-bold shadow-2xs' : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isBookOfTheWeek}
                    onChange={(e) => setFormData({ ...formData, isBookOfTheWeek: e.target.checked })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-medium block">Book of the Week 👑</span>
                    <span className="text-[10px] text-slate-400 font-light block">Feature in homepage Book of the Week section</span>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.isComingSoon ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold shadow-2xs' : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isComingSoon}
                    onChange={(e) => setFormData({ ...formData, isComingSoon: e.target.checked, isPreBook: e.target.checked })}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-medium block">Coming Soon / Pre-Book ⏳</span>
                    <span className="text-[10px] text-slate-400 font-light block">Display in Coming Soon section with Pre-Book button (ships in 2-3 weeks)</span>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.isFeatured ? 'border-[#1E3A8A] bg-blue-50/50 text-[#1E3A8A]' : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-medium block">Featured Spotlight 🌟</span>
                    <span className="text-[10px] text-slate-400 font-light block">Highlight in main hero / spotlight</span>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.isHandpicked ? 'border-[#1E3A8A] bg-blue-50/50 text-[#1E3A8A]' : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isHandpicked}
                    onChange={(e) => setFormData({ ...formData, isHandpicked: e.target.checked })}
                    className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-medium block">Handpicked Reads 📖</span>
                    <span className="text-[10px] text-slate-400 font-light block">From our editors&apos; desks</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 4: Homepage Book Spotlight ("പരാജിതനായകർ") */}
          <div className="bg-white p-6 rounded-md border border-slate-200 shadow-2xs space-y-6">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Featured Book Spotlight (&ldquo;പരാജിതനായകർ&rdquo; Section)
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                User Side Showcase
              </span>
            </div>

            {/* Featured Book Spotlight Section */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeaturedSpotlight}
                  onChange={(e) => setFormData({ ...formData, isFeaturedSpotlight: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    Feature this Book in &ldquo;Featured Book Spotlight&rdquo; Section
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-relaxed mt-0.5">
                    Displays this book in the 3D book cover showcase section on the homepage (like &ldquo;പരാജിതനായകർ&rdquo;).
                  </span>
                </div>
              </label>

              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Custom Spotlight Synopsis / Highlight Copy (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.spotlightDescription}
                  onChange={(e) => setFormData({ ...formData, spotlightDescription: e.target.value })}
                  placeholder="Leave blank to use the product description, or enter custom highlight copy for the homepage..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-slate-900 rounded-md text-xs font-medium outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: URL Text (Slug) & SEO Optimization */}
          <div className="bg-white p-6 rounded-md border border-slate-200 shadow-2xs space-y-4">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#1E3A8A]" />
                SEO &amp; URL Settings
              </h3>
              <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Built-In SEO
              </span>
            </div>

            {/* URL Text / Slug */}
            <div>
              <div className="flex items-center justify-between mb-1 gap-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>URL Text (Page Slug)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const generated = sanitizeSlugInput(formData.title).replace(/(^-|-$)/g, '');
                    if (generated) {
                      setFormData((prev) => ({ ...prev, slug: generated }));
                    } else {
                      showToast('Enter an English book title or type a custom URL slug directly', 'info');
                    }
                  }}
                  className="text-[10px] font-bold text-[#1E3A8A] hover:underline cursor-pointer"
                >
                  Auto-generate from Title
                </button>
              </div>
              <div className="flex items-center rounded-md border border-slate-300 bg-slate-50 focus-within:border-slate-900 focus-within:bg-white overflow-hidden">
                <span className="px-3 py-2.5 text-[11px] font-mono text-slate-500 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                  /books/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: sanitizeSlugInput(e.target.value) })}
                  placeholder="e.g. atomic-habits (leave blank to auto-generate)"
                  className="w-full px-3 py-2.5 bg-transparent text-xs font-mono font-medium outline-hidden"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Customize the last segment of this book&apos;s URL. Only lowercase letters, numbers, and hyphens (-) are used.
              </p>
            </div>

            {/* SEO Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  SEO Title
                </label>
                <span className={`text-[10px] font-mono ${formData.seoTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                  {formData.seoTitle.length}/60 chars
                </span>
              </div>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder={formData.title ? `${formData.title} | LOGOS Books` : 'Custom Google search title (defaults to Book Title)'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Meta Description
                </label>
                <span className={`text-[10px] font-mono ${formData.metaDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                  {formData.metaDescription.length}/160 chars
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Write a concise summary for search engines (recommended 120-160 characters)..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
              />
            </div>

            {/* Book Cover Alt Text */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Book Cover Alt Text
              </label>
              <input
                type="text"
                value={formData.coverAltText}
                onChange={(e) => setFormData({ ...formData, coverAltText: e.target.value })}
                placeholder={formData.title ? `${formData.title} book cover by ${formData.author || 'LOGOS Books'}` : 'Descriptive alt text for cover image accessibility & SEO'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-md text-xs font-medium outline-hidden"
              />
            </div>

            {/* Live Search Result Preview */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Search Engine Preview</span>
              <p className="text-sm font-medium text-[#1a0dab] truncate">
                {formData.seoTitle || formData.title || 'Book Title | LOGOS Books'}
              </p>
              <p className="text-[11px] text-[#006621] font-mono truncate">
                https://logosbooks.in/books/{formData.slug || 'book-url-slug'}
              </p>
              <p className="text-[11px] text-slate-600 line-clamp-2">
                {formData.metaDescription || formData.description || 'Meta description will appear here in Google search results...'}
              </p>
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
