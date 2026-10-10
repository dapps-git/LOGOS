require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');

async function cleanDummyBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Clean] Connected to MongoDB');

    // Find all books
    const allBooks = await Book.find({});
    console.log(`[Clean] Total books in database: ${allBooks.length}`);

    let deleted = 0;
    for (const book of allBooks) {
      const imgs = book.images || [];
      const hasValidImage = imgs.length > 0 && imgs.some(img => {
        if (!img || typeof img !== 'string') return false;
        if (img === '/book-placeholder.svg') return false;
        if (img.includes('placeholder')) return false;
        // Keep valid local public assets or valid https urls
        return img.startsWith('/') || img.startsWith('http');
      });

      // Also check if images are empty array or broken
      if (!hasValidImage || imgs.length === 0) {
        console.log(`[Clean] Deleting book without valid images: "${book.title}" (${book._id})`);
        await Book.deleteOne({ _id: book._id });
        deleted++;
      }
    }

    console.log(`[Clean] Successfully removed ${deleted} books with missing or demo images.`);
    const remaining = await Book.find({});
    console.log(`[Clean] Remaining active books: ${remaining.length}`);
    remaining.forEach(b => console.log(` - ${b.title} (${b.images[0]})`));

    process.exit(0);
  } catch (err) {
    console.error('[Clean] Error:', err);
    process.exit(1);
  }
}

cleanDummyBooks();
