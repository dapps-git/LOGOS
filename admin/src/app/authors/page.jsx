'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { useStoreData } from '@/context/StoreDataContext';
import { useToast } from '@/context/ToastContext';
import {
  Plus,
  Edit3,
  Trash2,
  User,
  Sparkles,
  CheckCircle,
  Eye,
  Search,
  Upload,
  BookOpen
} from 'lucide-react';

const SAMPLE_PORTRAITS = [
  { label: 'Rajesh K.R', url: '/author_rajesh.png' },
  { label: 'Author 1', url: '/author1.png' },
  { label: 'Author 2', url: '/author2.png' },
  { label: 'Author 3', url: '/author3.png' },
  { label: 'K.R. Meera', url: '/author_meera.png' },
  { label: 'Hemingway', url: '/author_hemingway.png' }
];

export default function AuthorsPage() {
  const { authors = [], addAuthor, updateAuthor, deleteAuthor, books = [] } = useStoreData();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    tagline: 'Meet the author',
    isSpotlight: false,
    bio: '',
    isActive: true
  });

  const handleOpenAdd = () => {
    setEditingAuthor(null);
    setFormData({
      name: '',
      photo: '',
      tagline: 'Meet the author',
      isSpotlight: false,
      bio: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name || '',
      photo: author.photo || author.image || '',
      tagline: author.tagline || 'Meet the author',
      isSpotlight: Boolean(author.isSpotlight),
      bio: author.bio || '',
      isActive: author.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setFormData((prev) => ({ ...prev, photo: base64 }));
        showToast('Author portrait loaded', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Author name is required', 'error');
      return;
    }

    if (formData.isSpotlight && !formData.bio.trim()) {
      showToast('Please add a biography / description for the spotlight author', 'error');
      return;
    }

    try {
      if (editingAuthor) {
        await updateAuthor(editingAuthor._id || editingAuthor.id, formData);
        showToast(`Author "${formData.name}" updated successfully!`, 'success');
      } else {
        await addAuthor(formData);
        showToast(`Author "${formData.name}" added successfully!`, 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save author', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAuthor(id);
      setDeleteConfirmId(null);
      showToast('Author removed successfully', 'info');
    } catch (err) {
      showToast('Failed to delete author', 'error');
    }
  };

  const handleToggleSpotlight = async (author) => {
    try {
      const nextSpotlight = !author.isSpotlight;
      await updateAuthor(author._id || author.id, { isSpotlight: nextSpotlight });
      showToast(
        nextSpotlight
          ? `"${author.name}" is now featured in "Meet the Author" Spotlight!`
          : `Removed "${author.name}" from Spotlight`,
        'success'
      );
    } catch {
      showToast('Failed to toggle spotlight', 'error');
    }
  };

  const filteredAuthors = authors.filter((a) =>
    (a.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const spotlightAuthor = authors.find((a) => a.isSpotlight && a.isActive);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Authors Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage author profiles, portrait photos, and feature authors in the homepage &ldquo;Meet the Author&rdquo; spotlight.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-md shadow-xs transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Author
          </button>
        </div>

        {/* Current Spotlight Banner Card */}
        {spotlightAuthor ? (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 p-5 rounded-xl border border-blue-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white shrink-0">
                <img
                  src={spotlightAuthor.photo || '/author_rajesh.png'}
                  alt={spotlightAuthor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/author_rajesh.png';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#1E3A8A] bg-blue-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#1E3A8A]" /> Active Homepage Spotlight
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{spotlightAuthor.name}</h3>
                <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 max-w-xl">
                  {spotlightAuthor.bio || 'No biography entered'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEdit(spotlightAuthor)}
              className="text-xs font-bold text-[#1E3A8A] bg-white hover:bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-md shadow-2xs transition-colors shrink-0"
            >
              Edit Spotlight
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>No author is currently highlighted in the &ldquo;Meet the Author&rdquo; section. Click &ldquo;Highlight&rdquo; on any author below to activate it.</span>
            </div>
          </div>
        )}

        {/* Authors List & Search Filter */}
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search authors..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-slate-900 outline-hidden"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total Authors: {filteredAuthors.length}
            </span>
          </div>

          {filteredAuthors.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <User className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No authors found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add authors with their photos and mark them as highlighted to feature them on the storefront homepage.
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-2 text-xs font-bold text-[#1E3A8A] bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-md"
              >
                + Add First Author
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAuthors.map((author) => {
                const id = author._id || author.id;
                return (
                  <div
                    key={id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs shrink-0">
                        <img
                          src={author.photo || author.image || '/author_rajesh.png'}
                          alt={author.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/author_rajesh.png';
                          }}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{author.name}</h4>
                          {author.isSpotlight && (
                            <span className="text-[9px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-full">
                              Meet the Author
                            </span>
                          )}
                          <Badge variant={author.isActive !== false ? 'success' : 'default'}>
                            {author.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        {author.bio ? (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-lg">
                            {author.bio}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-0.5">Featured Author (No description)</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleSpotlight(author)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 ${
                          author.isSpotlight
                            ? 'bg-blue-50 text-[#1E3A8A] border-blue-300 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                        title="Toggle Meet the Author Spotlight"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${author.isSpotlight ? 'text-[#1E3A8A]' : 'text-slate-400'}`} />
                        {author.isSpotlight ? 'Highlighted' : 'Highlight'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(author)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                        title="Edit Author"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(id)}
                        className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                        title="Delete Author"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add / Edit Author Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAuthor ? 'Edit Author' : 'Add New Author'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Author Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Author Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. രാജേഷ് കെ.ആർ (Rajesh K.R)"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-900 outline-hidden font-medium"
              />
            </div>

            {/* Author Portrait Photo */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Author Portrait Photo
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 bg-slate-50 shrink-0 flex items-center justify-center">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/author_rajesh.png';
                      }}
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    placeholder="Photo URL or /author1.png"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-900 outline-hidden"
                  />

                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    <label className="cursor-pointer font-bold text-blue-700 hover:underline flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      Upload File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-slate-300">|</span>
                    {SAMPLE_PORTRAITS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: p.url })}
                        className="text-slate-600 hover:underline"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox / Tick Mark: Highlight in Meet the Author Spotlight */}
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSpotlight}
                  onChange={(e) => setFormData({ ...formData, isSpotlight: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    Highlight in &ldquo;Meet the author&rdquo; Spotlight on Homepage
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-relaxed mt-0.5">
                    When checked, this author will be showcased in the dedicated &ldquo;Meet the author&rdquo; section on the storefront.
                  </span>
                </div>
              </label>

              {/* Conditional Biography Textarea */}
              {formData.isSpotlight && (
                <div className="space-y-1.5 pt-2 border-t border-blue-200/80 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-slate-800 block">
                    Author Biography / Description (Malayalam or English) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required={formData.isSpotlight}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Enter author biography, background, published works details..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-900 outline-hidden leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-500">
                    This biography will be displayed alongside the author&apos;s photo on the homepage.
                  </p>
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="authorActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] w-4 h-4"
              />
              <label htmlFor="authorActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Active in Storefront Catalog
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-md bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
              >
                {editingAuthor ? 'Update Author' : 'Save Author'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Author"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to remove this author profile?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 text-xs font-bold rounded-md bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
