'use client';

import React, { useState, useEffect } from 'react';
import { 
  getVisaServices, 
  createVisaService, 
  updateVisaService, 
  deleteVisaService 
} from '@/actions/visaActions';
import styles from './visas.module.css';

interface VisaService {
  id: string;
  country: string;
  price: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function VisasAdminPage() {
  const [visas, setVisas] = useState<VisaService[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingVisa, setEditingVisa] = useState<VisaService | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    country: '',
    price: '',
    description: ''
  });

  const fetchVisas = async () => {
    try {
      setLoading(true);
      const data = await getVisaServices();
      setVisas(data);
    } catch (error) {
      console.error('Error fetching visa services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisas();
  }, []);

  const handleOpenCreate = () => {
    setEditingVisa(null);
    setFormData({
      country: '',
      price: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (visa: VisaService) => {
    setEditingVisa(visa);
    setFormData({
      country: visa.country,
      price: visa.price.toString(),
      description: visa.description || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVisa(null);
    setFormData({
      country: '',
      price: '',
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country.trim() || !formData.price.trim()) {
      alert('Vui lòng điền đầy đủ thông tin Quốc gia và Giá dịch vụ');
      return;
    }

    const priceNum = parseFloat(formData.price.replace(/[^\d.-]/g, ''));
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Giá dịch vụ không hợp lệ');
      return;
    }

    try {
      setSubmitting(true);
      if (editingVisa) {
        await updateVisaService(editingVisa.id, {
          country: formData.country.trim(),
          price: priceNum,
          description: formData.description.trim()
        });
      } else {
        await createVisaService({
          country: formData.country.trim(),
          price: priceNum,
          description: formData.description.trim()
        });
      }
      await fetchVisas();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving visa service:', error);
      alert(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, country: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa dịch vụ visa của "${country}" không?`)) {
      try {
        await deleteVisaService(id);
        await fetchVisas();
      } catch (error: any) {
        console.error('Error deleting visa service:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Quản lý Dịch vụ Visa</h1>
        <button className={styles.createBtn} onClick={handleOpenCreate}>
          <span>➕</span> Thêm dịch vụ visa
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải danh sách dịch vụ visa...</div>
      ) : visas.length === 0 ? (
        <div className={styles.loading}>Chưa có dịch vụ visa nào. Hãy bấm "Thêm dịch vụ visa" để tạo mới.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Quốc gia</th>
                <th>Giá dịch vụ</th>
                <th>Mô tả / Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visas.map((visa) => (
                <tr key={visa.id}>
                  <td>
                    <strong>{visa.country}</strong>
                  </td>
                  <td className={styles.priceCol}>
                    {formatCurrency(visa.price)}
                  </td>
                  <td>
                    {visa.description || <em style={{ color: '#94a3b8' }}>Chưa có mô tả</em>}
                  </td>
                  <td className={styles.actions}>
                    <button 
                      className={styles.editBtn} 
                      onClick={() => handleOpenEdit(visa)}
                    >
                      Sửa
                    </button>
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => handleDelete(visa.id, visa.country)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingVisa ? 'Chỉnh sửa Dịch vụ Visa' : 'Thêm Dịch vụ Visa Mới'}</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label htmlFor="country">Quốc gia / Loại Visa</label>
                  <input
                    type="text"
                    id="country"
                    className={styles.input}
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Ví dụ: Canada, Mỹ, Visa Schengen..."
                    required
                    disabled={submitting}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="price">Giá dịch vụ (VNĐ)</label>
                  <input
                    type="number"
                    id="price"
                    className={styles.input}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ví dụ: 7000000"
                    required
                    disabled={submitting}
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="description">Mô tả / Yêu cầu tài liệu (tùy chọn)</label>
                  <textarea
                    id="description"
                    className={styles.textarea}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ví dụ: Hộ chiếu gốc, 2 ảnh 4x6, sao kê tài khoản..."
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.cancelBtn} 
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
