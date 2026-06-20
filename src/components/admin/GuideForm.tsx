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

  // Basic Info State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [status, setStatus] = useState(initialData?.status || 'Draft');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');

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
      type: b.type,
      order: b.order,
      content: b.content
    })) || []
  );

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Fetch categories & tags
  useEffect(() => {
    async function fetchData() {
      try {
        const [catsRes, tagsRes] = await Promise.all([
          fetch('/api/guide-categories'),
          fetch('/api/guide-tags')
        ]);
        if (catsRes.ok) setCategories(await catsRes.json());
        if (tagsRes.ok) setTags(await tagsRes.json());
      } catch (err) {
        console.error('Error fetching categories/tags:', err);
      }
    }
    fetchData();
  }, []);

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
      status,
      categoryId: categoryId || null,
      tagIds: selectedTagIds,
      seo,
      blocks
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
        router.push('/admin/guides');
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
                                <input
                                  value={(block.content as any).url || ''}
                                  onChange={(e) => updateBlockContent(index, { url: e.target.value })}
                                  placeholder="https://images.unsplash.com/..."
                                  required
                                  disabled={!isAdmin}
                                />
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
                  <input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Đường dẫn hình ảnh lớn nhất..."
                    required
                    disabled={!isAdmin}
                  />
                  {coverImage && (
                    <img src={coverImage} alt="Cover Preview" style={{ width: '100%', borderRadius: '4px', marginTop: '10px', height: '120px', objectFit: 'cover' }} />
                  )}
                </div>

                <div className={styles.field}>
                  <label style={{ marginBottom: '8px', display: 'block' }}>Từ khóa Tags</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '4px' }}>
                    {tags.map(tag => (
                      <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={selectedTagIds.includes(tag.id)}
                          onChange={() => handleTagToggle(tag.id)}
                          disabled={!isAdmin}
                        />
                        {tag.name}
                      </label>
                    ))}
                    {tags.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Không có tag nào.</span>}
                  </div>
                </div>
              </section>

              <div className={styles.actions}>
                {isAdmin && (
                  <button type="submit" className={styles.saveBtn}>💾 Lưu Cẩm Nang</button>
                )}
                <button type="button" onClick={() => router.push('/admin/guides')} className={styles.cancelBtn}>Quay lại</button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Immersive Reading Preview Mode (Google Arts & Culture style) */
        <div style={{ background: '#000', color: '#fff', minHeight: '80vh', padding: '0', fontFamily: 'serif', position: 'relative' }}>
          {/* Header Hero Section */}
          <div style={{ position: 'relative', height: '80vh', display: 'flex', alignItems: 'flex-end', padding: '40px', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1)), url(${coverImage || '/logo.png'})` }}>
            <div style={{ maxWidth: '800px' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
                {categories.find(c => c.id === categoryId)?.name || 'CẨM NANG DU LỊCH'}
              </span>
              <h2 style={{ fontSize: '3rem', margin: '15px 0', fontFamily: 'Georgia, serif', lineHeight: '1.2' }}>{title || 'Tiêu đề câu chuyện mẫu'}</h2>
              <p style={{ fontSize: '1.25rem', color: '#cbd5e1', fontFamily: 'sans-serif', fontWeight: '300', margin: '0 0 20px 0' }}>{excerpt || 'Đoạn trích dẫn tóm tắt...'}</p>
              <div style={{ display: 'flex', gap: '15px', color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
                <span>Tác giả: Tour Chọn Lọc</span>
                <span>•</span>
                <span>Mới cập nhật</span>
                <span>•</span>
                <span>Đọc khoảng 5 phút</span>
              </div>
            </div>
          </div>

          {/* Reading Progress Indicator */}
          <div style={{ position: 'sticky', top: '0', left: '0', right: '0', height: '4px', background: '#38bdf8', width: '35%', zIndex: '100' }}></div>

          {/* Stories Render Loop */}
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', display: 'flex', flexDirection: 'column', gap: '60px' }}>
            {blocks.map((block, idx) => {
              const content = block.content as any;
              switch (block.type) {
                case 'Text':
                  return (
                    <div key={idx} style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#f1f5f9', whiteSpace: 'pre-line' }}>
                      {content.text || 'Nội dung văn bản câu chuyện của bạn ở đây...'}
                    </div>
                  );
                case 'Image':
                  return (
                    <div key={idx} style={{ textAlign: 'center' }}>
                      <img src={content.url || '/logo.png'} alt="Block" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', borderRadius: '4px' }} />
                      {content.caption && (
                        <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#94a3b8', marginTop: '10px', fontFamily: 'sans-serif' }}>{content.caption}</p>
                      )}
                    </div>
                  );
                case 'Quote':
                  return (
                    <blockquote key={idx} style={{ margin: '40px 0', paddingLeft: '20px', borderLeft: '4px solid #38bdf8', fontStyle: 'italic' }}>
                      <p style={{ fontSize: '1.75rem', lineHeight: '1.4', color: '#e2e8f0', marginBottom: '10px' }}>"{content.text || 'Câu trích dẫn nổi bật...'}"</p>
                      {content.author && <cite style={{ fontSize: '1rem', color: '#94a3b8', display: 'block', fontWeight: 'bold' }}>— {content.author}</cite>}
                    </blockquote>
                  );
                case 'Video':
                  return (
                    <div key={idx} style={{ position: 'relative', paddingBottom: '56.25%', height: '0', overflow: 'hidden', background: '#000', borderRadius: '4px' }}>
                      <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', border: '1px solid #334155' }}>
                        🎥 Video ({content.platform}): {content.url || 'Chưa cấu hình URL'}
                      </div>
                    </div>
                  );
                case 'CTA':
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
                      <a href={content.link || '#'} style={{ padding: '15px 40px', background: content.type === 'secondary' ? 'transparent' : '#38bdf8', border: content.type === 'secondary' ? '2px solid #38bdf8' : 'none', color: content.type === 'secondary' ? '#38bdf8' : '#000', textDecoration: 'none', fontWeight: 'bold', borderRadius: '30px', fontSize: '1.1rem', transition: 'all 0.2s' }}>
                        {content.text || 'Khám phá ngay'}
                      </a>
                    </div>
                  );
                case 'Gallery':
                  return (
                    <div key={idx} style={{ background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '10px' }}>🖼️ Trình xem ảnh Slider ({content.images?.length || 0} ảnh)</p>
                      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                        {(content.images || []).map((imgItem: any, idx: number) => (
                          <div key={idx} style={{ flexShrink: 0, width: '250px' }}>
                            <img src={imgItem.url || '/logo.png'} alt="Slide" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                            {imgItem.caption && <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '5px' }}>{imgItem.caption}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                case 'Timeline':
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '20px', borderLeft: '2px solid #334155' }}>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '-20px', marginBottom: '5px' }}>🍂 Lịch trình chuyến đi</p>
                      {(content.items || []).map((tlItem: TimelineItem, idx: number) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '-29px', top: '2px', background: '#38bdf8', color: '#000', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                            {tlItem.icon || '✓'}
                          </span>
                          <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#38bdf8' }}>{tlItem.title}</h4>
                          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem' }}>{tlItem.description}</p>
                        </div>
                      ))}
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
}
