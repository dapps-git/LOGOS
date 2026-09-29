// Clean data definitions for LOGOS Store Admin
export const initialMockBooks = [];
export const initialMockBanners = [];
export const initialMockOrders = [];
export const initialMockCoupons = [];
export const initialMockReferrals = [];
export const initialMockReturns = [
  {
    _id: 'ret-101',
    orderNumber: 'GRV-158858-130',
    requestDate: '2026-09-19T10:30:00.000Z',
    customerName: 'afi',
    customerEmail: 'aifasa@gmail.com',
    customerPhone: '+91 98765 43210',
    reason: 'Received Wrong Product',
    evidence: null,
    refundAmount: 2533,
    status: 'Return Requested',
    pickupAddress: '123 Green Park, Calicut, Kerala',
    notes: 'Customer ordered Malayalam edition but received Hindi version.'
  },
  {
    _id: 'ret-102',
    orderNumber: 'GRV-865811-243',
    requestDate: '2026-09-04T14:15:00.000Z',
    customerName: 'Aifa sana uk',
    customerEmail: 'aifasanauk@gmail.com',
    customerPhone: '+91 98765 12345',
    reason: 'Color/Appearance Different',
    evidence: null,
    refundAmount: 1200,
    status: 'Refund Initiated',
    pickupAddress: 'Sector 4, Kochi, Kerala',
    notes: 'Hardcover edition cover shade differed from online listing.'
  }
];
export const initialMockCustomers = [];
