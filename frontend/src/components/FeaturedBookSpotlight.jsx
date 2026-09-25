'use client';

import React from 'react';
import Link from 'next/link';

export const FeaturedBookSpotlight = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
        {/* Left: 3D Book Presentation Image */}
        <div className="flex justify-center items-center">
          <div className="relative max-w-[380px] w-full transition-transform duration-300 hover:scale-[1.02]">
            <img
              src="/featured_parajitha.png"
              alt="പരാജിതനായകർ - ടി. അനീഷ്"
              className="w-full h-auto object-contain select-none"
            />
          </div>
        </div>

        {/* Right: Book Details & CTA */}
        <div className="flex flex-col justify-center space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-slate-900 tracking-tight leading-tight">
            പരാജിതനായകർ
          </h2>

          <p className="text-base sm:text-lg font-bold text-slate-800">
            ടി. അനീഷ്
          </p>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify malayalam-desc">
            തമിഴ് സിനിമയും രാഷ്ട്രീയവും തമ്മിലുള്ള ആഴത്തിലുള്ള ബന്ധം വ്യക്തമാക്കുന്നതാണ് ഈ പുസ്തകം. എം.ജി.ആർ, ജയലളിത തുടങ്ങിയവർ തമിഴ് രാഷ്ട്രീയത്തിൽ വലിയ വിജയങ്ങൾ കൊയ്തപ്പോൾ, രാഷ്ട്രീയത്തിൽ പരാജയപ്പെടുകയോ അല്ലെങ്കിൽ വലിയ ചലനങ്ങൾ സൃഷ്ടിക്കാൻ കഴിയാതെ പോവുകയോ ചെയ്ത ശിവാജി ഗണേശൻ, വിജയകാന്ത്, കമൽ ഹാസൻ, രജനീകാന്ത് തുടങ്ങിയ താരങ്ങളുടെ രാഷ്ട്രീയ ശ്രമങ്ങളെയും അവരുടെ സിനിമകളെയും ഈ പുസ്തകം വിലയിരുത്തുന്നു. [1, 2]
          </p>

          <div className="pt-2">
            <Link
              href="/books/parajithanayakar"
              className="inline-flex items-center justify-center bg-[#224494] hover:bg-[#1a3678] text-white px-7 py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
