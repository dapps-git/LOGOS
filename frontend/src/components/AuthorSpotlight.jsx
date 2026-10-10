'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchSpotlightAuthor } from '@/lib/api';
import { AuthorSpotlightSkeleton } from '@/components/Skeletons';

export const AuthorSpotlight = () => {
  const [authorData, setAuthorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSpotlight = async () => {
      try {
        const spotlight = await fetchSpotlightAuthor();
        if (isMounted && spotlight && spotlight.name) {
          setAuthorData({
            name: spotlight.name,
            bio: spotlight.bio,
            image: spotlight.photo || spotlight.image || '/author_rajesh.png',
            featuredBookSlug: spotlight.featuredBookSlug
          });
        }
      } catch (err) {
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSpotlight();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <AuthorSpotlightSkeleton />;
  if (!authorData) return null;

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

        {/* Right: Author Biography */}
        <div className="flex flex-col justify-center space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-slate-900 tracking-tight leading-tight">
              {authorData.name}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify malayalam-desc">
            {authorData.bio}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AuthorSpotlight;
