'use client';

import React, { useState } from 'react';
import { blogService } from '@/services/blogService';
import { Blog, MemoContent } from '@/types/blog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './tour-form.module.css';
import memoStyles from '@/components/public/memo/Memo.module.css';
import HighlightBox from '@/components/public/memo/HighlightBox';
import CTABlock from '@/components/public/memo/CTABlock';
import TableOfContents from '@/components/public/memo/TableOfContents';
import FAQ from '@/components/public/memo/FAQ';

interface MemoFormProps {
  initialData?: Blog;
  isEdit?: boolean;
}

const defaultMemoContent: MemoContent = {
  hook: '',
  problem: '',
  solution: '',
  experience: '',
  benefits: '',
  cta: { text: '', link: '' },
  faq: [],
  tableOfContents: []
};

// Helper function to convert Vietnamese text to slug
function convertToSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function MemoForm({ initialData, isEdit }: MemoFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [formData, setFormData] = useState<Partial<Blog>>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    categoryId: initialData?.categoryId || 'cam-nang',
    category: initialData?.category || 'Cẩm nang du lịch',
    thumbnail: initialData?.thumbnail || '',
    excerpt: initialData?.excerpt || '',
    content: '',
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    tags: initialData?.tags || [],
    status: initialData?.status || 'Draft',
    publishedDate: initialData?.publishedDate 
      ? new Date(initialData.publishedDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    isMemo: true,
    coverImage: initialData?.coverImage || '',
    memoContent: initialData?.memoContent ? { ...defaultMemoContent, ...initialData.memoContent } : defaultMemoContent,
    id: initialData?.id
  });

  const [tagInput, setTagInput] = useState(initialData?.tags?.join(', ') || '');
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(
    initialData?.memoContent?.faq || []
  );
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const nextData = { ...prev, [name]: value };
      if (name === 'title' && !isEdit) {
        nextData.slug = convertToSlug(value);
      }
      return nextData;
    });
  };

  const handleMemoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newMemoContent = { ...prev.memoContent, [name]: value };
      return { ...prev, memoContent: newMemoContent as MemoContent };
    });
  };

  const handleCtaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newMemoContent = {
        ...prev.memoContent,
        cta: { ...prev.memoContent?.cta, [name]: value }
      };
      return { ...prev, memoContent: newMemoContent as MemoContent };
    });
  };

  // Dynamic FAQ handlers
  const handleAddFaq = () => {
    setFaqs([...faqs, { q: '', a: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
  };

  const handleFaqChange = (index: number, field: 'q' | 'a', value: string) => {
    const updatedFaqs = faqs.map((faq, idx) => {
      if (idx === index) {
        return { ...faq, [field]: value };
      }
      return faq;
    });
    setFaqs(updatedFaqs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      alert('Bạn không có quyền thực hiện hành động này. Chỉ Admin mới được tạo/sửa Memo.');
      return;
    }

    const tagsArr = tagInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    const finalMemoContent: MemoContent = {
      ...formData.memoContent,
      faq: faqs,
      tableOfContents: [
        "Vấn đề thường gặp khi săn sale",
        "Giải pháp công nghệ từ Tour Chọn Lọc",
        "Kinh nghiệm đặt tour giá tốt",
        "Lợi ích khi đặt qua chúng tôi"
      ]
    } as MemoContent;

    const dataToSubmit: Partial<Blog> = {
      ...formData,
      tags: tagsArr,
      isMemo: true,
      content: '',
      memoContent: finalMemoContent,
    };

    try {
      if (isEdit && formData.id) {
        await blogService.updateBlog(formData.id, dataToSubmit);
        alert('Cập nhật Memo thành công!');
      } else {
        await blogService.createBlog(dataToSubmit as Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>);
        alert('Tạo Memo thành công!');
      }
      router.push('/admin/memos');
      router.refresh();
    } catch {
      alert('Lỗi khi lưu Memo');
    }
  };

  const memoContent = formData.memoContent as MemoContent || defaultMemoContent;

  return (
    <div className={styles.container}>
      <h1>{isEdit ? 'Chỉnh sửa Memo' : 'Tạo Memo mới'}</h1>
      {!isAdmin && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
          ⚠️ Bạn đang đăng nhập với quyền Editor. Chỉ có tài khoản Admin mới được phép Tạo hoặc Sửa đổi Memo.
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.main}>
            <section className={styles.section}>
              <h3>Thông tin chung</h3>
              <div className={styles.field}>
                <label>Tiêu đề *</label>
                <input name="title" value={formData.title} onChange={handleChange} required disabled={!isAdmin} />
              </div>
              <div className={styles.field}>
                <label>Slug *</label>
                <input name="slug" value={formData.slug} onChange={handleChange} required disabled={!isAdmin} />
              </div>
              <div className={styles.field}>
                <label>Tóm tắt (Excerpt) *</label>
                <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={2} required disabled={!isAdmin} />
              </div>
            </section>

            <section className={styles.section}>
              <h3>Nội dung cấu trúc Memo</h3>
              <div className={styles.field}>
                <label>Cover Image URL (Ảnh bìa Memo)</label>
                <input name="coverImage" value={formData.coverImage || ''} onChange={handleChange} disabled={!isAdmin} />
              </div>
              <div className={styles.field}>
                <label>Hook (gây chú ý) *</label>
                <textarea value={memoContent.hook} name="hook" onChange={handleMemoChange} rows={3} required disabled={!isAdmin} />
              </div>
              <div className={styles.field}>
                <label>Problem (Vấn đề của khách hàng) *</label>
                <textarea value={memoContent.problem} name="problem" onChange={handleMemoChange} rows={3} required disabled={!isAdmin} />
              </div>
              <div className={styles.field}>
                <label>Solution (Giải pháp của chúng ta) *</label>
                <textarea value={memoContent.solution} name="solution" onChange={handleMemoChange} rows={4} required disabled={!isAdmin} />
              </div>
              <div className={styles.field}>
                <label>Experience (Kinh nghiệm thực tế) *</label>
                <textarea value={memoContent.experience} name="experience" onChange={handleMemoChange} rows={4} required disabled={!isAdmin} />
              </div>
              <div className={styles.field}>
                <label>Benefits (Lợi ích khi đặt tour) *</label>
                <textarea value={memoContent.benefits} name="benefits" onChange={handleMemoChange} rows={4} required disabled={!isAdmin} />
              </div>
              <div className={styles.grid} style={{ gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                <div className={styles.field}>
                  <label>CTA Button Text</label>
                  <input value={memoContent.cta.text} name="text" onChange={handleCtaChange} disabled={!isAdmin} />
                </div>
                <div className={styles.field}>
                  <label>CTA Button Link</label>
                  <input value={memoContent.cta.link} name="link" onChange={handleCtaChange} disabled={!isAdmin} />
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Hỏi đáp (FAQ)</h3>
                {isAdmin && (
                  <button type="button" onClick={handleAddFaq} className={styles.createBtn} style={{ padding: '4px 10px', fontSize: '0.875rem' }}>
                    + Thêm câu hỏi
                  </button>
                )}
              </div>
              {faqs.map((faq, index) => (
                <div key={index} style={{ border: '1px dashed #cbd5e1', padding: '15px', borderRadius: '8px', marginBottom: '15px', position: 'relative' }}>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(index)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px' }}
                    >
                      Xóa
                    </button>
                  )}
                  <div className={styles.field} style={{ marginBottom: '10px' }}>
                    <label>Câu hỏi #{index + 1}</label>
                    <input value={faq.q} onChange={(e) => handleFaqChange(index, 'q', e.target.value)} required disabled={!isAdmin} />
                  </div>
                  <div className={styles.field}>
                    <label>Trả lời #{index + 1}</label>
                    <textarea value={faq.a} onChange={(e) => handleFaqChange(index, 'a', e.target.value)} rows={2} required disabled={!isAdmin} />
                  </div>
                </div>
              ))}
            </section>

            <section className={styles.section}>
              <h3>SEO Meta</h3>
              <div className={styles.field}>
                <label>SEO Title</label>
                <input name="seoTitle" value={formData.seoTitle} onChange={handleChange} maxLength={60} disabled={!isAdmin} />
              </div>
              <div className={styles.field}>
                <label>SEO Description</label>
                <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} maxLength={160} rows={2} disabled={!isAdmin} />
              </div>
            </section>
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.section}>
              <h3>Hình ảnh & Thao tác</h3>
              <div className={styles.field}>
                <label>Trạng thái</label>
                <select name="status" value={formData.status} onChange={handleChange} disabled={!isAdmin}>
                  <option value="Draft">Bản nháp</option>
                  <option value="Published">Công khai</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Ảnh đại diện (Thumbnail URL)</label>
                <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} disabled={!isAdmin} />
                {formData.thumbnail && (
                  <div className={styles.imagePreview} style={{ marginTop: '10px' }}>
                    <img src={formData.thumbnail} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                  </div>
                )}
              </div>
              <div className={styles.field}>
                <label>Tags (Cách nhau bằng dấu phẩy)</label>
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Nhật Bản, Lá đỏ, Tour" disabled={!isAdmin} />
              </div>
            </section>

            <div className={styles.actions}>
              {isAdmin && (
                <button type="submit" className={styles.saveBtn}>Lưu Memo</button>
              )}
              <button type="button" onClick={() => setShowPreview(!showPreview)} className={styles.createBtn} style={{ background: '#0284c7' }}>
                {showPreview ? 'Ẩn Xem trước' : 'Xem trước Giao diện'}
              </button>
              <button type="button" onClick={() => router.push('/admin/memos')} className={styles.cancelBtn}>Quay lại</button>
            </div>
          </aside>
        </div>
      </form>

      {showPreview && (
        <div style={{ marginTop: '40px', border: '2px solid #0284c7', borderRadius: '12px', padding: '20px', background: '#f8fafc' }}>
          <h2 style={{ borderBottom: '2px solid #0284c7', paddingBottom: '10px', color: '#0284c7' }}>Preview Giao diện Memo</h2>
          <div className={memoStyles.memoContainer} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            {formData.coverImage && (
              <div className={memoStyles.coverImage} style={{ backgroundImage: `url(${formData.coverImage})`, height: '300px', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', marginBottom: '20px' }} />
            )}
            
            <HighlightBox
              icon="🎣"
              title="Hook"
              content={memoContent.hook || 'Nội dung Hook...'}
            />
            
            <TableOfContents items={["Vấn đề thường gặp khi săn sale", "Giải pháp công nghệ từ Tour Chọn Lọc", "Kinh nghiệm đặt tour giá tốt", "Lợi ích khi đặt qua chúng tôi"]} />

            <section className={memoStyles.memoSection} style={{ marginTop: '20px' }}>
              <h3>🤔 Vấn đề</h3>
              <p>{memoContent.problem || 'Nội dung vấn đề...'}</p>
            </section>

            <section className={memoStyles.memoSection}>
              <h3>💡 Giải pháp</h3>
              <p>{memoContent.solution || 'Nội dung giải pháp...'}</p>
            </section>

            <section className={memoStyles.memoSection}>
              <h3>⭐ Kinh nghiệm thực tế</h3>
              <p>{memoContent.experience || 'Nội dung kinh nghiệm...'}</p>
            </section>

            <section className={memoStyles.memoSection}>
              <h3>💎 Lợi ích</h3>
              <p>{memoContent.benefits || 'Nội dung lợi ích...'}</p>
            </section>

            {memoContent.cta.text && (
              <CTABlock text={memoContent.cta.text} link={memoContent.cta.link || '#'} />
            )}
            
            {faqs.length > 0 && <FAQ items={faqs} />}
          </div>
        </div>
      )}
    </div>
  );
}
