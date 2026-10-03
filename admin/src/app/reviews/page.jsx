'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/context/ToastContext';
import { apiClient } from '@/api/client';
import {
  Star,
  Plus,
  Trash2,
  CheckCircle,
  EyeOff,
  Eye,
  MessageSquare,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const DEFAULT_AVATARS = [
  '/testimonial_avatar.png',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces'
];

export default function ReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    title: '',
    comment: '',
    avatar: '/testimonial_avatar.png',
    isApproved: true,
    isTestimonial: true
  });

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/reviews/admin/all');
      setReviews(data.reviews || []);
    } catch (err) {
      console.warn('Failed to load reviews:', err.message);
      // Fallback sample reviews if empty
      setReviews([
        {
          _id: 'sample-1',
          customerName: 'Joseph',
          rating: 4.5,
          comment: '“I bought an e-book for my weekend trip and ended up finishing it in two days. The whole process was quick and easy.”',
          avatar: '/testimonial_avatar.png',
          isApproved: true,
          isTestimonial: true,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.comment.trim()) {
      showToast('Reviewer name and review text are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiClient('/reviews/admin/create', {
        method: 'POST',
        body: JSON.stringify({
          customerName: formData.customerName.trim(),
          rating: Number(formData.rating) || 5,
          title: formData.title.trim(),
          comment: formData.comment.trim(),
          avatar: formData.avatar || '/testimonial_avatar.png',
          isApproved: formData.isApproved,
          isTestimonial: formData.isTestimonial
        })
      });

      showToast('Review / Testimonial created successfully!', 'success');
      setIsModalOpen(false);
      setFormData({
        customerName: '',
        rating: 5,
        title: '',
        comment: '',
        avatar: '/testimonial_avatar.png',
        isApproved: true,
        isTestimonial: true
      });
      loadReviews();
    } catch (err) {
      showToast(err.message || 'Failed to create review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleApprove = async (id) => {
    try {
      const res = await apiClient(`/reviews/admin/${id}/approve`, {
        method: 'PUT'
      });
      showToast(res.message || 'Review status updated', 'success');
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isApproved: !r.isApproved } : r))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update review status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await apiClient(`/reviews/admin/${id}`, {
        method: 'DELETE'
      });
      showToast('Review deleted successfully', 'success');
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      showToast(err.message || 'Failed to delete review', 'error');
    }
  };

  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reviews &amp; Testimonials
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage store reviews, reader feedback, and homepage testimonials displayed under &quot;What Our Person&apos;s Say&quot;.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadReviews}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#152e72] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Review / Testimonial
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Reviews</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{reviews.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Approved / Active</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Average Rating</p>
              <div className="flex items-center gap-1.5 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">{avgRating}</h3>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">All Reviews</h2>
            <span className="text-xs text-slate-400">Total: {reviews.length}</span>
          </div>

          {reviews.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No reviews or testimonials added yet. Click &quot;Add Review / Testimonial&quot; to create one.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={rev.avatar || '/testimonial_avatar.png'}
                      alt={rev.customerName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-slate-900">{rev.customerName}</h4>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= Math.round(Number(rev.rating) || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-slate-500 font-medium ml-1">({rev.rating})</span>
                        </div>

                        {rev.isApproved ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                            Approved
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-medium">
                            Hidden
                          </span>
                        )}

                        {rev.isTestimonial && (
                          <span className="text-[10px] bg-blue-50 text-[#1E3A8A] border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                            Homepage Testimonial
                          </span>
                        )}
                      </div>

                      {rev.title && (
                        <p className="text-xs font-medium text-slate-800">{rev.title}</p>
                      )}

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-light">
                        {rev.comment}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Recently added'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleToggleApprove(rev._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        rev.isApproved
                          ? 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title={rev.isApproved ? 'Hide from store' : 'Approve for store'}
                    >
                      {rev.isApproved ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Approve
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(rev._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Review Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Review / Testimonial"
        >
          <form onSubmit={handleCreateReview} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reviewer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Joseph, Ananya S., Rahul K."
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Rating (1 to 5) *
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                  <option value={4.5}>⭐⭐⭐⭐½ 4.5 Stars</option>
                  <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                  <option value={3.5}>⭐⭐⭐½ 3.5 Stars</option>
                  <option value={3}>⭐⭐⭐ 3 Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Headline / Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fantastic reading experience!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Review / Testimonial Text *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Write the reader's review or testimonial quote here..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] leading-relaxed"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Avatar Photo
              </label>
              <div className="flex items-center gap-2 mb-2">
                {DEFAULT_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: url })}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform ${
                      formData.avatar === url
                        ? 'border-[#1E3A8A] scale-110 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or paste custom image URL"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 focus:outline-none"
              />
            </div>

            {/* Checkbox Options */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isTestimonial}
                  onChange={(e) => setFormData({ ...formData, isTestimonial: e.target.checked })}
                  className="rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
                <span>Display on Homepage under &quot;What Our Person&apos;s Say&quot;</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isApproved}
                  onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                  className="rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
                <span>Approve immediately (Make visible to readers)</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#152e72] rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Save Review'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
