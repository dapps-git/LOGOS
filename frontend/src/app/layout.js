import "./globals.css";

export const metadata = {
  title: "LOGOS Books | Malayalam & English Book Store",
  description: "Official online bookstore for LOGOS publications, bestsellers, new arrivals, and literature.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ml" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anek+Malayalam:wght@300;400;500;600;700&family=Gayathri:wght@400;700&family=Manjari:wght@400;700&family=Noto+Sans+Malayalam:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
