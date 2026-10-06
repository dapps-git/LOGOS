'use client';

import React from 'react';
import { Modal } from './common/Modal';
import { Printer, BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from './common/Badge';

function numberToWords(num) {
  if (!num || isNaN(num)) return 'Zero Rupees';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const integerPart = Math.floor(Math.abs(num));
  const n = ('000000000' + integerPart).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return `${integerPart} Rupees Only`;
  
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  
  return str.trim() ? `${str.trim()} Rupees Only` : 'Zero Rupees';
}

export const InvoiceModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const rawOrderNum = order.orderNumber ? order.orderNumber.replace('#', '') : (order._id || '').slice(-6).toUpperCase();
  const invoiceNumber = `INV-${rawOrderNum}`;
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const subtotal = Number(order.subtotal || order.itemsPrice || order.totalAmount || 0);
  const discount = Number(order.discount || order.couponDiscount || 0);
  const shippingFee = Number(order.shippingFee || order.shippingPrice || 0);
  const finalTotal = Number(order.finalTotal || order.totalAmount || (subtotal - discount + shippingFee));
  const gstAmount = Math.round(subtotal * 0.05); // 5% GST on books / supplies
  const cgstAmount = (gstAmount / 2).toFixed(2);
  const sgstAmount = (gstAmount / 2).toFixed(2);

  const customerName = order.customer?.name || order.shippingAddress?.fullName || 'Valued Customer';
  const customerPhone = order.customer?.phone || order.shippingAddress?.phone || 'N/A';
  const customerEmail = order.customer?.email || 'N/A';
  const streetAddress = order.shippingAddress?.streetAddress || 'Address on file';
  const postOffice = order.shippingAddress?.postOffice ? `P.O. ${order.shippingAddress.postOffice}, ` : '';
  const city = order.shippingAddress?.city || '';
  const state = order.shippingAddress?.state || 'Kerala';
  const postalCode = order.shippingAddress?.postalCode ? `- ${order.shippingAddress.postalCode}` : '';

  const isPaid = order.paymentStatus === 'Paid' || String(order.paymentMethod || '').toLowerCase() === 'razorpay' || String(order.paymentMethod || '').toLowerCase() === 'online';

  const handlePrint = () => {
    const printWin = window.open('', '_blank', 'width=950,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    const itemsRowsHtml = (order.items || []).map((item, idx) => {
      const itemTitle = item.title || item.book?.title || 'Book Title';
      const itemAuthor = item.author || item.book?.author || '';
      const itemQty = item.quantity || 1;
      const itemPrice = Number(item.price || 0);
      const itemTotal = Number(item.subtotal || (itemPrice * itemQty));

      return `
        <tr>
          <td style="text-align: center; color: #64748b; font-weight: 500;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: #0f172a; font-size: 11.5px; line-height: 1.3;">${itemTitle}</div>
            ${itemAuthor ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Author: ${itemAuthor}</div>` : ''}
          </td>
          <td style="text-align: center; color: #475569; font-family: monospace; font-size: 10.5px;">4901.10</td>
          <td style="text-align: center; font-weight: 700; color: #0f172a;">${itemQty}</td>
          <td style="text-align: right; color: #334155;">₹${itemPrice.toFixed(2)}</td>
          <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const invoiceHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 14mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              font-size: 11px;
              line-height: 1.4;
              padding: 10px;
            }
            .invoice-wrapper {
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #cbd5e1;
              padding: 24px 28px;
            }
            .header-table {
              width: 100%;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 16px;
              margin-bottom: 16px;
            }
            .brand-title {
              font-size: 20px;
              font-weight: 900;
              letter-spacing: 1px;
              color: #0f172a;
              text-transform: uppercase;
              margin-bottom: 3px;
            }
            .brand-subtitle {
              font-size: 11px;
              font-weight: 700;
              color: #1e3a8a;
              margin-bottom: 4px;
            }
            .brand-meta {
              font-size: 10px;
              color: #475569;
              line-height: 1.4;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 10px;
              font-size: 10px;
              font-weight: 800;
              border-radius: 4px;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .badge-paid {
              background-color: #ecfdf5;
              color: #065f46;
              border: 1px solid #a7f3d0;
            }
            .badge-pending {
              background-color: #fffbeb;
              color: #92400e;
              border: 1px solid #fde68a;
            }
            .info-grid-table {
              width: 100%;
              margin-bottom: 18px;
              border-collapse: separate;
              border-spacing: 12px 0;
            }
            .info-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 12px 14px;
              vertical-align: top;
            }
            .info-box-title {
              font-size: 9.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #64748b;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
              margin-bottom: 8px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 18px;
            }
            .items-table th {
              background: #0f172a;
              color: #ffffff;
              font-size: 9.5px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 8px 10px;
              border: 1px solid #0f172a;
            }
            .items-table td {
              border: 1px solid #e2e8f0;
              padding: 8px 10px;
              font-size: 11px;
            }
            .items-table tr:nth-child(even) td {
              background: #f8fafc;
            }
            .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .calc-box {
              width: 290px;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              padding: 12px 14px;
            }
            .calc-row {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #334155;
              margin-bottom: 5px;
            }
            .calc-row.total {
              border-top: 1.5px solid #0f172a;
              padding-top: 6px;
              margin-top: 6px;
              font-size: 13px;
              font-weight: 900;
              color: #0f172a;
            }
            .footer-table {
              width: 100%;
              border-top: 1px solid #cbd5e1;
              padding-top: 14px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            <!-- Header Table -->
            <table class="header-table" style="width: 100%;">
              <tr>
                <td style="vertical-align: top; width: 60%;">
                  <div class="brand-title">LOGOS BOOKSTORE</div>
                  <div class="brand-subtitle">Official GST Tax Invoice & Retail Sales Receipt</div>
                  <div class="brand-meta">
                    <strong>LOGOS Publications & Central Distribution</strong><br>
                    GSTIN: <strong>32AAACL1902K1Z8</strong> | PAN: AAACL1902K<br>
                    State: Kerala (State Code: 32) • Country: India<br>
                    Web: www.logosbooks.in | Support: support@logosbooks.com
                  </div>
                </td>
                <td style="vertical-align: top; text-align: right; width: 40%;">
                  <div class="status-badge ${isPaid ? 'badge-paid' : 'badge-pending'}">
                    ${isPaid ? '✓ PAID ONLINE (PREPAID)' : '⏱ PAYMENT PENDING (COD)'}
                  </div>
                  <div style="font-size: 13px; font-weight: 900; color: #0f172a; margin-top: 2px;">
                    Invoice: <span style="font-family: monospace;">${invoiceNumber}</span>
                  </div>
                  <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">
                    Invoice Date: <strong>${invoiceDate}</strong>
                  </div>
                  <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">
                    Order Reference: <strong>#${order.orderNumber || rawOrderNum}</strong>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Customer & Order Info Grid -->
            <table class="info-grid-table">
              <tr>
                <td class="info-box" style="width: 50%;">
                  <div class="info-box-title">Billed To (Customer)</div>
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">${customerName}</div>
                  <div style="color: #334155; line-height: 1.4;">
                    ${streetAddress}<br>
                    ${postOffice}${city ? `${city}, ` : ''}${state} ${postalCode}
                  </div>
                  <div style="margin-top: 6px; font-size: 10.5px; color: #475569;">
                    Phone: <strong>${customerPhone}</strong><br>
                    Email: <strong>${customerEmail}</strong><br>
                    Place of Supply: <strong>${state} (Code: 32)</strong>
                  </div>
                </td>

                <td class="info-box" style="width: 50%;">
                  <div class="info-box-title">Order & Logistics Information</div>
                  <div style="color: #334155; line-height: 1.5; font-size: 11px;">
                    Order ID: <strong>#${order.orderNumber || rawOrderNum}</strong><br>
                    Order Date: <strong>${invoiceDate}</strong><br>
                    Payment Mode: <strong>${String(order.paymentMethod || 'Razorpay').toUpperCase()}</strong><br>
                    Order Status: <strong style="color: #1e3a8a;">${order.orderStatus || 'Confirmed'}</strong><br>
                    ${order.trackingNumber ? `Tracking No: <strong>${order.trackingNumber}</strong><br>` : ''}
                    Delivery Mode: <strong>Express Courier Delivery</strong>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th style="width: 48%; text-align: left;">Item Description</th>
                  <th style="width: 12%; text-align: center;">HSN Code</th>
                  <th style="width: 8%; text-align: center;">Qty</th>
                  <th style="width: 13%; text-align: right;">Unit Rate</th>
                  <th style="width: 14%; text-align: right;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml || `
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 16px; color: #64748b;">No items recorded in this order</td>
                  </tr>
                `}
              </tbody>
            </table>

            <!-- Financial Calculation & Words Block -->
            <table class="summary-table">
              <tr>
                <td style="vertical-align: top; width: 55%; padding-right: 20px;">
                  <div style="font-size: 11px; color: #475569; line-height: 1.5; margin-bottom: 8px;">
                    <strong style="color: #0f172a;">Amount in Words:</strong><br>
                    <span style="font-style: italic; color: #0f172a; font-weight: 600;">
                      ${numberToWords(finalTotal)}
                    </span>
                  </div>
                </td>

                <td style="vertical-align: top; width: 45%;">
                  <div class="calc-box">
                    <div class="calc-row">
                      <span>Subtotal (Taxable Value):</span>
                      <span style="font-weight: 600;">₹${subtotal.toFixed(2)}</span>
                    </div>
                    ${discount > 0 ? `
                      <div class="calc-row" style="color: #047857;">
                        <span>Promotional Discount:</span>
                        <span style="font-weight: 600;">-₹${discount.toFixed(2)}</span>
                      </div>
                    ` : ''}
                    <div class="calc-row">
                      <span>CGST (2.5%):</span>
                      <span>₹${cgstAmount}</span>
                    </div>
                    <div class="calc-row">
                      <span>SGST (2.5%):</span>
                      <span>₹${sgstAmount}</span>
                    </div>
                    <div class="calc-row">
                      <span>Shipping & Packaging:</span>
                      <span style="font-weight: 600;">${shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span>
                    </div>
                    <div class="calc-row total">
                      <span>Grand Total:</span>
                      <span style="color: #1e3a8a;">₹${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Signatory & Footer -->
            <table class="footer-table">
              <tr>
                <td style="vertical-align: bottom; width: 60%; font-size: 9.5px; color: #94a3b8;">
                  LOGOS Central Bookstore Console • Computer Generated GST Tax Invoice<br>
                  Printed on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style="vertical-align: bottom; text-align: right; width: 40%;">
                  <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-bottom: 28px;">
                    For LOGOS BOOKSTORE
                  </div>
                  <div style="border-top: 1px dashed #94a3b8; display: inline-block; padding-top: 4px; font-size: 9.5px; color: #64748b;">
                    Authorised Signatory
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(invoiceHtml);
    printWin.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tax Invoice ${invoiceNumber}`} maxWidth="max-w-4xl">
      <div className="space-y-5">
        {/* Onscreen Invoice Preview */}
        <div id="printable-invoice" className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 text-slate-900 shadow-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b-2 border-slate-900">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1E3A8A] flex-shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">LOGOS Bookstore</h2>
                <p className="text-xs text-blue-900 font-bold mt-0.5">Official GST Tax Invoice & Retail Receipt</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">GSTIN: 32AAACL1902K1Z8 | Kerala, India</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${
                  isPaid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {isPaid ? 'PAID ONLINE (PREPAID)' : 'PAYMENT PENDING (COD)'}
                </span>
              </div>
              <p className="text-sm font-black text-slate-900 mt-1">Invoice: <span className="font-mono">{invoiceNumber}</span></p>
              <p className="text-xs text-slate-600 font-medium">Date: {invoiceDate}</p>
            </div>
          </div>

          {/* Customer & Order Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1.5 pb-1 border-b border-slate-200">
                Billed To (Customer Details)
              </p>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{customerName}</h4>
              <p className="text-slate-700 leading-relaxed">{streetAddress}</p>
              <p className="text-slate-700 leading-relaxed">
                {postOffice}{city ? `${city}, ` : ''}{state} {postalCode}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-0.5">
                <p><span className="font-semibold text-slate-700">Phone:</span> {customerPhone}</p>
                <p><span className="font-semibold text-slate-700">Email:</span> {customerEmail}</p>
                <p><span className="font-semibold text-slate-700">Place of Supply:</span> {state} (Code: 32)</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1.5 pb-1 border-b border-slate-200">
                Order & Shipping Information
              </p>
              <div className="space-y-1.5 text-slate-800">
                <p><span className="font-semibold text-slate-600">Order ID:</span> #{order.orderNumber || rawOrderNum}</p>
                <p><span className="font-semibold text-slate-600">Order Date:</span> {invoiceDate}</p>
                <p><span className="font-semibold text-slate-600">Payment Mode:</span> {String(order.paymentMethod || 'Razorpay').toUpperCase()}</p>
                <p><span className="font-semibold text-slate-600">Order Status:</span> <span className="font-bold text-blue-900">{order.orderStatus || 'Confirmed'}</span></p>
                {order.trackingNumber && (
                  <p><span className="font-semibold text-slate-600">Tracking No:</span> {order.trackingNumber}</p>
                )}
                <p><span className="font-semibold text-slate-600">Delivery Type:</span> Express Courier Delivery</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4 border-b border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-bold text-center w-12">#</th>
                  <th className="py-2.5 px-3 font-bold">Item Description</th>
                  <th className="py-2.5 px-3 font-bold text-center">HSN</th>
                  <th className="py-2.5 px-3 font-bold text-center w-16">Qty</th>
                  <th className="py-2.5 px-3 font-bold text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-x border-b border-slate-200">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900 text-xs">{item.title}</p>
                      {item.author && <p className="text-[11px] text-slate-500">Author: {item.author}</p>}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 font-mono text-[11px]">4901.10</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">₹{Number(item.price).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{Number(item.subtotal || item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes Breakdown */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2 text-xs text-slate-600 max-w-sm">
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-800">Amount in Words:</p>
                <p className="italic text-slate-900 font-semibold mt-0.5">{numberToWords(finalTotal)}</p>
              </div>
            </div>

            <div className="w-full sm:w-72 p-3 bg-slate-50 border border-slate-300 rounded-md space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal (Taxable Value):</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discounts Applied:</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700">
                <span>CGST (2.5%):</span>
                <span className="font-semibold">₹{cgstAmount}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>SGST (2.5%):</span>
                <span className="font-semibold">₹{sgstAmount}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Shipping & Handling:</span>
                <span className="font-semibold">{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-sm font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="text-base text-blue-900">₹{finalTotal.toFixed(2)}</span>
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
            className="px-5 py-2 text-xs font-bold bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-md flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Print Full Invoice
          </button>
        </div>
      </div>
    </Modal>
  );
};
