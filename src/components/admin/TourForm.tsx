'use client';

import React, { useState, useEffect } from 'react';
import { tourService } from '@/services/tourService';
import { parseTourPDF } from '@/actions/tourActions';
import { Tour, ItineraryDay, GroupPrice } from '@/types/tour';
import { useRouter } from 'next/navigation';
import styles from './tour-form.module.css';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

interface TourFormProps {
  initialData?: Partial<Tour>;
  isEdit?: boolean;
}

export default function TourForm({ initialData, isEdit }: TourFormProps) {
  const router = useRouter();
  const [isParsing, setIsParsing] = useState(false);
  const [formData, setFormData] = useState<Partial<Tour>>({
    title: '',
    slug: '',
    category: '',
    destination: '',
    region: '',
    durationDays: 1,
    durationNights: 0,
    priceFrom: 0,
    shortDescription: '',
    overview: '',
    highlights: [],
    itinerary: [],
    included: [],
    excluded: [],
    priceByGroupSize: [],
    departureDates: [],
    seoTitle: '',
    seoDescription: '',
    status: 'Published',
    isFeatured: false,
    images: [],
    featuredImage: ''
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const response = await parseTourPDF(formDataObj);
      if (response.success && response.data) {
        const result = response.data;
        // Sanitize departureDates to YYYY-MM-DD format
        const formattedDates = (result.departureDates || []).map((dateStr: string) => {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const day = parts[0].padStart(2, '0');
              const month = parts[1].padStart(2, '0');
              const year = parts[2];
              return `${year}-${month}-${day}`;
            }
          }
          return dateStr;
        });

        // Map highlights
        const highlights = result.highlights || [];
        // Map itinerary activities into description
        const itinerary = (result.itinerary || []).map((day: any) => ({
          day: Number(day.day) || 1,
          title: day.title || '',
          description: Array.isArray(day.activities) ? day.activities.join('\n') : (day.description || '')
        }));

        setFormData(prev => ({
          ...prev,
          title: result.title || prev.title,
          slug: result.title ? slugify(result.title) : prev.slug,
          category: result.category || prev.category,
          destination: result.destination || prev.destination,
          region: result.region || prev.region,
          durationDays: Number(result.durationDays) || prev.durationDays,
          durationNights: Number(result.durationNights) || prev.durationNights,
          priceFrom: Number(result.priceFrom) || prev.priceFrom,
          departureDates: formattedDates,
          shortDescription: result.shortDescription || prev.shortDescription,
          overview: result.overview || prev.overview,
          highlights: highlights,
          itinerary: itinerary,
          included: result.included || prev.included,
          excluded: result.excluded || prev.excluded,
          priceByGroupSize: result.priceByGroupSize || prev.priceByGroupSize,
          seoTitle: result.seoTitle || prev.seoTitle,
          seoDescription: result.seoDescription || prev.seoDescription,
          featuredImage: result.featuredImage || prev.featuredImage || '',
          images: result.images || (result.featuredImage ? [result.featuredImage] : (prev.images || [])),
        }));
        alert('Phân tích file PDF thành công! Đã tự động điền các thông tin của Tour. Vui lòng kiểm tra lại trước khi lưu.');
      } else {
        alert('Lỗi phân tích file PDF: ' + (response.error || 'Lỗi không xác định từ máy chủ'));
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối hoặc xử lý file PDF: ' + (err as Error).message);
    } finally {
      setIsParsing(false);
      e.target.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'durationDays' || name === 'durationNights' || name === 'priceFrom') ? Number(value) : value 
    }));
  };

  const handleArrayChange = (name: keyof Tour, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value.split('\n').filter(i => i.trim() !== '') }));
  };

  const handleItineraryChange = (index: number, field: keyof ItineraryDay, value: string | number) => {
    setFormData(prev => {
      const newItinerary = [...(prev.itinerary || [])];
      newItinerary[index] = { ...newItinerary[index], [field]: value };
      return { ...prev, itinerary: newItinerary };
    });
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [...(prev.itinerary || []), { day: (prev.itinerary?.length || 0) + 1, title: '', description: '' }]
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary?.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 }))
    }));
  };

  const handlePriceGroupChange = (index: number, field: keyof GroupPrice, value: string | number) => {
    setFormData(prev => {
      const newPrices = [...(prev.priceByGroupSize || [])];
      newPrices[index] = { ...newPrices[index], [field]: field === 'pricePerPerson' ? Number(value) : value };
      return { ...prev, priceByGroupSize: newPrices };
    });
  };

  const addPriceGroup = () => {
    setFormData(prev => ({
      ...prev,
      priceByGroupSize: [...(prev.priceByGroupSize || []), { groupSize: '', pricePerPerson: 0 }]
    }));
  };

  const removePriceGroup = (index: number) => {
    setFormData(prev => ({
      ...prev,
      priceByGroupSize: prev.priceByGroupSize?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && formData.id) {
        await tourService.updateTour(formData.id, formData);
        alert('Tour updated successfully!');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await tourService.createTour(formData as any);
        alert('Tour created successfully!');
      }
      router.refresh();
      router.push('/admin/tours');
    } catch {
      alert('Error saving tour');
    }
  };

  return (
    <div className={styles.container}>
      <h1>{isEdit ? 'Edit Tour' : 'Create New Tour'}</h1>
      
      {!isEdit && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#166534', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✨</span> Tự động điền nhanh lịch trình từ file PDF (AI)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#15803d' }}>
              Tải lên file PDF chương trình tour để AI tự động trích xuất thông tin, điền vào form bên dưới.
            </p>
          </div>
          <div>
            <input 
              type="file" 
              accept=".pdf" 
              id="pdf-upload" 
              style={{ display: 'none' }} 
              onChange={handlePdfUpload}
              disabled={isParsing}
            />
            <label 
              htmlFor="pdf-upload" 
              style={{
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: isParsing ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isParsing ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              {isParsing ? 'Đang phân tích...' : 'Chọn file PDF Tour'}
            </label>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.main}>
            <section className={styles.section}>
              <h3>General Information</h3>
              <div className={styles.field}>
                <label>Tour Title *</label>
                <input name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label>Slug *</label>
                <input name="slug" value={formData.slug} onChange={handleChange} required />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Category</label>
                  <input name="category" value={formData.category} onChange={handleChange} />
                </div>
                <div className={styles.field}>
                  <label>Destination</label>
                  <input name="destination" value={formData.destination} onChange={handleChange} />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Duration Days</label>
                  <input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} min="1" />
                </div>
                <div className={styles.field}>
                  <label>Duration Nights</label>
                  <input type="number" name="durationNights" value={formData.durationNights} onChange={handleChange} min="0" />
                </div>
                <div className={styles.field}>
                  <label>Price From ($)</label>
                  <input type="number" name="priceFrom" value={formData.priceFrom} onChange={handleChange} min="0" />
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3>Departure Dates</h3>
              <div className={styles.field}>
                <label>Dates (One per line, YYYY-MM-DD)</label>
                <textarea 
                  value={formData.departureDates?.join('\n')} 
                  onChange={(e) => handleArrayChange('departureDates', e.target.value)} 
                  rows={4} 
                  placeholder="2026-06-19&#10;2026-07-22"
                />
              </div>
            </section>

            <section className={styles.section}>
              <h3>Content</h3>
              <div className={styles.field}>
                <label>Short Description</label>
                <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={3} />
              </div>
              <div className={styles.field}>
                <label>Overview</label>
                <textarea name="overview" value={formData.overview} onChange={handleChange} rows={6} />
              </div>
              <div className={styles.field}>
                <label>Highlights (One per line)</label>
                <textarea 
                  value={formData.highlights?.join('\n')} 
                  onChange={(e) => handleArrayChange('highlights', e.target.value)} 
                  rows={4} 
                />
              </div>
            </section>

            <section className={styles.section}>
              <h3>Itinerary</h3>
              <div className={styles.itineraryList}>
                {formData.itinerary?.map((item, index) => (
                  <div key={index} className={styles.itineraryItem}>
                    <div className={styles.itineraryHeader}>
                      <h4>Day {item.day}</h4>
                      <button type="button" onClick={() => removeItineraryDay(index)} className={styles.removeBtn}>Remove</button>
                    </div>
                    <div className={styles.field}>
                      <label>Title</label>
                      <input 
                        value={item.title} 
                        onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} 
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Description</label>
                      <textarea 
                        value={item.description} 
                        onChange={(e) => handleItineraryChange(index, 'description', e.target.value)} 
                        rows={3} 
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addItineraryDay} className={styles.addBtn}>+ Add Day</button>
              </div>
            </section>

            <section className={styles.section}>
              <h3>Inclusions & Exclusions</h3>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Included (One per line)</label>
                  <textarea 
                    value={formData.included?.join('\n')} 
                    onChange={(e) => handleArrayChange('included', e.target.value)} 
                    rows={6} 
                  />
                </div>
                <div className={styles.field}>
                  <label>Excluded (One per line)</label>
                  <textarea 
                    value={formData.excluded?.join('\n')} 
                    onChange={(e) => handleArrayChange('excluded', e.target.value)} 
                    rows={6} 
                  />
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3>Pricing by Group Size</h3>
              <div className={styles.priceList}>
                {formData.priceByGroupSize?.map((item, index) => (
                  <div key={index} className={styles.priceItem}>
                    <div className={styles.field}>
                      <label>Group Size (e.g., 2-4)</label>
                      <input 
                        value={item.groupSize} 
                        onChange={(e) => handlePriceGroupChange(index, 'groupSize', e.target.value)} 
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Price Per Person ($)</label>
                      <input 
                        type="number"
                        value={item.pricePerPerson} 
                        onChange={(e) => handlePriceGroupChange(index, 'pricePerPerson', e.target.value)} 
                      />
                    </div>
                    <button type="button" onClick={() => removePriceGroup(index)} className={styles.removeBtn}>Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addPriceGroup} className={styles.addBtn}>+ Add Price Tier</button>
              </div>
            </section>

            <section className={styles.section}>
              <h3>SEO</h3>
              <div className={styles.field}>
                <label>SEO Title</label>
                <input name="seoTitle" value={formData.seoTitle} onChange={handleChange} maxLength={60} />
              </div>
              <div className={styles.field}>
                <label>SEO Description</label>
                <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} maxLength={160} rows={2} />
              </div>
            </section>
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.section}>
              <h3>Status & Image</h3>
              <div className={styles.field}>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className={styles.checkboxField}>
                <input 
                  type="checkbox" 
                  id="isFeatured"
                  name="isFeatured" 
                  checked={formData.isFeatured || false} 
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} 
                />
                <label htmlFor="isFeatured">Featured on Home Page</label>
              </div>
              <div className={styles.field}>
                <label>Featured Image URL</label>
                <input name="featuredImage" value={formData.featuredImage} onChange={handleChange} />
                {formData.featuredImage && (
                  <div className={styles.imagePreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.featuredImage} alt="Preview" />
                  </div>
                )}
              </div>
              <div className={styles.field}>
                <label>Gallery Images (One URL per line)</label>
                <textarea 
                  value={formData.images?.join('\n')} 
                  onChange={(e) => handleArrayChange('images', e.target.value)} 
                  rows={4} 
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                />
                {formData.images && formData.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px', marginTop: '8px' }}>
                    {formData.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '100%', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <div className={styles.actions}>
              <button type="submit" className={styles.saveBtn}>Save Tour</button>
              <button type="button" onClick={() => router.push('/admin/tours')} className={styles.cancelBtn}>Cancel</button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
