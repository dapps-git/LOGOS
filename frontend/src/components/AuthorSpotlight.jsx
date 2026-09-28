'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBooks } from '@/lib/api';

export const AuthorSpotlight = () => {
  const [authorData, setAuthorData] = useState({
    name: 'രാജേഷ് കെ.ആർ',
    bio: "പത്തനംതിട്ട സ്വദേശിയായ അധ്യാപകനും എഴുത്തുകാരനുമാണ്. 'ഘടോൽക്കചൻ' അദ്ദേഹത്തിന്റെ ആദ്യ നോവലാണ്. മഹാഭാരതത്തിലെ ഘടോൽക്കചന്റെയും മൗർവിയുടെയും ജീവിതത്തെ വ്യത്യസ്തമായ രീതിയിൽ അവതരിപ്പിക്കുന്നതാണ് ഈ കൃതി. വായനയോടുള്ള ഗൗരവമായ സമീപനം എം.എ. പഠനത്തിനു ശേഷമാണ് അദ്ദേഹത്തിൽ വളർന്നത്. കഥകളെക്കുറിച്ച് കുറിപ്പുകൾ എഴുതുകയും പിന്നീട് തിരക്കഥകൾ രചിക്കുകയും ചെയ്ത അനുഭവം അദ്ദേഹത്തിന്റെ നോവൽരചനയെയും സ്വാധീനിച്ചു.",
    image: '/author_rajesh.png',
    featuredBookSlug: 'ghadolkachan'
  });

  useEffect(() => {
    const loadAuthorBooks = async () => {
      try {
        const books = await fetchBooks({ author: 'രാജേഷ് കെ.ആർ' });
        if (Array.isArray(books) && books.length > 0) {
          const mainBook = books[0];
          setAuthorData((prev) => ({
            ...prev,
            name: mainBook.author || 'രാജേഷ് കെ.ആർ',
            featuredBookSlug: mainBook.slug || 'ghadolkachan'
          }));
        }
      } catch (err) {
        console.warn('[AuthorSpotlight] Backend fetch fallback:', err);
      }
    };

    loadAuthorBooks();
  }, []);

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
        {/* Left: Author Portrait Image */}
        <div className="flex justify-center items-center">
          <div className="relative max-w-[340px] w-full overflow-hidden rounded-md shadow-sm transition-transform duration-300 hover:scale-[1.02]">
            <img
              src={authorData.image}
              alt={authorData.name}
              className="w-full h-auto object-cover select-none"
              onError={(e) => {
                e.currentTarget.src = '/author_rajesh.png';
              }}
            />
          </div>
        </div>

        {/* Right: Author Biography & CTA */}
        <div className="flex flex-col justify-center space-y-4">
          <div>
            <Link
              href={`/products?author=${encodeURIComponent(authorData.name)}`}
              className="text-xs sm:text-sm font-medium text-[#224494] hover:text-[#1a3678] underline decoration-1 underline-offset-2 transition-colors inline-block mb-1"
            >
              Meet the author
            </Link>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-slate-900 tracking-tight leading-tight">
              {authorData.name}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify malayalam-desc">
            {authorData.bio}
          </p>

          <div className="pt-2">
            <Link
              href={`/products?author=${encodeURIComponent(authorData.name)}`}
              className="inline-flex items-center justify-center bg-[#224494] hover:bg-[#1a3678] text-white px-8 py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthorSpotlight;
