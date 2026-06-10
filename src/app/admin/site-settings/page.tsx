'use client';

import React, { useState, useEffect } from 'react';
import { siteSettingsService } from '@/services/siteSettingsService';
import { SiteSettings } from '@/types/siteSettings';
import styles from './settings.module.css';

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await siteSettingsService.getSettings();
      setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSave = async () => {
    if (settings) {
      await siteSettingsService.updateSettings(settings);
      alert('Settings saved successfully!');
    }
  };

  // Search & Pagination & Tabs
  const [activeTab, setActiveTab] = useState<'visual' | 'bulk'>('visual');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    imageUrl: '',
    affiliateUrl: '',
  });

  // Bulk JSON State
  const [bulkJson, setBulkJson] = useState('');

  useEffect(() => {
    if (settings && settings.affiliateGear) {
      setBulkJson(JSON.stringify(settings.affiliateGear, null, 2));
    }
  }, [settings]);

  const handleOpenAdd = () => {
    setFormState({ title: '', description: '', imageUrl: '', affiliateUrl: '' });
    setModalMode('add');
    setEditIndex(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (indexInFiltered: number) => {
    const actualIndex = masterIndexOfFiltered(indexInFiltered);
    if (actualIndex === -1 || !settings) return;
    const gearList = (settings.affiliateGear as any[]) || [];
    const item = gearList[actualIndex];
    
    setFormState({
      title: item.title || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      affiliateUrl: item.affiliateUrl || '',
    });
    setModalMode('edit');
    setEditIndex(actualIndex);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!settings) return;
    const gearList = [...((settings.affiliateGear as any[]) || [])];
    
    if (modalMode === 'add') {
      gearList.push({ ...formState });
    } else if (modalMode === 'edit' && editIndex !== null) {
      gearList[editIndex] = { ...formState };
    }
    
    setSettings({ ...settings, affiliateGear: gearList });
    setIsModalOpen(false);
  };

  const handleDeleteItem = (indexInFiltered: number) => {
    const actualIndex = masterIndexOfFiltered(indexInFiltered);
    if (actualIndex === -1 || !settings) return;
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      const gearList = ((settings.affiliateGear as any[]) || []).filter((_, i) => i !== actualIndex);
      setSettings({ ...settings, affiliateGear: gearList });
      
      const newFilteredCount = gearList.filter(item => 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).length;
      const maxPage = Math.ceil(newFilteredCount / itemsPerPage) || 1;
      if (currentPage > maxPage) {
        setCurrentPage(maxPage);
      }
    }
  };

  const masterIndexOfFiltered = (filteredIndex: number) => {
    if (!settings) return -1;
    const gearList = (settings.affiliateGear as any[]) || [];
    let count = 0;
    for (let i = 0; i < gearList.length; i++) {
      if ((gearList[i].title || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        if (count === filteredIndex) {
          return i;
        }
        count++;
      }
    }
    return -1;
  };

  const handleApplyBulkJson = () => {
    if (!settings) return;
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) {
        alert('Dữ liệu JSON phải là một danh sách (Mảng/Array) các đối tượng.');
        return;
      }
      for (const item of parsed) {
        if (typeof item !== 'object' || item === null) {
          alert('Mỗi sản phẩm phải là một đối tượng JSON.');
          return;
        }
        if (!item.title || !item.affiliateUrl) {
          alert('Mỗi sản phẩm bắt buộc phải có trường "title" và "affiliateUrl".');
          return;
        }
      }
      
      setSettings({ ...settings, affiliateGear: parsed });
      alert('Áp dụng dữ liệu JSON thành công! Hãy nhấn "Save Settings" bên dưới để lưu vào CSDL.');
      setActiveTab('visual');
      setCurrentPage(1);
    } catch (e) {
      alert('Định dạng JSON không hợp lệ! Vui lòng kiểm tra lại cú pháp (ngoặc kép, dấu phẩy...). Lỗi: ' + (e as Error).message);
    }
  };

  if (!settings) return <div>Loading settings...</div>;

  const affiliateGearList = (settings.affiliateGear as any[]) || [];
  
  const filteredItems = affiliateGearList.filter(item => 
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.container}>
      <h1>Site Settings</h1>
      
      <div className={styles.card}>
        <section className={styles.section}>
          <h3>General Information</h3>
          <div className={styles.field}>
            <label>Website Name</label>
            <input name="websiteName" value={settings.websiteName} onChange={handleInputChange} />
          </div>
          <div className={styles.field}>
            <label>Tagline</label>
            <input name="tagline" value={settings.tagline} onChange={handleInputChange} />
          </div>
        </section>

        <section className={styles.section}>
          <h3>Hero Section</h3>
          <div className={styles.field}>
            <label>Hero Headline</label>
            <input name="heroHeadline" value={settings.heroHeadline} onChange={handleInputChange} />
          </div>
          <div className={styles.field}>
            <label>Hero Subtitle</label>
            <textarea name="heroSubtitle" value={settings.heroSubtitle} onChange={handleInputChange} rows={3} />
          </div>
          <div className={styles.field}>
            <label>Hero Image URL</label>
            <input name="heroImage" value={settings.heroImage} onChange={handleInputChange} />
          </div>
        </section>

        <section className={styles.section}>
          <h3>Contact Details</h3>
          <div className={styles.field}>
            <label>Primary Email</label>
            <input value={settings.contactInfo.email[0]} onChange={(e) => {
              const newEmails = [...settings.contactInfo.email];
              newEmails[0] = e.target.value;
              setSettings({...settings, contactInfo: {...settings.contactInfo, email: newEmails}});
            }} />
          </div>
          <div className={styles.field}>
            <label>Primary Phone</label>
            <input value={settings.contactInfo.phone[0]} onChange={(e) => {
              const newPhones = [...settings.contactInfo.phone];
              newPhones[0] = e.target.value;
              setSettings({...settings, contactInfo: {...settings.contactInfo, phone: newPhones}});
            }} />
          </div>
        </section>

        <section className={styles.section}>
          <h3>Hành trang cần thiết (Affiliate Marketing)</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Quản lý danh sách sản phẩm gợi ý hiển thị trên trang chi tiết tour. Tối ưu hóa hiệu năng và thao tác khi quản lý số lượng lớn sản phẩm.
          </p>
          
          <div className={styles.tabGroup}>
            <button 
              type="button" 
              className={`${styles.tab} ${activeTab === 'visual' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('visual')}
            >
              Danh sách trực quan
            </button>
            <button 
              type="button" 
              className={`${styles.tab} ${activeTab === 'bulk' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('bulk')}
            >
              Nhập/Xuất JSON nhanh (Bulk Edit)
            </button>
          </div>

          {activeTab === 'visual' ? (
            <>
              <div className={styles.gearControls}>
                <input 
                  type="text" 
                  className={styles.searchBar}
                  placeholder="Tìm kiếm tên sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
                  + Thêm sản phẩm mới
                </button>
              </div>

              <div className={styles.compactTableWrapper}>
                <table className={styles.compactTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Ảnh</th>
                      <th>Tên sản phẩm</th>
                      <th>Mô tả</th>
                      <th>Affiliate Link</th>
                      <th style={{ width: '160px', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                          Không có sản phẩm nào khớp với tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map((item: any, idx: number) => {
                        const indexInFiltered = (currentPage - 1) * itemsPerPage + idx;
                        return (
                          <tr key={idx}>
                            <td>
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} className={styles.thumbnail} />
                              ) : (
                                <div className={styles.thumbnailPlaceholder}>📦</div>
                              )}
                            </td>
                            <td style={{ fontWeight: 600 }}>{item.title}</td>
                            <td style={{ fontSize: '13px', color: '#64748b' }}>
                              {item.description || <em style={{ color: '#cbd5e1' }}>Không có mô tả</em>}
                            </td>
                            <td style={{ fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <a href={item.affiliateUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>
                                {item.affiliateUrl}
                              </a>
                            </td>
                            <td>
                              <div className={styles.actionBtnGroup}>
                                <button 
                                  type="button" 
                                  className={`${styles.actionBtn} ${styles.editBtn}`}
                                  onClick={() => handleOpenEdit(indexInFiltered)}
                                >
                                  Sửa
                                </button>
                                <button 
                                  type="button" 
                                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                  onClick={() => handleDeleteItem(indexInFiltered)}
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    type="button" 
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      type="button" 
                      className={`${styles.pageBtn} ${currentPage === page ? styles.activePageBtn : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    type="button" 
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          ) : (
            <div>
              <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '12px' }}>
                Sao chép toàn bộ mã JSON dưới đây để sao lưu dự phòng, chỉnh sửa hàng loạt trong các trình biên tập văn bản hoặc dán một mã JSON mới để nhập hàng loạt sản phẩm.
              </p>
              <textarea 
                className={styles.bulkTextarea}
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                placeholder="[ { 'title': 'Sản phẩm', 'affiliateUrl': 'https://...' } ]"
              />
              <div className={styles.bulkActions}>
                <button type="button" className={styles.applyBtn} onClick={handleApplyBulkJson}>
                  Áp dụng dữ liệu JSON mới
                </button>
                <button 
                  type="button" 
                  className={styles.cancelBtn} 
                  onClick={() => {
                    if (settings && settings.affiliateGear) {
                      setBulkJson(JSON.stringify(settings.affiliateGear, null, 2));
                    }
                    setActiveTab('visual');
                  }}
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          )}
        </section>

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>Save Settings</button>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4>{modalMode === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h4>
              <button type="button" className={styles.closeModalBtn} onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Tên sản phẩm *</label>
                  <input 
                    type="text" 
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="Ví dụ: Gối cổ chữ U cao cấp"
                  />
                </div>
                
                <div className={styles.field}>
                  <label>Đường dẫn liên kết (Affiliate Link) *</label>
                  <input 
                    type="text" 
                    value={formState.affiliateUrl}
                    onChange={(e) => setFormState({ ...formState, affiliateUrl: e.target.value })}
                    placeholder="Dán link Shopee, Lazada, Amazon..."
                  />
                </div>

                <div className={styles.field}>
                  <label>Đường dẫn hình ảnh URL</label>
                  <input 
                    type="text" 
                    value={formState.imageUrl}
                    onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className={styles.field}>
                  <label>Mô tả ngắn</label>
                  <textarea 
                    rows={3}
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    placeholder="Thiết kế công thái học giúp giảm mệt mỏi khi đi máy bay..."
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                Hủy bỏ
              </button>
              <button 
                type="button" 
                className={styles.saveModalBtn} 
                onClick={handleSaveModal}
                disabled={!formState.title || !formState.affiliateUrl}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
