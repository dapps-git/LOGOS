import React from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductDetail } from '@/components/ProductDetail';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { RecommendedBooks } from '@/components/RecommendedBooks';
import { Footer } from '@/components/Footer';
import { fetchBookBySlugOrId } from '@/lib/api';

const DEFAULT_BOOK = {
  _id: '6ac8775feacfec1eea80cc70',
  title: 'Mani Muzhangunnathu Aarkku Vendi',
  name: 'മണിമുഴങ്ങുന്നത് ആർക്കുവേണ്ടി',
  slug: 'manimuzhangunnathu-aarkkuvendi',
  author: 'Ernest Hemingway',
  publisher: 'LOGOS BOOKS',
  edition: '1',
  theme: 'Historical Fiction, War Literature',
  language: 'Malayalam',
  pages: 146,
  isbn: '9789347536090',
  description: "Mani Muzhangunnathu Aarkkuvendi is the Malayalam translation of Ernest Hemingway's celebrated novel For Whom the Bell Tolls. Set against the backdrop of the Spanish Civil War, the novel follows Robert Jordan, an American volunteer fighting alongside the Republican forces. The story brings together themes of love, war, sacrifice, courage, death, and human relationships. Hemingway presents the emotional and psychological experiences of people caught in the middle of conflict.",
  price: 616.00,
  originalPrice: 860.00,
  rating: '5.4',
  gallery: [
    '/product_detail_main.png',
    '/product_thumb1.png',
    '/product_thumb2.png'
  ]
};

export default async function BookDetailPage({ params }) {
  const { slug } = await params;
  let bookData = await fetchBookBySlugOrId(slug);

  if (bookData) {
    bookData = {
      ...bookData,
      title: bookData.title || bookData.name || bookData.titleMalayalam,
      images: (bookData.images && bookData.images.length > 0)
        ? bookData.images
        : (bookData.coverImage ? [bookData.coverImage] : ['/book-placeholder.svg']),
      originalPrice: bookData.price,
      price: bookData.discountPrice || bookData.price,
      language: (bookData.languages && bookData.languages[0]) || bookData.language || 'Malayalam',
      pages: bookData.pageCount || bookData.pages || 123,
      theme: bookData.theme || bookData.genre || 'Novel',
      description: bookData.description || ''
    };
  } else {
    bookData = {
      ...DEFAULT_BOOK,
      title: slug ? decodeURIComponent(slug).replace(/-/g, ' ') : DEFAULT_BOOK.title
    };
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Capsule Floating Navbar */}
      <div className="relative w-full pb-20 sm:pb-24">
        <Navbar />
      </div>

      {/* Main Product Content */}
      <main className="flex-1">
        <ProductDetail book={bookData} />
        <RecentlyViewed />
        <RecommendedBooks />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
