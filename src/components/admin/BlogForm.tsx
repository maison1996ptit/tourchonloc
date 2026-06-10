'use client';

import React, { useState, useEffect } from 'react';
import { blogService } from '@/services/blogService';
import { Blog } from '@/types/blog';
import { useRouter } from 'next/navigation';
import styles from './tour-form.module.css';

interface BlogFormProps {
  initialData?: Partial<Blog>;
  isEdit?: boolean;
}

export default function BlogForm({ initialData, isEdit }: BlogFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '',
    slug: '',
    categoryId: '1',
    thumbnail: '',
    excerpt: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    tags: [],
    status: 'Draft',
    publishedDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && formData.id) {
        await blogService.updateBlog(formData.id, formData);
        alert('Blog post updated successfully!');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await blogService.createBlog(formData as any);
        alert('Blog post created successfully!');
      }
      router.push('/admin/blogs');
    } catch {
      alert('Error saving blog post');
    }
  };

  return (
    <div className={styles.container}>
      <h1>{isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.main}>
            <section className={styles.section}>
              <h3>General Information</h3>
              <div className={styles.field}>
                <label>Post Title *</label>
                <input name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label>Slug *</label>
                <input name="slug" value={formData.slug} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label>Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange}>
                  <option value="1">Travel Tips</option>
                  <option value="2">Destinations</option>
                  <option value="3">Culture</option>
                </select>
              </div>
            </section>

            <section className={styles.section}>
              <h3>Content</h3>
              <div className={styles.field}>
                <label>Excerpt</label>
                <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} />
              </div>
              <div className={styles.field}>
                <label>Content (Markdown)</label>
                <textarea name="content" value={formData.content} onChange={handleChange} rows={12} />
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
              <h3>Status & Media</h3>
              <div className={styles.field}>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Published Date</label>
                <input type="date" name="publishedDate" value={formData.publishedDate} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label>Thumbnail URL</label>
                <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} />
                {formData.thumbnail && (
                  <div className={styles.imagePreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.thumbnail} alt="Preview" />
                  </div>
                )}
              </div>
            </section>

            <div className={styles.actions}>
              <button type="submit" className={styles.saveBtn}>Save Post</button>
              <button type="button" onClick={() => router.push('/admin/blogs')} className={styles.cancelBtn}>Cancel</button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
