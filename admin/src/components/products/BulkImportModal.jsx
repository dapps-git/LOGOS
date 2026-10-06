'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  X,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileCheck,
  Eye,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useStoreData } from '@/context/StoreDataContext';
import { apiClient } from '@/api/client';

// Convert Google Drive sharing links to direct image preview URLs
const transformDriveUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  const str = url.trim();
  const driveMatch = str.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return str;
};

const SAMPLE_TEMPLATE_ROWS = [
  {
    Title: 'Example Malayalam Book',
    Author: 'Author Name',
    Publisher: 'LOGOS Books',
    Theme: 'Novel',
    Price: 350,
    DiscountPrice: 299,
    Stock: 50,
    PageCount: 240,
    Languages: 'Malayalam',
    ISBN: '978-93-4753-610-1',
    Description: 'Engaging story synopsis and overview of the book.',
    'Image 1': 'https://drive.google.com/file/d/1example_drive_id_1/view?usp=sharing',
    'Image 2': 'https://drive.google.com/file/d/1example_drive_id_2/view?usp=sharing',
    'Image 3': 'https://drive.google.com/file/d/1example_drive_id_3/view?usp=sharing',
    'Image 4': '',
    'Image 5': '',
    'Image 6': '',
    Bestseller: 'no',
    NewArrival: 'yes',
    Featured: 'no'
  },
  {
    Title: 'World Philosophy Classic',
    Author: 'Marcus Aurelius',
    Publisher: 'LOGOS Classics',
    Theme: 'Philosophy',
    Price: 499,
    DiscountPrice: 399,
    Stock: 30,
    PageCount: 320,
    Languages: 'English, Malayalam',
    ISBN: '978-93-4753-610-2',
    Description: 'Timeless reflections on wisdom and resilience.',
    'Image 1': 'https://drive.google.com/file/d/1example_drive_id_4/view?usp=sharing',
    'Image 2': '',
    'Image 3': '',
    'Image 4': '',
    'Image 5': '',
    'Image 6': '',
    Bestseller: 'yes',
    NewArrival: 'no',
    Featured: 'yes'
  }
];

