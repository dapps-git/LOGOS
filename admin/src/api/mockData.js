// Clean data definitions for LOGOS Store Admin
export const initialMockBooks = [];
export const initialMockBanners = [];
export const initialMockOrders = [];
export const initialMockCoupons = [
  {
    _id: 'cpn-welcome-100',
    code: 'WELCOME100',
    description: 'Welcome Offer: Flat ₹100 OFF on your first order above ₹500',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 500,
    usageLimit: 1000,
    usedCount: 0,
    isWelcomeCoupon: true,
    isActive: true
  }
];
export const initialMockReferrals = [];
export const initialMockReturns = [];
export const initialMockCustomers = [];

