'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Guide, GuideBlock, GuideCategory, GuideTag, GuideSEO, GuideBlockContent, TimelineItem } from '@/types/guide';
import styles from './tour-form.module.css';

interface GuideFormProps {
  initialData?: Guide;
  isEdit?: boolean;
}

// Helper to convert Vietnamese to Slug
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

export default function GuideForm({ initialData, isEdit }: GuideFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');
  const [country, setCountry] = useState(initialData?.country || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [status, setStatus] = useState<'Published' | 'Draft' | 'Scheduled'>(initialData?.status || 'Draft');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');

  // Related tours & FAQs states
  const [relatedTourIds, setRelatedTourIds] = useState<string[]>(
    initialData?.relatedTours?.map(rt => rt.tourId) || []
  );
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    initialData?.faqs || []
  );

  // Available tours list for linking
  const [availableTours, setAvailableTours] = useState<any[]>([]);

  // Media Library States
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [activeMediaTarget, setActiveMediaTarget] = useState<{ blockIndex?: number; field?: string; listIndex?: number } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Lists from DB
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [tags, setTags] = useState<GuideTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map(t => t.id) || []
  );

  // SEO State
  const [seo, setSeo] = useState<GuideSEO>({
    title: initialData?.seo?.title || '',
    description: initialData?.seo?.description || '',
    keywords: initialData?.seo?.keywords || '',
    ogTitle: initialData?.seo?.ogTitle || '',
    ogDescription: initialData?.seo?.ogDescription || '',
    ogImage: initialData?.seo?.ogImage || '',
    twitterTitle: initialData?.seo?.twitterTitle || '',
    twitterDescription: initialData?.seo?.twitterDescription || '',
    twitterImage: initialData?.seo?.twitterImage || ''
  });

  // Story Blocks State
  const [blocks, setBlocks] = useState<Omit<GuideBlock, 'id' | 'guideId'>[]>(
    initialData?.blocks?.map(b => ({
      type: b.type as any,
      order: b.order,
      content: b.content
    })) || []
  );

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [newTagInput, setNewTagInput] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const handleAddCustomTag = async () => {
    const val = newTagInput.trim();
    if (!val) return;

    // Check if tag already exists in tags list (case insensitive)
    const existingTag = tags.find(t => t.name.toLowerCase() === val.toLowerCase());
    if (existingTag) {
      if (!selectedTagIds.includes(existingTag.id)) {
        setSelectedTagIds(prev => [...prev, existingTag.id]);
      }
      setNewTagInput('');
      return;
    }

    try {
      const response = await fetch('/api/guide-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: val,
          slug: convertToSlug(val)
        })
      });

      if (response.ok) {
        const newTag = await response.json();
        setTags(prev => [...prev, newTag]);
        setSelectedTagIds(prev => [...prev, newTag.id]);
      } else {
        const errData = await response.json();
        alert(`Lỗi khi tạo thẻ: ${errData.error || 'Không thể tạo thẻ mới'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi kết nối server để tạo thẻ.');
    } finally {
      setNewTagInput('');
    }
  };

  // Fetch categories, tags, tours, and media
  useEffect(() => {
    async function fetchData() {
      try {
        const [catsRes, tagsRes, toursRes] = await Promise.all([
          fetch('/api/guide-categories'),
          fetch('/api/guide-tags'),
          fetch('/api/tours/search?q=')
        ]);
        if (catsRes.ok) setCategories(await catsRes.json());
        if (tagsRes.ok) setTags(await tagsRes.json());
        if (toursRes.ok) setAvailableTours(await toursRes.json());
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    }
    fetchData();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        setMediaList(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showMediaModal) {
      fetchMedia();
    }
  }, [showMediaModal]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const newMedia = await res.json();
        setMediaList(prev => [newMedia, ...prev]);
        selectMediaUrl(newMedia.url);
      } else {
        alert('Không thể tải ảnh lên. Vui lòng kiểm tra định dạng và quyền truy cập.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối xảy ra khi tải ảnh.');
    } finally {
      setUploading(false);
    }
  };

  const openMediaManager = (blockIndex?: number, field?: string, listIndex?: number) => {
    setActiveMediaTarget({ blockIndex, field, listIndex });
    setShowMediaModal(true);
  };

  const selectMediaUrl = (url: string) => {
    if (!activeMediaTarget) return;

    const { blockIndex, field, listIndex } = activeMediaTarget;
    if (blockIndex === undefined) {
      if (field === 'coverImage') setCoverImage(url);
      if (field === 'thumbnail') setThumbnail(url);
    } else {
      const block = blocks[blockIndex];
      const newContent = { ...(block.content as any) };
      if (listIndex !== undefined) {
        const newList = [...newContent[field!]];
        newList[listIndex] = { ...newList[listIndex], url };
        newContent[field!] = newList;
      } else {
        newContent[field!] = url;
      }
      updateBlockContent(blockIndex, newContent);
    }
    setShowMediaModal(false);
    setActiveMediaTarget(null);
  };

  // Auto-slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEdit) {
      setSlug(convertToSlug(val));
    }
  };

  // SEO Sync
  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSeo(prev => ({ ...prev, [name]: value }));
  };

  // Block handlers
  const addBlock = (type: GuideBlock['type']) => {
    let content: GuideBlockContent;
    switch (type) {
      case 'Text':
        content = { text: '' };
        break;
      case 'Image':
        content = { url: '', caption: '' };
        break;
      case 'Gallery':
        content = { images: [] };
        break;
      case 'Quote':
        content = { text: '', author: '' };
        break;
      case 'Video':
        content = { platform: 'youtube', url: '' };
        break;
      case 'CTA':
        content = { text: '', link: '', type: 'primary' };
        break;
      case 'Timeline':
        content = { items: [] };
        break;
      case 'InfoBox':
        content = { title: '', text: '', type: 'info' };
        break;
      case 'FAQ':
        content = { items: [] };
        break;
      case 'TourRelated':
        content = { tourId: '', customTitle: '' };
        break;
      case 'Divider':
        content = { style: 'solid' };
        break;
    }
    setBlocks(prev => [...prev, { type, order: prev.length, content }]);
  };

  const removeBlock = (index: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i })));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Reset orders
    setBlocks(updated.map((b, i) => ({ ...b, order: i })));
  };

  const updateBlockContent = (index: number, contentUpdates: Partial<GuideBlockContent>) => {
    setBlocks(prev =>
      prev.map((b, i) => {
        if (i === index) {
          return {
            ...b,
            content: { ...b.content, ...contentUpdates } as GuideBlockContent
          };
        }
        return b;
      })
    );
  };

  // Tag selection
  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      alert('Bạn không có quyền thực hiện hành động này. Chỉ Admin mới được tạo/sửa Cẩm Nang.');
      return;
    }

    const payload = {
      title,
      slug,
      excerpt,
      coverImage,
      thumbnail,
      country,
      city,
      status,
      categoryId: categoryId || null,
      tagIds: selectedTagIds,
      seo,
      blocks,
      relatedTourIds,
      faqs
    };

    try {
      const url = isEdit ? `/api/guides/admin/${initialData?.id}` : '/api/guides';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(isEdit ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        router.push('/admin/blogs');
        router.refresh();
      } else {
        const errData = await response.json();
        alert(`Lỗi: ${errData.error || 'Không thể hoàn tất thao tác'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi kết nối server.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{isEdit ? `Chỉnh sửa Cẩm Nang: ${initialData?.title}` : 'Tạo Cẩm Nang Mới (Arts & Culture Style)'}</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className={`${styles.createBtn} ${activeTab === 'edit' ? '' : styles.cancelBtn}`}
            style={{ background: activeTab === 'edit' ? 'var(--primary-color)' : '#94a3b8' }}
            onClick={() => setActiveTab('edit')}
          >
            ✏️ Trình chỉnh sửa
          </button>
          <button
            type="button"
            className={`${styles.createBtn} ${activeTab === 'preview' ? '' : styles.cancelBtn}`}
            style={{ background: activeTab === 'preview' ? '#0ea5e9' : '#94a3b8' }}
            onClick={() => setActiveTab('preview')}
          >
            👁️ Xem trước câu chuyện
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
          ⚠️ Bạn đang đăng nhập với quyền Editor. Chỉ có tài khoản Admin mới được phép Tạo hoặc Sửa đổi Cẩm Nang.
        </div>
      )}

      {activeTab === 'edit' ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            {/* Main Content Area */}
            <div className={styles.main}>
              {/* Basic Information */}
              <section className={styles.section}>
                <h3>Thông tin cơ bản</h3>
                <div className={styles.field}>
                  <label>Tiêu đề câu chuyện *</label>
                  <input
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Nhập tiêu đề hấp dẫn..."
                    required
                    disabled={!isAdmin}
                  />
                </div>
                <div className={styles.field}>
                  <label>Slug (Đường dẫn tĩnh URL) *</label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="tieu-de-cau-chuyen"
                    required
                    disabled={!isAdmin}
                  />
                </div>
                <div className={styles.field}>
                  <label>Mô tả ngắn (Excerpt) *</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Mô tả tóm tắt câu chuyện để hiển thị ở trang ngoài và tối ưu SEO..."
                    rows={3}
                    required
                    disabled={!isAdmin}
                  />
                </div>
              </section>

              {/* Page Block Builder */}
              <section className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0 }}>Story Builder (Xây dựng các khối nội dung)</h3>
                </div>

                <div className={styles.blockAdder} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '20px' }}>
                  <button type="button" onClick={() => addBlock('Text')} className={styles.createBtn} style={{ background: '#4f46e5' }} disabled={!isAdmin}>➕ Đoạn văn</button>
                  <button type="button" onClick={() => addBlock('Image')} className={styles.createBtn} style={{ background: '#0891b2' }} disabled={!isAdmin}>➕ Ảnh lớn</button>
                  <button type="button" onClick={() => addBlock('Gallery')} className={styles.createBtn} style={{ background: '#0d9488' }} disabled={!isAdmin}>➕ Slider ảnh</button>
                  <button type="button" onClick={() => addBlock('Quote')} className={styles.createBtn} style={{ background: '#db2777' }} disabled={!isAdmin}>➕ Trích dẫn</button>
                  <button type="button" onClick={() => addBlock('Video')} className={styles.createBtn} style={{ background: '#ea580c' }} disabled={!isAdmin}>➕ Video</button>
                  <button type="button" onClick={() => addBlock('CTA')} className={styles.createBtn} style={{ background: '#2563eb' }} disabled={!isAdmin}>➕ CTA Click</button>
                  <button type="button" onClick={() => addBlock('Timeline')} className={styles.createBtn} style={{ background: '#16a34a' }} disabled={!isAdmin}>➕ Lịch trình</button>
                  <button type="button" onClick={() => addBlock('InfoBox')} className={styles.createBtn} style={{ background: '#0f766e' }} disabled={!isAdmin}>➕ Hộp Lưu ý</button>
                  <button type="button" onClick={() => addBlock('FAQ')} className={styles.createBtn} style={{ background: '#0284c7' }} disabled={!isAdmin}>➕ FAQ</button>
                  <button type="button" onClick={() => addBlock('TourRelated')} className={styles.createBtn} style={{ background: '#4f46e5' }} disabled={!isAdmin}>➕ Tour Liên quan</button>
                  <button type="button" onClick={() => addBlock('Divider')} className={styles.createBtn} style={{ background: '#64748b' }} disabled={!isAdmin}>➕ Phân dòng</button>
                </div>

                {blocks.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    Chưa có khối nội dung nào. Nhấp vào các nút ở trên để bắt đầu kể câu chuyện của bạn!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {blocks.map((block, index) => (
                      <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        {/* Block Header Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem', color: '#475569' }}>
                            Khối #{index + 1}: {block.type}
                          </span>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0 || !isAdmin} style={{ padding: '4px 8px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>↑</button>
                            <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1 || !isAdmin} style={{ padding: '4px 8px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>↓</button>
                            <button type="button" onClick={() => removeBlock(index)} disabled={!isAdmin} style={{ padding: '4px 8px', background: '#fecaca', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }}>Xóa</button>
                          </div>
                        </div>

                        {/* Block Fields Content */}
                        <div style={{ padding: '15px' }}>
                          {block.type === 'Text' && (
                            <div className={styles.field} style={{ margin: 0 }}>
                              <label>Nội dung văn bản (Chấp nhận Markdown)</label>
                              <textarea
                                value={(block.content as any).text || ''}
                                onChange={(e) => updateBlockContent(index, { text: e.target.value })}
                                rows={6}
                                placeholder="Viết văn bản lôi cuốn ở đây..."
                                required
                                disabled={!isAdmin}
                              />
                            </div>
                          )}

                          {block.type === 'Image' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Đường dẫn hình ảnh (URL)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input
                                    value={(block.content as any).url || ''}
                                    onChange={(e) => updateBlockContent(index, { url: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                    required
                                    disabled={!isAdmin}
                                    style={{ flex: 1 }}
                                  />
                                  {isAdmin && (
                                    <button 
                                      type="button" 
                                      onClick={() => openMediaManager(index, 'url')}
                                      className={styles.createBtn}
                                      style={{ padding: '8px 12px', fontSize: '0.85rem', whiteSpace: 'nowrap', margin: 0, background: '#0284c7' }}
                                    >
                                      📂 Thư viện
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Chú thích chân ảnh (Caption)</label>
                                <input
                                  value={(block.content as any).caption || ''}
                                  onChange={(e) => updateBlockContent(index, { caption: e.target.value })}
                                  placeholder="Đèo Irohazaka mùa thu lá phong..."
                                  disabled={!isAdmin}
                                />
                              </div>
                              {(block.content as any).url && (
                                <img src={(block.content as any).url} alt="Preview" style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover', borderRadius: '4px', marginTop: '5px' }} />
                              )}
                            </div>
                          )}

                          {block.type === 'Quote' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Nội dung câu trích dẫn nổi bật</label>
                                <textarea
                                  value={(block.content as any).text || ''}
                                  onChange={(e) => updateBlockContent(index, { text: e.target.value })}
                                  rows={3}
                                  placeholder="Mùa thu Nhật Bản không chỉ là cảnh sắc, nó là một khúc giao hòa của tâm hồn..."
                                  required
                                  disabled={!isAdmin}
                                />
                              </div>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Tác giả / Nguồn trích dẫn</label>
                                <input
                                  value={(block.content as any).author || ''}
                                  onChange={(e) => updateBlockContent(index, { author: e.target.value })}
                                  placeholder="Ryokan Kawabata"
                                  disabled={!isAdmin}
                                />
                              </div>
                            </div>
                          )}

                          {block.type === 'Video' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px' }}>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Nền tảng</label>
                                <select
                                  value={(block.content as any).platform || 'youtube'}
                                  onChange={(e) => updateBlockContent(index, { platform: e.target.value as any })}
                                  disabled={!isAdmin}
                                >
                                  <option value="youtube">YouTube</option>
                                  <option value="tiktok">TikTok</option>
                                  <option value="facebook">Facebook</option>
                                  <option value="embed">Nhúng tùy chọn (Iframe)</option>
                                </select>
                              </div>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Đường dẫn Video / Đoạn mã Nhúng</label>
                                <input
                                  value={(block.content as any).url || ''}
                                  onChange={(e) => updateBlockContent(index, { url: e.target.value })}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  required
                                  disabled={!isAdmin}
                                />
                              </div>
                            </div>
                          )}

                          {block.type === 'CTA' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 150px', gap: '15px' }}>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Văn bản nút</label>
                                <input
                                  value={(block.content as any).text || ''}
                                  onChange={(e) => updateBlockContent(index, { text: e.target.value })}
                                  placeholder="Nhận báo giá ngay"
                                  required
                                  disabled={!isAdmin}
                                />
                              </div>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Đường dẫn nút</label>
                                <input
                                  value={(block.content as any).link || ''}
                                  onChange={(e) => updateBlockContent(index, { link: e.target.value })}
                                  placeholder="/contact hoặc /tours/nhat-ban"
                                  required
                                  disabled={!isAdmin}
                                />
                              </div>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Kiểu nút</label>
                                <select
                                  value={(block.content as any).type || 'primary'}
                                  onChange={(e) => updateBlockContent(index, { type: e.target.value as any })}
                                  disabled={!isAdmin}
                                >
                                  <option value="primary">Nổi bật (Primary)</option>
                                  <option value="secondary">Phụ (Secondary)</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {block.type === 'Gallery' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Danh sách hình ảnh trong Slider</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {((block.content as any).images || []).map((imgItem: any, imgIdx: number) => (
                                  <div key={imgIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                      <input
                                        style={{ flex: 1 }}
                                        value={imgItem.url}
                                        placeholder="Hình ảnh URL..."
                                        onChange={(e) => {
                                          const newImages = [...(block.content as any).images];
                                          newImages[imgIdx] = { ...newImages[imgIdx], url: e.target.value };
                                          updateBlockContent(index, { images: newImages });
                                        }}
                                        required
                                        disabled={!isAdmin}
                                      />
                                      {isAdmin && (
                                        <button 
                                          type="button" 
                                          onClick={() => openMediaManager(index, 'images', imgIdx)}
                                          className={styles.createBtn}
                                          style={{ padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap', margin: 0, background: '#0284c7' }}
                                        >
                                          📂
                                        </button>
                                      )}
                                    </div>
                                    <input
                                      style={{ flex: 1 }}
                                      value={imgItem.caption || ''}
                                      placeholder="Chú thích ảnh..."
                                      onChange={(e) => {
                                        const newImages = [...(block.content as any).images];
                                        newImages[imgIdx] = { ...newImages[imgIdx], caption: e.target.value };
                                        updateBlockContent(index, { images: newImages });
                                      }}
                                      disabled={!isAdmin}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newImages = (block.content as any).images.filter((_: any, i: number) => i !== imgIdx);
                                        updateBlockContent(index, { images: newImages });
                                      }}
                                      disabled={!isAdmin}
                                      style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                ))}
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = [...((block.content as any).images || []), { url: '', caption: '' }];
                                      updateBlockContent(index, { images: newImages });
                                    }}
                                    className={styles.createBtn}
                                    style={{ width: '150px', background: '#0f766e', fontSize: '0.8rem', padding: '6px' }}
                                  >
                                    + Thêm ảnh Slider
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {block.type === 'Timeline' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Các chặng lịch trình</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {((block.content as any).items || []).map((tlItem: TimelineItem, tlIdx: number) => (
                                  <div key={tlIdx} style={{ border: '1px dashed #e2e8f0', padding: '12px', borderRadius: '6px', position: 'relative' }}>
                                    {isAdmin && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newItems = (block.content as any).items.filter((_: any, i: number) => i !== tlIdx);
                                          updateBlockContent(index, { items: newItems });
                                        }}
                                        style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.75rem' }}
                                      >
                                        Xóa chặng
                                      </button>
                                    )}
                                    <div className={styles.field} style={{ marginBottom: '8px' }}>
                                      <label>Tiêu đề chặng *</label>
                                      <input
                                        value={tlItem.title}
                                        placeholder="Ví dụ: Chặng 1: Jozankei Onsen..."
                                        onChange={(e) => {
                                          const newItems = [...(block.content as any).items];
                                          newItems[tlIdx] = { ...newItems[tlIdx], title: e.target.value };
                                          updateBlockContent(index, { items: newItems });
                                        }}
                                        required
                                        disabled={!isAdmin}
                                      />
                                    </div>
                                    <div className={styles.field} style={{ marginBottom: '8px' }}>
                                      <label>Mô tả chặng *</label>
                                      <textarea
                                        value={tlItem.description}
                                        placeholder="Kinh nghiệm khám phá chặng..."
                                        rows={2}
                                        onChange={(e) => {
                                          const newItems = [...(block.content as any).items];
                                          newItems[tlIdx] = { ...newItems[tlIdx], description: e.target.value };
                                          updateBlockContent(index, { items: newItems });
                                        }}
                                        required
                                        disabled={!isAdmin}
                                      />
                                    </div>
                                    <div className={styles.field} style={{ margin: 0 }}>
                                      <label>Icon hiển thị (tùy chọn)</label>
                                      <input
                                        value={tlItem.icon || ''}
                                        placeholder="Ví dụ: 🍂, ✈️, ♨️..."
                                        onChange={(e) => {
                                          const newItems = [...(block.content as any).items];
                                          newItems[tlIdx] = { ...newItems[tlIdx], icon: e.target.value };
                                          updateBlockContent(index, { items: newItems });
                                        }}
                                        disabled={!isAdmin}
                                      />
                                    </div>
                                  </div>
                                ))}
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = [...((block.content as any).items || []), { title: '', description: '', icon: '' }];
                                      updateBlockContent(index, { items: newItems });
                                    }}
                                    className={styles.createBtn}
                                    style={{ width: '160px', background: '#15803d', fontSize: '0.8rem', padding: '6px' }}
                                  >
                                    + Thêm chặng chặng
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {block.type === 'InfoBox' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '15px' }}>
                                <div className={styles.field} style={{ margin: 0 }}>
                                  <label>Tiêu đề Hộp thông tin</label>
                                  <input
                                    value={(block.content as any).title || ''}
                                    onChange={(e) => updateBlockContent(index, { title: e.target.value })}
                                    placeholder="Lưu ý quan trọng, Mẹo hay..."
                                    disabled={!isAdmin}
                                  />
                                </div>
                                <div className={styles.field} style={{ margin: 0 }}>
                                  <label>Loại hộp</label>
                                  <select
                                    value={(block.content as any).type || 'info'}
                                    onChange={(e) => updateBlockContent(index, { type: e.target.value as any })}
                                    disabled={!isAdmin}
                                  >
                                    <option value="info">Thông tin (Info)</option>
                                    <option value="tip">Mẹo hay (Tip/Success)</option>
                                    <option value="warning">Cảnh báo (Warning)</option>
                                  </select>
                                </div>
                              </div>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Nội dung chi tiết</label>
                                <textarea
                                  value={(block.content as any).text || ''}
                                  onChange={(e) => updateBlockContent(index, { text: e.target.value })}
                                  rows={4}
                                  placeholder="Điền nội dung chi tiết của ghi chú..."
                                  required
                                  disabled={!isAdmin}
                                />
                              </div>
                            </div>
                          )}

                          {block.type === 'Divider' && (
                            <div className={styles.field} style={{ margin: 0 }}>
                              <label>Kiểu đường kẻ phân dòng</label>
                              <select
                                value={(block.content as any).style || 'solid'}
                                onChange={(e) => updateBlockContent(index, { style: e.target.value as any })}
                                disabled={!isAdmin}
                              >
                                <option value="solid">Đường liền (Solid)</option>
                                <option value="dashed">Đường đứt nét (Dashed)</option>
                                <option value="double">Đường kép (Double)</option>
                                <option value="none">Khoảng trắng trống (None)</option>
                              </select>
                            </div>
                          )}

                          {block.type === 'TourRelated' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Liên kết với Tour nổi bật</label>
                                <select
                                  value={(block.content as any).tourId || ''}
                                  onChange={(e) => updateBlockContent(index, { tourId: e.target.value })}
                                  disabled={!isAdmin}
                                  required
                                >
                                  <option value="">Chọn tour liên kết...</option>
                                  {availableTours.map(t => (
                                    <option key={t.id} value={t.id}>{t.title} ({t.durationDays}N/{t.durationNights}Đ)</option>
                                  ))}
                                </select>
                              </div>
                              <div className={styles.field} style={{ margin: 0 }}>
                                <label>Tiêu đề tùy chỉnh hiển thị (tùy chọn)</label>
                                <input
                                  value={(block.content as any).customTitle || ''}
                                  onChange={(e) => updateBlockContent(index, { customTitle: e.target.value })}
                                  placeholder="Ví dụ: Tour Nhật Bản Tháng 10 Giá Tốt Nhất..."
                                  disabled={!isAdmin}
                                />
                              </div>
                            </div>
                          )}

                          {block.type === 'FAQ' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Danh sách câu hỏi thường gặp (FAQs)</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {((block.content as any).items || []).map((faqItem: any, faqIdx: number) => (
                                  <div key={faqIdx} style={{ border: '1px dashed #e2e8f0', padding: '12px', borderRadius: '6px', position: 'relative' }}>
                                    {isAdmin && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newItems = (block.content as any).items.filter((_: any, i: number) => i !== faqIdx);
                                          updateBlockContent(index, { items: newItems });
                                        }}
                                        style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.75rem' }}
                                      >
                                        Xóa câu hỏi
                                      </button>
                                    )}
                                    <div className={styles.field} style={{ marginBottom: '8px' }}>
                                      <label>Câu hỏi *</label>
                                      <input
                                        value={faqItem.question}
                                        placeholder="Ví dụ: Đi Nhật Bản tháng 10 nên mặc gì?"
                                        onChange={(e) => {
                                          const newItems = [...(block.content as any).items];
                                          newItems[faqIdx] = { ...newItems[faqIdx], question: e.target.value };
                                          updateBlockContent(index, { items: newItems });
                                        }}
                                        required
                                        disabled={!isAdmin}
                                      />
                                    </div>
                                    <div className={styles.field} style={{ margin: 0 }}>
                                      <label>Câu trả lời *</label>
                                      <textarea
                                        value={faqItem.answer}
                                        placeholder="Điền câu trả lời chi tiết..."
                                        rows={3}
                                        onChange={(e) => {
                                          const newItems = [...(block.content as any).items];
                                          newItems[faqIdx] = { ...newItems[faqIdx], answer: e.target.value };
                                          updateBlockContent(index, { items: newItems });
                                        }}
                                        required
                                        disabled={!isAdmin}
                                      />
                                    </div>
                                  </div>
                                ))}
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = [...((block.content as any).items || []), { question: '', answer: '' }];
                                      updateBlockContent(index, { items: newItems });
                                    }}
                                    className={styles.createBtn}
                                    style={{ width: '160px', background: '#0891b2', fontSize: '0.8rem', padding: '6px' }}
                                  >
                                    + Thêm câu hỏi
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* SEO Configurations */}
              <section className={styles.section}>
                <h3>Cấu hình SEO Metadata (Dành cho công cụ tìm kiếm)</h3>
                <div className={styles.field}>
                  <label>SEO Title (Tối đa 60 ký tự)</label>
                  <input
                    name="title"
                    value={seo.title || ''}
                    onChange={handleSeoChange}
                    placeholder="Tiêu đề SEO hiển thị trên Google..."
                    maxLength={60}
                    disabled={!isAdmin}
                  />
                </div>
                <div className={styles.field}>
                  <label>SEO Description (Tối đa 160 ký tự)</label>
                  <textarea
                    name="description"
                    value={seo.description || ''}
                    onChange={handleSeoChange}
                    placeholder="Đoạn văn ngắn tóm tắt tối ưu SEO..."
                    rows={2}
                    maxLength={160}
                    disabled={!isAdmin}
                  />
                </div>
                <div className={styles.field}>
                  <label>Từ khóa SEO (Keywords, cách nhau bằng dấu phẩy)</label>
                  <input
                    name="keywords"
                    value={seo.keywords || ''}
                    onChange={handleSeoChange}
                    placeholder="nhat ban, la do, kinh nghiem, tour..."
                    disabled={!isAdmin}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                  <div className={styles.field}>
                    <label>Open Graph (Facebook) Title</label>
                    <input
                      name="ogTitle"
                      value={seo.ogTitle || ''}
                      onChange={handleSeoChange}
                      placeholder="Tiêu đề chia sẻ mạng xã hội..."
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Open Graph (Facebook) Description</label>
                    <input
                      name="ogDescription"
                      value={seo.ogDescription || ''}
                      onChange={handleSeoChange}
                      placeholder="Mô tả khi share Facebook..."
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Open Graph Image URL (Ảnh khi share link)</label>
                  <input
                    name="ogImage"
                    value={seo.ogImage || ''}
                    onChange={handleSeoChange}
                    placeholder="Đường dẫn ảnh bìa khi chia sẻ link..."
                    disabled={!isAdmin}
                  />
                </div>
              </section>
            </div>

            {/* Sidebar Controls Area */}
            <div className={styles.sidebar}>
              <section className={styles.section}>
                <h3>Thiết lập xuất bản</h3>
                <div className={styles.field}>
                  <label>Trạng thái</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as 'Published' | 'Draft' | 'Scheduled')} disabled={!isAdmin}>
                    <option value="Draft">Bản nháp (Draft)</option>
                    <option value="Published">Công khai (Published)</option>
                    <option value="Scheduled">Hẹn giờ đăng (Scheduled)</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Danh mục Cẩm Nang</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={!isAdmin}>
                    <option value="">Chọn danh mục...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </section>

              <section className={styles.section}>
                <h3>Ảnh đại diện & Tags</h3>
                <div className={styles.field}>
                  <label>Ảnh bìa chính (Cover Image URL) *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="Đường dẫn hình ảnh lớn nhất..."
                      required
                      disabled={!isAdmin}
                      style={{ flex: 1 }}
                    />
                    {isAdmin && (
                      <button 
                        type="button" 
                        onClick={() => openMediaManager(undefined, 'coverImage')}
                        className={styles.createBtn}
                        style={{ padding: '8px 12px', fontSize: '0.85rem', whiteSpace: 'nowrap', margin: 0, background: '#0284c7' }}
                      >
                        📂 Thư viện
                      </button>
                    )}
                  </div>
                  {coverImage && (
                    <img src={coverImage} alt="Cover Preview" style={{ width: '100%', borderRadius: '4px', marginTop: '10px', height: '120px', objectFit: 'cover' }} />
                  )}
                </div>

                <div className={styles.field}>
                  <label>Ảnh đại diện nhỏ (Thumbnail URL) *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      placeholder="Ảnh nhỏ làm thumbnail..."
                      required
                      disabled={!isAdmin}
                      style={{ flex: 1 }}
                    />
                    {isAdmin && (
                      <button 
                        type="button" 
                        onClick={() => openMediaManager(undefined, 'thumbnail')}
                        className={styles.createBtn}
                        style={{ padding: '8px 12px', fontSize: '0.85rem', whiteSpace: 'nowrap', margin: 0, background: '#0284c7' }}
                      >
                        📂 Thư viện
                      </button>
                    )}
                  </div>
                  {thumbnail && (
                    <img src={thumbnail} alt="Thumbnail Preview" style={{ width: '100%', borderRadius: '4px', marginTop: '10px', height: '80px', objectFit: 'cover' }} />
                  )}
                </div>

                <div className={styles.field}>
                  <label style={{ marginBottom: '8px', display: 'block', fontWeight: 'bold', color: '#0f172a' }}>Từ khóa Tags (Nhấp mới hoặc click chọn)</label>
                  
                  {/* Selected Tags list as chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {selectedTagIds.map(id => {
                      const tag = tags.find(t => t.id === id);
                      if (!tag) return null;
                      return (
                        <span 
                          key={id} 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            background: 'var(--primary-color, #4f46e5)', 
                            color: 'white', 
                            padding: '4px 10px', 
                            borderRadius: '16px', 
                            fontSize: '0.8rem', 
                            fontWeight: 600,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                        >
                          #{tag.name}
                          {isAdmin && (
                            <button 
                              type="button" 
                              onClick={() => handleTagToggle(id)} 
                              style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'white', 
                                marginLeft: '6px', 
                                cursor: 'pointer', 
                                padding: 0, 
                                fontSize: '0.95rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%'
                              }}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      );
                    })}
                    {selectedTagIds.length === 0 && (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Chưa chọn tag nào.</span>
                    )}
                  </div>

                  {/* Input for adding new tag */}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTag();
                          }
                        }}
                        placeholder="Nhập tag mới rồi ấn Enter..."
                        style={{ 
                          flex: 1, 
                          padding: '8px 12px', 
                          border: '1px solid #cbd5e1', 
                          borderRadius: '6px',
                          fontSize: '0.9rem'
                        }}
                      />
                      <button 
                        type="button" 
                        onClick={handleAddCustomTag} 
                        style={{ 
                          margin: 0, 
                          padding: '8px 16px', 
                          background: '#10b981', 
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Thêm
                      </button>
                    </div>
                  )}

                  {/* Available tag suggestions (unselected ones) */}
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Chọn từ tag phổ biến:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '6px', background: '#f8fafc' }}>
                      {tags.filter(t => !selectedTagIds.includes(t.id)).map(tag => (
                        <span
                          key={tag.id}
                          onClick={() => handleTagToggle(tag.id)}
                          style={{
                            background: 'white',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'all 0.15s',
                            boxShadow: '0 1px 1px rgba(0,0,0,0.02)'
                          }}
                        >
                          + {tag.name}
                        </span>
                      ))}
                      {tags.filter(t => !selectedTagIds.includes(t.id)).length === 0 && (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>Không còn tag gợi ý nào.</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <div className={styles.actions}>
                {isAdmin && (
                  <button type="submit" className={styles.saveBtn}>💾 Lưu Cẩm Nang</button>
                )}
                <button type="button" onClick={() => router.push('/admin/blogs')} className={styles.cancelBtn}>Quay lại</button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Immersive Reading Preview Mode (Premium Editorial Magazine Layout) */
        <div style={{ background: '#f4f1ea', color: '#1e293b', minHeight: '80vh', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          
          {/* Preview Device Selector toolbar */}
          <div style={{ 
            width: '100%', 
            maxWidth: '1000px', 
            background: 'white', 
            borderRadius: '8px', 
            padding: '12px 20px', 
            marginBottom: '20px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', fontFamily: 'sans-serif' }}>Xem trước bài viết:</span>
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: previewDevice === 'desktop' ? 'var(--primary-color, #4f46e5)' : 'white',
                  color: previewDevice === 'desktop' ? 'white' : '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontFamily: 'sans-serif'
                }}
              >
                💻 Máy tính (Desktop)
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: previewDevice === 'mobile' ? 'var(--primary-color, #4f46e5)' : 'white',
                  color: previewDevice === 'mobile' ? 'white' : '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontFamily: 'sans-serif'
                }}
              >
                📱 Điện thoại (Mobile)
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', fontFamily: 'sans-serif' }}>
              * Giao diện mô phỏng khớp 95% với hiển thị thực tế trên website
            </div>
          </div>

          {/* Simulated Screen Width Box */}
          <div style={{
            width: '100%',
            maxWidth: previewDevice === 'mobile' ? '390px' : '1000px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            transition: 'max-width 0.3s ease',
            border: previewDevice === 'mobile' ? '12px solid #1e293b' : '1px solid #e2e8f0', 
            minHeight: '75vh',
            fontFamily: 'Georgia, serif'
          }}>
            {/* Header Hero Cover */}
            <div style={{ 
              position: 'relative', 
              height: previewDevice === 'mobile' ? '400px' : '550px', 
              display: 'flex', 
              alignItems: 'flex-end', 
              padding: previewDevice === 'mobile' ? '20px' : '50px', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.25)), url(${coverImage || '/logo.png'})` 
            }}>
              <div style={{ maxWidth: '800px', zIndex: 1 }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 'bold', fontFamily: 'sans-serif', display: 'block', marginBottom: '8px' }}>
                  {categories.find(c => c.id === categoryId)?.name || 'CẨM NANG DU LỊCH'}
                </span>
                <h2 style={{ fontSize: previewDevice === 'mobile' ? '1.8rem' : '2.8rem', color: '#ffffff', margin: '0 0 15px 0', fontFamily: 'Georgia, serif', lineHeight: '1.25', fontWeight: 'normal' }}>
                  {title || 'Tiêu đề câu chuyện du lịch'}
                </h2>
                <p style={{ fontSize: previewDevice === 'mobile' ? '1rem' : '1.15rem', color: '#cbd5e1', fontFamily: 'sans-serif', fontWeight: '300', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                  {excerpt || 'Mô tả tóm tắt chuyến hành trình...'}
                </p>
                <div style={{ display: 'flex', gap: '15px', color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>
                  <span>Tác giả: Tour Chọn Lọc</span>
                  <span>•</span>
                  <span>Thời gian đọc: 5 phút</span>
                </div>
              </div>
            </div>

            {/* Simulated Reading Progress */}
            <div style={{ height: '3px', background: '#38bdf8', width: '45%' }}></div>

            {/* Layout Columns container */}
            <div style={{ 
              display: 'flex', 
              gap: '40px', 
              padding: previewDevice === 'mobile' ? '24px 16px' : '48px 32px',
              maxWidth: '1000px',
              margin: '0 auto',
              flexDirection: 'row'
            }}>
              {/* Main Content Area */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {blocks.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px', fontFamily: 'sans-serif' }}>
                    Chưa có khối nội dung nào. Chuyển sang "Trình chỉnh sửa" để soạn thảo.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {blocks.map((block, idx) => {
                      const content = block.content as any;
                      
                      switch (block.type) {
                        case 'Text': {
                          if (!content.text) return null;
                          const lines = content.text.split('\n');
                          return (
                            <div key={idx} style={{ color: '#1e293b' }}>
                              {lines.map((line: string, lIdx: number) => {
                                const trimmed = line.trim();
                                if (trimmed.startsWith('### ')) {
                                  return <h4 key={lIdx} style={{ fontSize: '1.25rem', fontFamily: 'Georgia, serif', margin: '24px 0 12px 0', color: '#0f172a', fontWeight: 'bold' }}>{trimmed.substring(4)}</h4>;
                                }
                                if (trimmed.startsWith('## ')) {
                                  return <h3 key={lIdx} style={{ fontSize: '1.5rem', fontFamily: 'Georgia, serif', margin: '32px 0 16px 0', color: '#0f172a', fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>{trimmed.substring(3)}</h3>;
                                }
                                if (trimmed.startsWith('# ')) {
                                  return <h2 key={lIdx} style={{ fontSize: '1.8rem', fontFamily: 'Georgia, serif', margin: '40px 0 20px 0', color: '#0f172a', fontWeight: 'bold' }}>{trimmed.substring(2)}</h2>;
                                }
                                if (trimmed.startsWith('> ')) {
                                  return <blockquote key={lIdx} style={{ borderLeft: '4px solid #0ea5e9', background: '#f8fafc', padding: '12px 20px', margin: '20px 0', fontStyle: 'italic', color: '#475569', fontSize: '1.05rem', fontFamily: 'Georgia, serif' }}>{trimmed.substring(2)}</blockquote>;
                                }
                                if (trimmed === '') return <div key={lIdx} style={{ height: '12px' }} />;
                                return <p key={lIdx} style={{ margin: '0 0 16px 0', fontSize: '1.08rem', lineHeight: '1.85', color: '#334155' }}>{trimmed}</p>;
                              })}
                            </div>
                          );
                        }

                        case 'Image':
                          return (
                            <figure key={idx} style={{ margin: '20px 0', textAlign: 'center' }}>
                              <img src={content.url || '/images/guides/v1.jpg'} alt="Block preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }} />
                              {content.caption && (
                                <figcaption style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#64748b', marginTop: '8px', fontFamily: 'sans-serif' }}>{content.caption}</figcaption>
                              )}
                            </figure>
                          );

                        case 'Quote':
                          return (
                            <div key={idx} style={{ margin: '30px 0', padding: '0 30px', textAlign: 'center' }}>
                              <blockquote style={{ fontSize: '1.5rem', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#0f172a', lineHeight: '1.45', border: 'none', padding: 0 }}>
                                "{content.text || 'Câu trích dẫn đặc sắc...'}"
                                {content.author && <cite style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontStyle: 'normal', fontWeight: 'bold', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'sans-serif' }}>— {content.author}</cite>}
                              </blockquote>
                            </div>
                          );

                        case 'Video':
                          return (
                            <div key={idx} style={{ margin: '20px 0', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#475569', gap: '8px', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(${coverImage || '/logo.png'})` }}>
                                <span style={{ fontSize: '2.5rem' }}>▶️</span>
                                <span style={{ fontWeight: 'bold', fontFamily: 'sans-serif', fontSize: '0.95rem' }}>Xem Video ({content.platform === 'youtube' ? 'YouTube' : 'Khác'})</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all', maxWidth: '80%', textAlign: 'center', fontFamily: 'sans-serif' }}>{content.url || 'Chưa liên kết video'}</span>
                              </div>
                            </div>
                          );

                        case 'CTA':
                          return (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'center', margin: '25px 0' }}>
                              <a href={content.link || '#'} style={{ padding: '12px 30px', background: content.type === 'secondary' ? 'white' : 'var(--primary-color, #4f46e5)', border: '2px solid var(--primary-color, #4f46e5)', color: content.type === 'secondary' ? 'var(--primary-color, #4f46e5)' : 'white', textDecoration: 'none', fontWeight: 'bold', borderRadius: '30px', fontSize: '0.95rem', fontFamily: 'sans-serif', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)' }}>
                                {content.text || 'Khám phá ngay'}
                              </a>
                            </div>
                          );

                        case 'Gallery':
                          return (
                            <div key={idx} style={{ margin: '20px 0', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <h5 style={{ margin: '0 0 10px 0', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', color: '#64748b' }}>📸 BỘ SƯU TẬP HÌNH ẢNH</h5>
                              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                                {(content.images || []).map((imgItem: any, iIdx: number) => (
                                  <div key={iIdx} style={{ flexShrink: 0, width: '200px' }}>
                                    <img src={imgItem.url || '/images/guides/v1.jpg'} alt="Slide preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }} />
                                    {imgItem.caption && <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: '4px', fontFamily: 'sans-serif' }}>{imgItem.caption}</p>}
                                  </div>
                                ))}
                                {(!content.images || content.images.length === 0) && (
                                  <div style={{ padding: '10px', color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', fontFamily: 'sans-serif' }}>Chưa có ảnh nào.</div>
                                )}
                              </div>
                            </div>
                          );

                        case 'Timeline':
                          return (
                            <div key={idx} style={{ margin: '30px 0' }}>
                              <h5 style={{ margin: '0 0 16px 0', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', color: '#64748b' }}>📅 LỊCH TRÌNH CHI TIẾT</h5>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '20px', borderLeft: '2px solid #e2e8f0', position: 'relative', marginLeft: '10px' }}>
                                {(content.items || []).map((tlItem: TimelineItem, tIdx: number) => (
                                  <div key={tIdx} style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '-29px', top: '2px', background: '#4f46e5', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                      {tlItem.icon || '✓'}
                                    </span>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#0f172a', fontFamily: 'sans-serif', fontWeight: 'bold' }}>{tlItem.title || 'Chặng dừng'}</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', fontFamily: 'sans-serif' }}>{tlItem.description || 'Chi tiết chặng đi...'}</p>
                                  </div>
                                ))}
                                {(!content.items || content.items.length === 0) && (
                                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', fontFamily: 'sans-serif' }}>Chưa có chặng lịch trình.</div>
                                )}
                              </div>
                            </div>
                          );

                        case 'InfoBox':
                          return (
                            <div key={idx} style={{ 
                              padding: '16px 20px', 
                              borderRadius: '8px', 
                              background: content.type === 'warning' ? '#fef2f2' : content.type === 'tip' ? '#f0fdf4' : '#f0f9ff', 
                              borderLeft: `4px solid ${content.type === 'warning' ? '#ef4444' : content.type === 'tip' ? '#22c55e' : '#0ea5e9'}`, 
                              margin: '20px 0' 
                            }}>
                              <h4 style={{ margin: '0 0 6px 0', color: content.type === 'warning' ? '#b91c1c' : content.type === 'tip' ? '#15803d' : '#0369a1', fontSize: '0.9rem', fontFamily: 'sans-serif', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {content.type === 'warning' ? '⚠️ LƯU Ý QUAN TRỌNG' : content.type === 'tip' ? '💡 MẸO DU LỊCH HAY' : 'ℹ️ THÔNG TIN HỮU ÍCH'}: {content.title || 'Lưu ý'}
                              </h4>
                              <p style={{ margin: 0, color: '#334155', fontSize: '0.9rem', lineHeight: '1.55', fontFamily: 'sans-serif' }}>{content.text}</p>
                            </div>
                          );

                        case 'Divider':
                          return (
                            <div key={idx} style={{ margin: '25px 0', textAlign: 'center' }}>
                              <hr style={{ border: 'none', borderTop: content.style === 'dashed' ? '1px dashed #cbd5e1' : content.style === 'double' ? '3px double #cbd5e1' : '1px solid #cbd5e1', opacity: content.style === 'none' ? 0 : 0.8 }} />
                            </div>
                          );

                        case 'FAQ':
                          return (
                            <div key={idx} style={{ margin: '25px 0', fontFamily: 'sans-serif' }}>
                              <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '1.15rem', fontWeight: 'bold' }}>❓ GIẢI ĐÁP CÂU HỎI THƯỜNG GẶP</h4>
                              {(content.items || []).map((faq: any, fIdx: number) => (
                                <div key={fIdx} style={{ marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                                  <div style={{ padding: '10px 14px', background: '#f8fafc', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
                                    <span>Q:</span> <span>{faq.question || 'Câu hỏi?'}</span>
                                  </div>
                                  <div style={{ padding: '10px 14px', color: '#475569', fontSize: '0.85rem', lineHeight: '1.5', background: 'white' }}>
                                    {faq.answer || 'Câu trả lời...'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );

                        case 'TourRelated':
                          return (
                            <div key={idx} style={{ padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', margin: '25px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', gap: '12px', flexDirection: previewDevice === 'mobile' ? 'column' : 'row', fontFamily: 'sans-serif' }}>
                              <div style={{ 
                                width: previewDevice === 'mobile' ? '100%' : '140px', 
                                height: '95px', 
                                background: '#cbd5e1', 
                                borderRadius: '6px', 
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundImage: 'url(/images/guides/v1.jpg)'
                              }} />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                  <span style={{ fontSize: '0.65rem', color: '#4f46e5', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chương trình tour đề xuất</span>
                                  <h4 style={{ margin: '2px 0 4px 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: 'bold' }}>{content.customTitle || 'Tour du lịch hấp dẫn liên kết'}</h4>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Mã Tour: {content.tourId || 'chưa chọn'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                  <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '0.85rem' }}>Đặt tour giá tốt nhất</span>
                                  <span style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 'bold' }}>Chi tiết →</span>
                                </div>
                              </div>
                            </div>
                          );

                        default:
                          return null;
                      }
                    })}

                    {/* Author Section Mock */}
                    <div style={{ borderTop: '2px solid #f1f5f9', marginTop: '40px', paddingTop: '24px', display: 'flex', gap: '15px', fontFamily: 'sans-serif' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#cbd5e1', flexShrink: 0, backgroundSize: 'cover', backgroundImage: 'url(/chatbotLogo.png)' }} />
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>BIÊN TẬP VIÊN DU LỊCH</span>
                        <h5 style={{ margin: '1px 0 4px 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: 'bold' }}>Chuyên gia Tour Chọn Lọc</h5>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.45' }}>Đam mê chia sẻ kinh nghiệm hành trình thực tế, văn hóa bản địa độc đáo và những bí kíp tối ưu chi phí chuyến đi.</p>
                      </div>
                    </div>

                    {/* Newsletter Subscription Block Mock */}
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 'bold' }}>Nhận cảm hứng hành trình kế tiếp</h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>Đăng ký để nhận những cẩm nang du lịch độc quyền và ưu đãi sớm nhất từ Tour Chọn Lọc.</p>
                      <div style={{ display: 'flex', gap: '8px', maxWidth: '360px', margin: '0 auto' }}>
                        <input placeholder="Email của bạn..." disabled style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', background: 'white' }} />
                        <button type="button" disabled style={{ background: '#0f172a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem' }}>Đăng ký</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Sidebar (Desktop only) */}
              {previewDevice === 'desktop' && (
                <div style={{ width: '220px', flexShrink: 0, fontFamily: 'sans-serif' }}>
                  <div style={{ position: 'sticky', top: '20px', borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>MỤC LỤC BÀI VIẾT</h5>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                      <li style={{ color: '#4f46e5', fontWeight: 'bold' }}>📍 Tổng quan hành trình</li>
                      <li style={{ color: '#64748b' }}>📖 Nội dung chính</li>
                      <li style={{ color: '#64748b' }}>💡 Lịch trình & Lưu ý</li>
                      <li style={{ color: '#64748b' }}>❓ Câu hỏi thường gặp</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Manager Modal */}
      {showMediaModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            {/* Header */}
            <div style={{
              padding: '15px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Thư viện phương tiện (Media Manager)</h3>
              <button 
                type="button" 
                onClick={() => { setShowMediaModal(false); setActiveMediaTarget(null); }}
                style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {/* Upload area */}
              <div style={{
                border: '2px dashed #cbd5e1',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center',
                background: '#f8fafc',
                marginBottom: '20px'
              }}>
                <p style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '0.9rem' }}>Kéo thả hoặc chọn tệp từ máy tính của bạn (JPG, PNG, WEBP)</p>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                  id="media-file-input"
                />
                <button 
                  type="button"
                  onClick={() => document.getElementById('media-file-input')?.click()}
                  className={styles.createBtn}
                  style={{ background: '#2563eb', margin: 0 }}
                  disabled={uploading}
                >
                  {uploading ? 'Đang tải lên...' : '📤 Tải ảnh lên'}
                </button>
              </div>

              {/* Grid list of images */}
              <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Ảnh đã tải lên</h4>
              {mediaList.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>Chưa có phương tiện nào trong thư viện.</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '12px'
                }}>
                  {mediaList.map((media) => (
                    <div 
                      key={media.id}
                      onClick={() => selectMediaUrl(media.url)}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        background: '#f8fafc',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <img 
                        src={media.url} 
                        alt={media.filename} 
                        style={{ width: '100%', height: '90px', objectFit: 'cover' }}
                      />
                      <div style={{
                        padding: '4px 6px',
                        fontSize: '0.75rem',
                        color: '#475569',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        background: 'white'
                      }}>
                        {media.filename}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button 
                type="button"
                onClick={() => { setShowMediaModal(false); setActiveMediaTarget(null); }}
                className={styles.cancelBtn}
                style={{ margin: 0 }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