export const BulkImportModal = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const { refreshData } = useStoreData();

  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Download Sample Excel File (.xlsx)
  const handleDownloadSample = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Books_Catalog');
      XLSX.writeFile(workbook, 'LOGOS_Books_Bulk_Import_Template.xlsx');
      showToast('Sample Excel template downloaded successfully', 'success');
    } catch (err) {
      showToast('Failed to download template: ' + err.message, 'error');
    }
  };

  // Parse Excel / CSV files in the browser
  const handleProcessFile = (file) => {
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Try reading as 2D array first to inspect column positions
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        if (!rawRows || rawRows.length === 0) {
          showToast('The selected file appears to be empty', 'warning');
          return;
        }

        // Check if first row is a header row
        const firstRow = rawRows[0] || [];
        const firstRowStr = firstRow.map(c => String(c).toLowerCase()).join(' ');
        const hasHeaderRow = firstRowStr.includes('title') || firstRowStr.includes('author') || firstRowStr.includes('name') || firstRowStr.includes('price');

        let rowsToProcess = [];
        if (hasHeaderRow) {
          // Use standard object keys
          const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          rowsToProcess = rawJson.map((row, idx) => {
            const title = row.Title || row.title || row.Name || row.name || row['Book Title'] || `Book ${idx + 1}`;
            const author = row.Author || row.author || row.Writer || 'LOGOS Author';
            const publisher = row.Publisher || row.publisher || 'LOGOS Books';
            const theme = row.Theme || row.theme || row.Genre || row.genre || row.Category || row.category || 'General';
            const price = Number(row.Price || row.price || row.Rate || row.MRP || 299);
            const discountPrice = row.DiscountPrice || row.discountPrice || row.SalePrice ? Number(row.DiscountPrice || row.discountPrice || row.SalePrice) : null;
            const stock = Number(row.Stock !== '' ? row.Stock : row.stock !== '' ? row.stock : 25);
            const pageCount = Number(row.PageCount || row.pageCount || row.Pages || row.pages || 250);
            const isbn = String(row.ISBN || row.isbn || '');
            const sku = String(row.SKU || row.sku || row.Code || `LGS-BK-${Date.now().toString().slice(-4)}${idx}`);
            const description = String(row.Description || row.description || `${title} by ${author}.`);

            // Extract image URLs
            const images = [];
            for (let i = 1; i <= 6; i++) {
              const key = `Image ${i}` in row ? `Image ${i}` : `Image${i}` in row ? `Image${i}` : `image${i}` in row ? `image${i}` : null;
              if (key && row[key]) {
                const url = transformDriveUrl(String(row[key]));
                if (url && !images.includes(url)) images.push(url);
              }
            }

            // Check for Drive link or Images column
            const driveCol = row['Drive Link'] || row['Google Drive'] || row['Drive'] || row.Images || row.images || row['Image'];
            if (driveCol) {
              const list = String(driveCol).split(/[,;\n]+/).map(s => transformDriveUrl(s.trim())).filter(Boolean);
              list.forEach(u => {
                if (!images.includes(u)) images.push(u);
              });
            }

            // If no image provided, leave empty array

            const rawLanguages = row.Languages || row.languages || row.Language || 'Malayalam';
            const languages = String(rawLanguages).split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);

            const isBestSeller = String(row.Bestseller || row.bestseller || row.isBestSeller).toLowerCase() === 'yes' || String(row.Bestseller || row.isBestSeller).toLowerCase() === 'true';
            const isNewArrival = String(row.NewArrival || row.newArrival || row.isNewArrival).toLowerCase() !== 'no' && String(row.NewArrival || row.isNewArrival).toLowerCase() !== 'false';
            const isFeatured = String(row.Featured || row.featured || row.isFeatured).toLowerCase() === 'yes' || String(row.Featured || row.isFeatured).toLowerCase() === 'true';

            return {
              id: idx + 1,
              title,
              author,
              publisher,
              theme,
              price,
              discountPrice,
              stock,
              pageCount,
              languages,
              isbn,
              sku,
              description,
              images,
              isBestSeller,
              isNewArrival,
              isFeatured,
              isValid: Boolean(title && price > 0)
            };
          });
        } else {
          // Positional structure matching Google Sheet: [SKU, Title, Category, Author, Pages, ISBN, Price, DriveURL, ...]
          rowsToProcess = rawRows.filter(r => Array.isArray(r) && r.some(Boolean)).map((cols, idx) => {
            // Find Drive link or image URLs among columns
            const images = [];
            cols.forEach(cell => {
              const str = String(cell).trim();
              if (str.includes('drive.google.com') || str.startsWith('http')) {
                const transformed = transformDriveUrl(str);
                if (transformed && !images.includes(transformed)) images.push(transformed);
              }
            });

            // If no image provided, leave empty array

            const sku = String(cols[0] || `LGS-BK-${idx + 1}`);
            const title = String(cols[1] || `Book ${idx + 1}`);
            const theme = String(cols[2] || cols[4] || 'General');
            const author = String(cols[3] || cols[5] || 'LOGOS Author');
            const pageCount = Number(cols[4] || cols[6] || 250);
            const isbn = String(cols[5] || cols[2] || '');
            const price = Number(cols[6] || cols[7] || 299) || 299;

            return {
              id: idx + 1,
              title,
              author,
              publisher: 'LOGOS Books',
              theme,
              price,
              discountPrice: null,
              stock: 30,
              pageCount: isNaN(pageCount) ? 200 : pageCount,
              languages: ['Malayalam'],
              isbn,
              sku,
              description: `${title} by ${author}. Available at LOGOS Books.`,
              images,
              isBestSeller: false,
              isNewArrival: true,
              isFeatured: false,
              isValid: Boolean(title && price > 0)
            };
          });
        }

        setParsedRows(rowsToProcess);
        showToast(`Loaded ${rowsToProcess.length} books from ${file.name}`, 'success');
      } catch (err) {
        console.error('[BulkImport] Parsing error:', err);
        showToast('Error reading Excel spreadsheet: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle Save / Submit to Backend API
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;

    setIsUploading(true);
    try {
      const data = await apiClient('/books/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ books: parsedRows })
      });

      showToast(`🎉 ${data.message || `Successfully imported ${parsedRows.length} books!`}`, 'success');
      await refreshData();
      onClose();
    } catch (err) {
      console.error('[BulkImport] API Error:', err);
      showToast('Import failed: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Bulk Import Books via Excel / CSV
              </h3>
              <p className="text-[11px] text-slate-400 font-light">
                Upload 100+ book titles with Google Drive image links (up to 6 photos per book)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Sample Excel Template</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* File Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer?.files?.[0]) {
                handleProcessFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-[#1E3A8A] bg-blue-50/50 scale-[0.99]'
                : 'border-slate-200 hover:border-[#1E3A8A] bg-slate-50/50 hover:bg-blue-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-[#1E3A8A] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-800">
              {fileName ? fileName : 'Click to select or drag & drop your Excel / CSV file'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-light">
              Supports .xlsx, .xls, and .csv files with 100+ rows and Google Drive image URLs
            </p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadSample();
                }}
                className="inline-flex sm:hidden items-center gap-1 text-[11px] text-[#1E3A8A] font-medium hover:underline"
              >
                <Download className="w-3 h-3" />
                <span>Download Sample Template</span>
              </button>
            </div>
          </div>

          {/* Google Drive Link Format Guide */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 text-xs space-y-1.5">
            <p className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1E3A8A]" />
              Google Drive Image Links Supported
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed font-light">
              You can paste regular Google Drive sharing links in columns <code className="bg-white px-1.5 py-0.5 rounded text-[#1E3A8A] font-mono border border-blue-200">Image 1</code> to <code className="bg-white px-1.5 py-0.5 rounded text-[#1E3A8A] font-mono border border-blue-200">Image 6</code> (e.g. <span className="font-mono text-[10px] text-slate-700">https://drive.google.com/file/d/1A2B3C.../view?usp=sharing</span>). Ensure your Drive file permissions are set to <strong>&ldquo;Anyone with the link can view&rdquo;</strong>.
            </p>
          </div>

          {/* Parsed Books Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Preview Data ({parsedRows.length} Books Found)
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                    Ready to Import
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    setFileName('');
                  }}
                  className="text-xs font-light text-rose-500 hover:underline"
                >
                  Clear Selection
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10 text-[11px]">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Cover</th>
                      <th className="py-2 px-3">Title</th>
                      <th className="py-2 px-3">Author</th>
                      <th className="py-2 px-3">Genre</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-center">Stock</th>
                      <th className="py-2 px-3 text-center">Photos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-light">
                    {parsedRows.slice(0, 100).map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-mono text-slate-400">{row.id}</td>
                        <td className="py-2 px-3">
                          <img
                            src={row.images?.[0] || '/book1.jpg'}
                            alt={row.title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/book1.jpg';
                            }}
                            className="w-7 h-9 object-cover rounded-md border border-slate-200 shadow-2xs"
                          />
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900 max-w-[150px] truncate">
                          {row.title}
                        </td>
                        <td className="py-2 px-3 text-slate-600 max-w-[120px] truncate">
                          {row.author}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{row.theme}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-900 font-mono">
                          ₹{row.discountPrice || row.price}
                        </td>
                        <td className="py-2 px-3 text-center font-mono">{row.stock}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="bg-blue-50 text-[#1E3A8A] text-[10px] font-mono px-1.5 py-0.5 rounded border border-blue-100">
                            {row.images?.length || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 100 && (
                <p className="text-[10px] text-slate-400 text-center font-light">
                  Showing first 100 of {parsedRows.length} books. All rows will be imported.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0 || isUploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#152e72] disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing {parsedRows.length} Books to Database...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Books` : 'Catalog'} Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
