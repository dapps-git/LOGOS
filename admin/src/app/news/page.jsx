'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { useToast } from '@/context/ToastContext';
import { apiClient } from '@/api/client';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Video,
  Image as ImageIcon,
  Eye,
  Calendar,
  Sparkles,
  Loader2,
  Upload,
  ExternalLink,
  Tag,
  Play
} from 'lucide-react';

const CATEGORIES = [
  'General',
  'Book Launch',
  'Literary News',
  'Author Spotlight',
  'Events',
  'Reviews & Press'
];

const EMPTY_FORM = {
  title: '',
  summary: '',
  content: '',
  mediaType: 'image',
  mediaUrl: '',
  videoUrl: '',
  thumbnailUrl: '',
  author: 'LOGOS Editorial',
  category: 'General',
  tags: '',
  isFeatured: false,
  isActive: true
};

export default function NewsAdminPage() {
  const { showToast } = useToast();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Fetch articles
  const loadArticles = async () => {
    try {
      setLoading(true);
      const res = await apiClient('/news/admin/all?limit=100');
      if (Array.isArray(res?.articles)) {
        setArticles(res.articles);
      }
    } catch (err) {
      console.warn('[NewsAdminPage] Failed to load news:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setFormData({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (art) => {
    setEditingArticle(art);
    setFormData({
      title: art.title || '',
      summary: art.summary || '',
      content: art.content || '',
      mediaType: art.mediaType || 'image',
      mediaUrl: art.mediaUrl || '',
      videoUrl: art.videoUrl || '',
      thumbnailUrl: art.thumbnailUrl || '',
      author: art.author || 'LOGOS Editorial',
      category: art.category || 'General',
      tags: Array.isArray(art.tags) ? art.tags.join(', ') : '',
      isFeatured: Boolean(art.isFeatured),
      isActive: art.isActive !== false
    });
    setIsModalOpen(true);
  };

  // Upload file (Image or Video) to Cloudinary with automatic WebP compression
  const handleMediaUpload = async (e, type = 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size limit (up to 40MB for video, 10MB for image)
    const maxMb = type === 'video' ? 40 : 10;
    if (file.size > maxMb * 1024 * 1024) {
      showToast(`File size exceeds limit (${maxMb}MB). Please select a smaller file.`, 'error');
      return;
    }

    try {
      setUploadingMedia(true);
      showToast(`Uploading and compressing ${type} with Cloudinary...`, 'info');

      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result;
        try {
          const res = await apiClient('/news/upload-media', {
            method: 'POST',
            body: JSON.stringify({ file: base64, mediaType: type })
          });

          if (res?.success) {
            setFormData((prev) => ({
              ...prev,
              mediaUrl: res.mediaUrl,
              thumbnailUrl: res.thumbnailUrl || res.mediaUrl,
              videoUrl: type === 'video' ? res.mediaUrl : prev.videoUrl
            }));
            showToast(`${type === 'video' ? 'Video' : 'Image'} uploaded & converted to WebP successfully!`, 'success');
          } else {
            showToast(res?.message || 'Failed to upload media', 'error');
          }
        } catch (err) {
          showToast(`Upload failed: ${err.message}`, 'error');
        } finally {
          setUploadingMedia(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadingMedia(false);
      showToast(err.message, 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    if (!formData.content.trim()) {
      showToast('Content is required', 'error');
      return;
    }

    try {
      setSavingArticle(true);
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      };

      if (editingArticle?._id) {
        const res = await apiClient(`/news/${editingArticle._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (res?.success) {
          showToast('Article updated successfully!', 'success');
          setIsModalOpen(false);
          loadArticles();
        }
      } else {
        const res = await apiClient('/news', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res?.success) {
          showToast('News article published successfully!', 'success');
          setIsModalOpen(false);
          loadArticles();
        }
      }
    } catch (err) {
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSavingArticle(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiClient(`/news/${id}`, { method: 'DELETE' });
      if (res?.success) {
        showToast('Article deleted', 'info');
        setDeleteConfirmId(null);
        setArticles((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  const handleToggleActive = async (art) => {
    try {
      const res = await apiClient(`/news/${art._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !art.isActive })
      });
      if (res?.success) {
        setArticles((prev) =>
          prev.map((a) => (a._id === art._id ? { ...a, isActive: !a.isActive } : a))
        );
        showToast(`Article marked as ${!art.isActive ? 'Active' : 'Draft'}`, 'success');
      }
    } catch (err) {
      showToast(`Status update failed: ${err.message}`, 'error');
    }
  };

  // Filtered Articles
  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title?.toLowerCase().includes(search.toLowerCase()) ||
      art.summary?.toLowerCase().includes(search.toLowerCase()) ||
      art.author?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || art.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              News & Blog Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Publish literary news, book launch announcements, author video interviews, and press stories.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add News / Blog Article
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white border border-slate-200 rounded-md">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Articles</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{articles.length}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-md">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Published Active</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {articles.filter((a) => a.isActive !== false).length}
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-md">
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Video Stories</p>
            <p className="text-2xl font-black text-blue-700 mt-1">
              {articles.filter((a) => a.mediaType === 'video').length}
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-md">
            <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Total Views</p>
            <p className="text-2xl font-black text-purple-700 mt-1">
              {articles.reduce((acc, a) => acc + (a.viewsCount || 0), 0)}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-white border border-slate-200 rounded-md flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search news by title, summary, author..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* News Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[280px]">Article & Media</th>
                  <th className="py-3 px-4 font-bold min-w-[130px]">Category</th>
                  <th className="py-3 px-4 font-bold min-w-[140px]">Author & Date</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[90px]">Type</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[80px]">Views</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[90px]">Status</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[110px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading news articles...
                    </td>
                  </tr>
                ) : filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No news articles found. Click &quot;Add News / Blog Article&quot; to publish your first post.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((art) => {
                    const thumb = art.thumbnailUrl || art.mediaUrl || '/book-placeholder.svg';
                    const isVid = art.mediaType === 'video';

                    return (
                      <tr key={art._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0 w-16 h-12 bg-slate-100 rounded-md overflow-hidden border border-slate-200">
                              <img
                                src={thumb}
                                alt={art.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/book-placeholder.svg';
                                }}
                              />
                              {isVid && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Play className="w-4 h-4 text-white fill-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-sm">
                              <p className="font-bold text-slate-900 truncate">{art.title}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {art.summary || art.content.slice(0, 80)}
                              </p>
                              {art.isFeatured && (
                                <span className="inline-block mt-1 text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded-sm">
                                  ★ Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-middle">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            {art.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 align-middle text-slate-600">
                          <p className="font-medium">{art.author}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(art.publishedAt || art.createdAt).toLocaleDateString()}
                          </p>
                        </td>

                        <td className="py-3 px-4 text-center align-middle">
                          {isVid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              <Video className="w-3 h-3" /> Video
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              <ImageIcon className="w-3 h-3" /> Image
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center align-middle font-mono font-medium text-slate-600">
                          {art.viewsCount || 0}
                        </td>

                        <td className="py-3 px-4 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(art)}
                            className="cursor-pointer"
                          >
                            <Badge variant={art.isActive !== false ? 'success' : 'default'}>
                              {art.isActive !== false ? 'Active' : 'Draft'}
                            </Badge>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right align-middle">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(art)}
                              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                              title="Edit Article"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(art._id)}
                              className="p-1.5 rounded-md text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-slate-200 transition-colors"
                              title="Delete Article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Article Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingArticle ? 'Edit News / Blog Article' : 'Publish New Article'}
            subtitle="Uploaded images and videos are automatically compressed and saved in Cloudinary (WebP format)."
            maxWidth="max-w-3xl"
          >
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Masterpiece Malayalam Novel Wins International Literary Award"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-900 focus:outline-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Author / Byline
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="LOGOS Editorial"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Summary / Short Excerpt
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief 1-2 sentence hook for cards and search snippets"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              {/* Media Type Selector */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase">Article Media Type:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mediaType: 'image' })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all ${
                        formData.mediaType === 'image'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Image Article
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mediaType: 'video' })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all ${
                        formData.mediaType === 'video'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      Video Story
                    </button>
                  </div>
                </div>

                {formData.mediaType === 'image' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Upload Featured Image (Converts to WebP in Cloudinary)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-md text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingMedia ? 'Compressing...' : 'Select Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMediaUpload(e, 'image')}
                          disabled={uploadingMedia}
                          className="hidden"
                        />
                      </label>
                      {formData.mediaUrl && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                          <img
                            src={formData.mediaUrl}
                            alt="Preview"
                            className="w-10 h-8 object-cover rounded border border-slate-200"
                          />
                          <span>WebP Stored in Cloudinary ✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Video Source (Cloudinary Upload or YouTube / Vimeo URL)
                      </label>
                      <input
                        type="text"
                        value={formData.videoUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            videoUrl: e.target.value,
                            mediaUrl: e.target.value
                          })
                        }
                        placeholder="https://www.youtube.com/watch?v=... or direct video URL"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Or Upload Video File (MP4/WebM to Cloudinary)
                      </label>
                      <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-md text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingMedia ? 'Uploading Video...' : 'Upload Video File'}</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          onChange={(e) => handleMediaUpload(e, 'video')}
                          disabled={uploadingMedia}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Article Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full news story, interview transcript, or press release here..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-hidden focus:border-slate-400 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="BookLaunch, Malayalam, Award, Fiction"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded text-slate-900 focus:ring-0"
                    />
                    <span className="text-xs font-bold text-slate-800">Featured Article</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-slate-900 focus:ring-0"
                    />
                    <span className="text-xs font-bold text-slate-800">Publish Immediately</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingArticle || uploadingMedia}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {savingArticle ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingArticle ? 'Update Article' : 'Publish Article'}</span>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <Modal
            isOpen={Boolean(deleteConfirmId)}
            onClose={() => setDeleteConfirmId(null)}
            title="Delete News Article"
            maxWidth="max-w-md"
          >
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete this article? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}

