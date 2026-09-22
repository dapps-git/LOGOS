require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Book = require('../models/Book');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const Category = require('../models/Category');

const seedData = async () => {
  try {
    console.log('[LOGOS Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[LOGOS Seed] MongoDB Connected.');

    // 1. Seed Admin
    console.log('[LOGOS Seed] Seeding Admin...');
    const adminEmail = process.env.ADMIN_EMAIL || 'logosadmin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'LogosAdmin@2026';

    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      admin = await Admin.create({
        name: 'LOGOS Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'superadmin'
      });
      console.log(`[LOGOS Seed] Admin created: ${adminEmail}`);
    } else {
      console.log(`[LOGOS Seed] Admin already exists: ${adminEmail}`);
    }

    // 2. Seed Categories / Themes
    console.log('[LOGOS Seed] Seeding Categories...');
    const categories = [
      { name: 'Fiction & Literature', theme: 'Fiction', description: 'Timeless classics, modern masterpieces, and unforgettable novels.' },
      { name: 'Science Fiction & Fantasy', theme: 'Sci-Fi', description: 'Epic space operas, futuristic technologies, and mystical realms.' },
      { name: 'Self-Help & Philosophy', theme: 'Philosophy', description: 'Transformative guides for wisdom, habits, mindset, and peak living.' },
      { name: 'Business & Finance', theme: 'Business', description: 'Strategic insights into economics, venture building, and wealth creation.' },
      { name: 'History & Biography', theme: 'History', description: 'Deep chronicles of world history and legendary lives.' }
    ];

    for (const cat of categories) {
      await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
    }

    // 3. Seed Books (each with 3 photos: front cover, back/spine, interior sample)
    console.log('[LOGOS Seed] Seeding Books...');
    const sampleBooks = [
      {
        title: 'The Midnight Library',
        author: 'Matt Haig',
        publisher: 'Canongate Books',
        edition: "Collector's Hardcover Edition",
        theme: 'Fiction',
        languages: ['English'],
        pageCount: 304,
        description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
        price: 599,
        discountPrice: 449,
        stock: 45,
        sku: 'LGS-BK-001',
        isbn: '978-0525559474',
        images: [
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
        ],
        isBestSeller: true,
        isNewArrival: false,
        isFeatured: true,
        rating: 4.8,
        reviewsCount: 124
      },
      {
        title: 'Atomic Habits: Tiny Changes, Remarkable Results',
        author: 'James Clear',
        publisher: 'Avery / Penguin Random House',
        edition: 'International Bestseller Edition',
        theme: 'Self-Help & Philosophy',
        languages: ['English', 'Hindi'],
        pageCount: 320,
        description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master tiny behaviors.',
        price: 799,
        discountPrice: 599,
        stock: 80,
        sku: 'LGS-BK-002',
        isbn: '978-0735211292',
        images: [
          'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80'
        ],
        isBestSeller: true,
        isNewArrival: false,
        isFeatured: true,
        rating: 4.9,
        reviewsCount: 340
      },
      {
        title: 'Dune: The Deluxe Illustrated Edition',
        author: 'Frank Herbert',
        publisher: 'Ace Books / Berkley',
        edition: 'Deluxe Illustrated Hardcover',
        theme: 'Science Fiction & Fantasy',
        languages: ['English'],
        pageCount: 688,
        description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who would become the mysterious man known as Muad’Dib. A stunning blend of adventure and mysticism, environmentalism and politics.',
        price: 1499,
        discountPrice: 1199,
        stock: 25,
        sku: 'LGS-BK-003',
        isbn: '978-0593099018',
        images: [
          'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80'
        ],
        isBestSeller: true,
        isNewArrival: true,
        isFeatured: true,
        rating: 4.9,
        reviewsCount: 215
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        publisher: 'Harper / HarperCollins',
        edition: '10th Anniversary Expanded Edition',
        theme: 'History & Biography',
        languages: ['English'],
        pageCount: 464,
        description: 'From a renowned historian comes a groundbreaking narrative of humanity’s creation and evolution—a #1 international bestseller—that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be “human.”',
        price: 899,
        discountPrice: 699,
        stock: 50,
        sku: 'LGS-BK-004',
        isbn: '978-0062316097',
        images: [
          'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=800&q=80'
        ],
        isBestSeller: false,
        isNewArrival: true,
        isFeatured: true,
        rating: 4.7,
        reviewsCount: 98
      },
      {
        title: 'The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness',
        author: 'Morgan Housel',
        publisher: 'Harriman House',
        edition: 'Special Indian Edition',
        theme: 'Business & Finance',
        languages: ['English', 'Hindi', 'Malayalam'],
        pageCount: 256,
        description: 'Doing well with money isn’t necessarily about what you know. It’s about how you behave. And behavior is hard to teach, even to really smart people. Morgan Housel shares 19 short stories exploring the strange ways people think about money.',
        price: 499,
        discountPrice: 399,
        stock: 65,
        sku: 'LGS-BK-005',
        isbn: '978-9390166268',
        images: [
          'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80'
        ],
        isBestSeller: true,
        isNewArrival: true,
        isFeatured: true,
        rating: 4.8,
        reviewsCount: 180
      }
    ];

    for (const b of sampleBooks) {
      const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existing = await Book.findOne({ sku: b.sku });
      if (existing) {
        Object.assign(existing, b);
        if (!existing.slug) existing.slug = slug;
        await existing.save();
      } else {
        await Book.create({ ...b, slug });
      }
    }

    // 4. Seed Banners
    console.log('[LOGOS Seed] Seeding Banners...');
    const banners = [
      {
        title: 'Curated Stories for the Discerning Reader',
        subtitle: 'Explore 10,000+ handpicked editions across genres',
        description: 'Immerse yourself in world-class fiction, philosophy, and collectors editions.',
        badge: 'Spring Literary Festival',
        image: 'https://images.unsplash.com/photo-1507842229450-7622998f4115?auto=format&fit=crop&w=1600&q=80',
        link: '/books',
        buttonText: 'Discover All Books',
        position: 'hero',
        order: 1
      },
      {
        title: 'Epic Science Fiction & Fantasy Collection',
        subtitle: 'From Dune to The Lord of the Rings',
        badge: 'Featured Spotlight',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=80',
        link: '/books?theme=Sci-Fi',
        buttonText: 'Explore Sci-Fi',
        position: 'featured',
        order: 2
      }
    ];

    for (const ban of banners) {
      await Banner.findOneAndUpdate({ title: ban.title }, ban, { upsert: true, new: true });
    }

    // 5. Seed Coupons
    console.log('[LOGOS Seed] Seeding Coupons...');
    const coupons = [
      {
        code: 'WELCOME10',
        description: '10% off on your welcome order (Non-referral signups)',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 299,
        maxDiscount: 200,
        isWelcomeCoupon: true,
        isActive: true
      },
      {
        code: 'BOOKWORM20',
        description: 'Flat 20% discount on orders above ₹999',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 999,
        maxDiscount: 400,
        isWelcomeCoupon: false,
        isActive: true
      },
      {
        code: 'LOGOS100',
        description: 'Flat ₹100 off on premium collection purchases',
        discountType: 'fixed',
        discountValue: 100,
        minOrderValue: 599,
        isWelcomeCoupon: false,
        isActive: true
      }
    ];

    for (const coup of coupons) {
      await Coupon.findOneAndUpdate({ code: coup.code }, coup, { upsert: true, new: true });
    }

    console.log('[LOGOS Seed] Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[LOGOS Seed Error]', err);
    process.exit(1);
  }
};

seedData();
