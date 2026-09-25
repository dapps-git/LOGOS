'use client';

import React from 'react';

export const HeroBanner = () => {
  return (
    <section className="relative w-full overflow-hidden">
      <img
        src="/banner.png"
        alt="ഋതുക്കളെ തോൽപ്പിച്ച മരം - വി. ടി. പ്രതീഷ്"
        className="w-full h-[440px] sm:h-[520px] md:h-screen md:min-h-[600px] object-cover object-[86%_25%] md:object-center select-none block"
      />
    </section>
  );
};
