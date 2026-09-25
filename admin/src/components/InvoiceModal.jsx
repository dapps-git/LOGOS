'use client';

import React from 'react';
import { Modal } from './common/Modal';
import { Printer, BookOpen, ShieldCheck } from 'lucide-react';
import { Badge } from './common/Badge';

export const InvoiceModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const invoiceNumber = `INV-${order.orderNumber ? order.orderNumber.replace('#', '') : (order._id || '').slice(-6).toUpperCase()}`;
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const subtotal = order.subtotal || order.totalAmount || 0;
  const discount = order.discount || 0;
  const shippingFee = order.shippingFee || 0;
  const gstAmount = Math.round(subtotal * 0.05); // 5% GST
  const finalTotal = order.finalTotal || order.totalAmount || subtotal;

  const handlePrint = () => {
    const elem = document.getElementById('printable-invoice');
    if (!elem) {
      window.print();
      return;
    }

    const printWin = window.open('', '_blank', 'width=900,height=800');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${invoiceNumber}</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
              body { background: #fff; color: #0f172a; padding: 24px; font-size: 12px; }
              table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; }
              th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 11px; }
              th { background: #f1f5f9; text-transform: uppercase; font-size: 10px; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-bold { font-weight: 700; }
              @media print {
                body { padding: 0; }
                @page { margin: 1cm; size: auto; }
              }
            </style>
          </head>
          <body>
            ${elem.innerHTML}
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWin.document.close();
    } else {
      window.print();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tax Invoice ${invoiceNumber}`} maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Printable Area */}
        <div id="printable-invoice" className="p-6 sm:p-8 bg-white border border-slate-300 rounded-md text-slate-900">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">LOGOS Bookstore</h2>
                <p className="text-xs text-slate-600 font-semibold">Official GST Tax Invoice & Retail Receipt</p>
                <p className="text-[11px] text-slate-500 font-mono">GSTIN: 32AAACL1902K1Z8 | Kerala, India</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div>
                <Badge variant={order.paymentStatus === 'Paid' ? 'delivered' : 'pending'}>
                  {order.paymentStatus === 'Paid' ? 'PAID ONLINE' : 'PAYMENT PENDING (COD)'}
                </Badge>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-1">Invoice: {invoiceNumber}</p>
              <p className="text-xs text-slate-600 font-medium">Date: {invoiceDate}</p>
            </div>
          </div>

          {/* Billing & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-slate-200 text-xs">
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Billed To (Customer)
              </p>
              <h4 className="font-bold text-slate-900 text-sm">{order.customer?.name || order.shippingAddress?.fullName || 'Customer'}</h4>
              <p className="text-slate-700 mt-0.5">{order.shippingAddress?.streetAddress || 'Address on file'}</p>
              <p className="text-slate-700">
                {order.shippingAddress?.city || ''}, {order.shippingAddress?.state || ''} {order.shippingAddress?.postalCode ? `- ${order.shippingAddress.postalCode}` : ''}
              </p>
              <p className="text-slate-700 mt-1"><span className="font-semibold">Phone:</span> {order.customer?.phone || order.shippingAddress?.phone || 'N/A'}</p>
              <p className="text-slate-700"><span className="font-semibold">Email:</span> {order.customer?.email || 'N/A'}</p>
            </div>

            <div className="sm:text-right">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Order Information
              </p>
              <p className="text-slate-800"><span className="font-semibold">Order ID:</span> {order.orderNumber || order._id}</p>
              <p className="text-slate-800"><span className="font-semibold">Payment Mode:</span> {order.paymentMethod || 'COD'}</p>
              <p className="text-slate-800"><span className="font-semibold">Order Status:</span> {order.orderStatus || 'Processing'}</p>
              {order.trackingNumber && (
                <p className="text-slate-800"><span className="font-semibold">Tracking No:</span> {order.trackingNumber}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-5 border-b border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-bold">#</th>
                  <th className="py-2.5 px-3 font-bold">Item Description</th>
                  <th className="py-2.5 px-3 font-bold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-bold text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="text-slate-800">
                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      {item.author && <p className="text-[11px] text-slate-500">Author: {item.author}</p>}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">₹{item.price}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{item.subtotal || item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="pt-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-[11px] text-slate-600 space-y-1">
              <p className="flex items-center gap-1 font-bold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Certified Book Copies
              </p>
              <p>Thank you for shopping with LOGOS Bookstore!</p>
              <p>Support: support@logosbooks.com | Helpline: 1800-123-5646</p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discounts Applied:</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700">
                <span>GST (5%):</span>
                <span className="font-semibold">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Shipping:</span>
                <span className="font-semibold">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-sm font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="text-base text-emerald-800">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold border border-slate-300 rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Full Invoice
          </button>
        </div>
      </div>
    </Modal>
  );
};
