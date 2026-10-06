'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';

export default function ContactSection({ showHeading = true }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        {/* Main Section Title */}
        {showHeading && (
          <h2 className="text-3xl sm:text-4xl text-slate-800 font-normal tracking-tight text-center mb-12 sm:mb-16">
            Stay Connected
          </h2>
        )}

        {/* Two-Column Grid matching Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 lg:gap-16 items-start">
          {/* Left Column: Google Map + Contact Details */}
          <div className="space-y-8">
            {/* Google Map Embed */}
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-200/90 shadow-xs bg-slate-100">
              <iframe
                title="LOGOS BOOKS Location Map"
                src="https://maps.google.com/maps?q=LOGOS%20BOOKS%2C%20near%20GHS%2C%20Vilayur%2C%20Kerala%20679309&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Reach Us Through */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                REACH US THROUGH
              </h3>

              <div className="space-y-4 text-xs sm:text-[13px] text-slate-600 font-light leading-relaxed">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-4 h-4 text-[#C48B47] shrink-0 mt-0.5" />
                  <p>
                    Logos books, Near GHS, River road, Vilayur Post,<br />
                    Pattambi via, Palakkad dist. Kerala 679309
                  </p>
                </div>

                {/* Phone Numbers */}
                <div className="flex items-start gap-3.5">
                  <Phone className="w-4 h-4 text-[#C48B47] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <a href="tel:8086126024" className="block hover:text-slate-900 transition-colors">
                      8086126024
                    </a>
                    <a href="tel:8281291849" className="block hover:text-slate-900 transition-colors">
                      8281291849
                    </a>
                    <a href="tel:8089762480" className="block hover:text-slate-900 transition-colors">
                      8089762480
                    </a>
                  </div>
                </div>

                {/* Main Email */}
                <div className="flex items-center gap-3.5">
                  <Mail className="w-4 h-4 text-[#C48B47] shrink-0" />
                  <a href="mailto:logospmna@gmail.com" className="hover:text-slate-900 transition-colors">
                    logospmna@gmail.com
                  </a>
                </div>

                {/* Publishing Email */}
                <div className="flex items-start gap-3.5">
                  <Mail className="w-4 h-4 text-[#C48B47] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-slate-500 text-[11px]">For publishing:</span>
                    <a href="mailto:publishinglogosbooks@gmail.com" className="hover:text-slate-900 transition-colors">
                      publishinglogosbooks@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Send Us A Message Form */}
          <div className="pt-2 md:pt-4">
            <h3 className="text-2xl sm:text-3xl text-slate-700 font-normal mb-6">
              Send Us A Message
            </h3>

            {submitted ? (
              <div className="py-10 px-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-semibold text-emerald-950">Message Sent!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed font-light">
                  Thank you for reaching out. We will get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', message: '' });
                  }}
                  className="mt-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-medium transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-[#EFEFEF] hover:bg-[#EAEAEA] focus:bg-white rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none border border-transparent focus:border-slate-300 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    required
                    placeholder="someone@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-3.5 bg-[#EFEFEF] hover:bg-[#EAEAEA] focus:bg-white rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none border border-transparent focus:border-slate-300 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <textarea
                    required
                    rows={5}
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-5 py-4 bg-[#EFEFEF] hover:bg-[#EAEAEA] focus:bg-white rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none border border-transparent focus:border-slate-300 transition-all resize-y min-h-[140px] shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#111111] hover:bg-black active:scale-[0.99] text-white rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
