'use client';

import React, { useState } from 'react';
import { blogService } from '@/services/blogService';
import { Blog, MemoContent } from '@/types/blog';
import { useRouter } from 'next/navigation';
import styles from './tour-form.module.css';

interface BlogFormProps {
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

const getInitialFormData = (initialData?: Blog): Partial<Blog> => ({
  title: initialData?.title || '',
  slug: initialData?.slug || '',
  categoryId: initialData?.categoryId || '1',
  thumbnail: initialData?.thumbnail || '',
  excerpt: initialData?.excerpt || '',
  content: initialData?.content || '',
  seoTitle: initialData?.seoTitle || '',
  seoDescription: initialData?.seoDescription || '',
  tags: initialData?.tags || [],
  status: initialData?.status || 'Draft',
  publishedDate: initialData?.publishedDate ? new Date(initialData.publishedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  isMemo: initialData?.isMemo || false,
  coverImage: initialData?.coverImage || '',
  memoContent: initialData?.memoContent ? { ...defaultMemoContent, ...initialData.memoContent } : defaultMemoContent,
  id: initialData?.id
});


export default function BlogForm({ initialData, isEdit }: BlogFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Blog>>(getInitialFormData(initialData));
  const [isMemo, setIsMemo] = useState(initialData?.isMemo || false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit: Partial<Blog> = {
      ...formData,
      isMemo,
      content: isMemo ? '' : formData.content,
      memoContent: isMemo ? formData.memoContent : undefined,
    };

    try {
      if (isEdit && formData.id) {
        await blogService.updateBlog(formData.id, dataToSubmit);
        alert('Cập nhật bài viết thành công!');
      } else {
        await blogService.createBlog(dataToSubmit as Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>);
        alert('Tạo bài viết thành công!');
      }
      router.push('/admin/blogs');
      router.refresh();
    } catch {
      alert('Lỗi khi lưu bài viết');
    }
  };

  const memoContent = formData.memoContent as MemoContent || defaultMemoContent;

  return (
    <div className={styles.container}>
      <h1>{isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.main}>
            <section className={styles.section}>
              <h3>Thông tin chung</h3>
              <div className={styles.field}>
                <label>Tiêu đề *</label>
                <input name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label>Slug *</label>
                <input name="slug" value={formData.slug} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label>
                  <input
                    type="checkbox"
                    checked={isMemo}
                    onChange={(e) => setIsMemo(e.target.checked)}
                    style={{ marginRight: '10px' }}
                  />
                  Bài viết dạng Memo Sale
                </label>
              </div>
            </section>

            {isMemo ? (
              <section className={styles.section}>
                <h3>Nội dung Memo</h3>
                <div className={styles.field}><label>Cover Image URL</label><input name="coverImage" value={formData.coverImage || ''} onChange={handleChange} /></div>
                <div className={styles.field}><label>Hook (gây chú ý)</label><textarea value={memoContent.hook} name="hook" onChange={handleMemoChange} rows={2} /></div>
                <div className={styles.field}><label>Problem (Vấn đề)</label><textarea value={memoContent.problem} name="problem" onChange={handleMemoChange} rows={3} /></div>
                <div className={styles.field}><label>Solution (Giải pháp)</label><textarea value={memoContent.solution} name="solution" onChange={handleMemoChange} rows={4} /></div>
                <div className={styles.field}><label>Experience (Kinh nghiệm)</label><textarea value={memoContent.experience} name="experience" onChange={handleMemoChange} rows={4} /></div>
                <div className={styles.field}><label>Benefits (Lợi ích)</label><textarea value={memoContent.benefits} name="benefits" onChange={handleMemoChange} rows={4} /></div>
                <div className={styles.field}><label>CTA Text</label><input value={memoContent.cta.text} name="text" onChange={handleCtaChange} /></div>
                <div className={styles.field}><label>CTA Link</label><input value={memoContent.cta.link} name="link" onChange={handleCtaChange} /></div>
              </section>
            ) : (
              <section className={styles.section}>
                <h3>Nội dung bài viết</h3>
                <div className={styles.field}>
                  <label>Tóm tắt</label>
                  <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} />
                </div>
                <div className={styles.field}>
                  <label>Nội dung (Hỗ trợ Markdown)</label>
                  <textarea name="content" value={formData.content} onChange={handleChange} rows={12} />
                </div>
              </section>
            )}

            <section className={styles.section}>
              <h3>SEO</h3>
              <div className={styles.field}>
                <label>SEO Title (Tối đa 60 ký tự)</label>
                <input name="seoTitle" value={formData.seoTitle} onChange={handleChange} maxLength={60} />
              </div>
              <div className={styles.field}>
                <label>SEO Description (Tối đa 160 ký tự)</label>
                <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} maxLength={160} rows={2} />
              </div>
            </section>
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.section}>
              <h3>Trạng thái & Hình ảnh</h3>
              <div className={styles.field}>
                <label>Trạng thái</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Draft">Bản nháp</option>
                  <option value="Published">Công khai</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Ngày đăng</label>
                <input type="date" name="publishedDate" value={formData.publishedDate} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label>Thumbnail URL (Ảnh đại diện)</label>
                <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} />
                {formData.thumbnail && (
                  <div className={styles.imagePreview}>
                    <img src={formData.thumbnail} alt="Preview" />
                  </div>
                )}
              </div>
            </section>

            <div className={styles.actions}>
              <button type="submit" className={styles.saveBtn}>Lưu bài viết</button>
              <button type="button" onClick={() => router.push('/admin/blogs')} className={styles.cancelBtn}>Hủy</button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
