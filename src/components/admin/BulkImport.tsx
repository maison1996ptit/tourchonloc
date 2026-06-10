'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { tourService } from '@/services/tourService';
import styles from './bulk-import.module.css';

interface BulkImportProps {
  onSuccess: () => void;
}

const BulkImport: React.FC<BulkImportProps> = ({ onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const downloadTemplate = () => {
    const templateData = [
      {
        'Title': 'Ha Long Bay Discovery',
        'Slug': 'ha-long-bay-discovery',
        'Destination': 'Ha Long, Vietnam',
        'Price From': 150,
        'Duration Days': 2,
        'Duration Nights': 1,
        'Short Description': 'Explore the beautiful limestone islands of Ha Long Bay.',
        'Status': 'Published',
        'Is Featured': 'Yes'
      },
      {
        'Title': 'Sa Pa Trekking Adventure',
        'Slug': 'sa-pa-trekking',
        'Destination': 'Sa Pa, Vietnam',
        'Price From': 200,
        'Duration Days': 3,
        'Duration Nights': 2,
        'Short Description': 'Experience the culture and landscapes of northern Vietnam.',
        'Status': 'Draft',
        'Is Featured': 'No'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tours Template');
    
    // Auto-size columns
    const maxWidths = templateData.reduce((acc: number[], row: Record<string, unknown>) => {
      Object.keys(row).forEach((key, i) => {
        const value = String(row[key]);
        acc[i] = Math.max(acc[i] || 0, value.length, key.length);
      });
      return acc;
    }, []);
    worksheet['!cols'] = maxWidths.map((w: number) => ({ wch: w + 2 }));

    XLSX.writeFile(workbook, 'tours_import_template.xlsx');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

        if (jsonData.length === 0) {
          throw new Error('No data found in the Excel file.');
        }

        const formattedTours = jsonData.map((row: Record<string, unknown>) => ({
          title: String(row['Title'] || ''),
          slug: String(row['Slug'] || ''),
          destination: String(row['Destination'] || ''),
          priceFrom: Number(row['Price From']) || 0,
          durationDays: Number(row['Duration Days']) || 1,
          durationNights: Number(row['Duration Nights']) || 0,
          shortDescription: String(row['Short Description'] || ''),
          status: (row['Status'] === 'Published' || row['Status'] === 'Draft' || row['Status'] === 'Archived') ? row['Status'] : 'Draft',
          isFeatured: row['Is Featured'] === 'Yes',
          featuredImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
          images: [],
          overview: String(row['Short Description'] || ''),
          highlights: [],
          itinerary: [],
          included: [],
          excluded: [],
          category: String(row['Category'] || 'Leisure'),
          region: String(row['Region'] || ''),
          priceByGroupSize: [],
          seoTitle: String(row['Title'] || ''),
          seoDescription: String(row['Short Description'] || '')
        }));

        await tourService.bulkCreateTours(formattedTours as unknown as Parameters<typeof tourService.bulkCreateTours>[0]);
        setMessage({ type: 'success', text: `Successfully imported ${jsonData.length} tours!` });
        onSuccess();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error: unknown) {
        console.error('Import error:', error);
        const err = error as Error;
        setMessage({ type: 'error', text: err.message || 'Failed to import tours. Please check the file format.' });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className={styles.bulkContainer}>
      <div className={styles.actions}>
        <button onClick={downloadTemplate} className={styles.downloadBtn}>
          📥 Download Template
        </button>
        <div className={styles.uploadWrapper}>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
            ref={fileInputRef}
            className={styles.fileInput}
            id="bulk-import-file"
            disabled={importing}
          />
          <label htmlFor="bulk-import-file" className={`${styles.uploadBtn} ${importing ? styles.disabled : ''}`}>
            {importing ? '⌛ Importing...' : '📤 Import Excel'}
          </label>
        </div>
      </div>
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default BulkImport;
