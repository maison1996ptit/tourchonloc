'use client';

import React, { useEffect, useState, useRef } from 'react';
import { leadService } from '@/services/leadService';
import { tourService } from '@/services/tourService';
import { Lead } from '@/types/lead';
import { Tour } from '@/types/tour';
import styles from '../tours/tours.module.css';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    subject: 'Ưu đãi du lịch đặc biệt dành riêng cho bạn',
    body: 'Xin chào {{name}},\n\nChúng tôi nhận thấy bạn đang quan tâm đến các hành trình khám phá. Đừng bỏ lỡ những ưu đãi tuyệt vời dành riêng cho bạn trong tháng này!',
    selectedTours: [] as string[]
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [leadsData, toursData] = await Promise.all([
        leadService.getLeads(),
        tourService.getTours()
      ]);
      setLeads(leadsData);
      setAllTours(toursData.filter(t => t.status === 'Published'));
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: Lead['status']) => {
    const updatedLead = await leadService.updateLead(id, { status: newStatus });
    if (updatedLead) {
      setLeads(leads.map(l => l.id === id ? updatedLead : l));
    }
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map(l => l.id));
    }
  };

  const downloadTemplate = () => {
    const headers = ['fullName', 'email', 'phone', 'message'];
    const sampleData = [
      ['Nguyen Van A', 'nguyenvana@example.com', '0901234567', 'Quan tam tour Da Lat'],
      ['Tran Thi B', 'tranb@example.com', '0912345678', 'Tu van tour Nhat Ban']
    ];
    const csvContent = [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mau_import_khach_hang.csv';
    link.click();
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockImported: any[] = [
        { fullName: 'Khách hàng mới 1', email: 'kh1@test.com', phone: '0987654321', message: 'Import từ Excel', sourceForm: 'Imported' },
        { fullName: 'Khách hàng mới 2', email: 'kh2@test.com', phone: '0123456789', message: 'Import từ Excel', sourceForm: 'Imported' },
      ];
      await leadService.bulkCreateLeads(mockImported);
      const data = await leadService.getLeads();
      setLeads(data);
      alert('Đã import thành công 2 khách hàng mẫu!');
    }
  };

  const handleSendMarketing = () => {
    const selectedLeads = leads.filter(l => selectedLeadIds.includes(l.id));
    if (selectedLeads.length === 0) {
      alert('Vui lòng chọn ít nhất một khách hàng.');
      return;
    }
    setShowMarketingModal(true);
  };

  const executeMarketingCampaign = async () => {
    const selectedLeads = leads.filter(l => selectedLeadIds.includes(l.id));
    if (confirm(`Xác nhận gửi email cho ${selectedLeads.length} khách hàng?`)) {
      // Logic for sending emails would go here
      alert('Chiến dịch đã được khởi tạo thành công!');
      setShowMarketingModal(false);
      setSelectedLeadIds([]);
    }
  };

  const handleSaveEdit = async () => {
    if (editingLead) {
      const updated = await leadService.updateLead(editingLead.id, editingLead);
      if (updated) {
        setLeads(leads.map(l => l.id === updated.id ? updated : l));
        setEditingLead(null);
      }
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Quản lý Khách hàng (CRM)</h1>
        <div className={styles.headerActions}>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleFileChange} />
          <button onClick={handleImportClick} className={styles.addBtn}><span>📤</span> Import Khách hàng</button>
          <button onClick={downloadTemplate} className={styles.templateBtn} style={{ marginLeft: '10px' }}><span>📥</span> Tải Mẫu Excel</button>
          <button 
            onClick={handleSendMarketing} 
            className={styles.marketingBtn} 
            style={{ marginLeft: '10px' }}
            disabled={selectedLeadIds.length === 0}
          >
            <span>📧</span> Gửi Mail Quảng Cáo (Failed)
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" checked={selectedLeadIds.length === leads.length && leads.length > 0} onChange={handleSelectAll} /></th>
              <th>Khách hàng</th>
              <th>Nguồn / Thông tin</th>
              <th>Nhắc hẹn</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id} style={{ backgroundColor: lead.status === 'Failed' ? '#fff5f5' : 'inherit' }}>
                <td><input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => handleSelectLead(lead.id)} /></td>
                <td><strong>{lead.fullName}</strong><br/><small>{lead.email}</small><br/><small>{lead.phone}</small></td>
                <td><span className={styles.statusBadge} style={{ fontSize: '10px' }}>{lead.sourceForm}</span></td>
                <td>{lead.reminderDate ? `⏰ ${new Date(lead.reminderDate).toLocaleDateString('vi-VN')}` : '---'}</td>
                <td>
                  <select 
                    value={lead.status} 
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                    style={{ padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', backgroundColor: lead.status === 'Failed' ? '#feb2b2' : '#edf2f7' }}
                  >
                    <option value="New">Mới</option>
                    <option value="Contacted">Đã liên hệ</option>
                    <option value="Converted">Thành công</option>
                    <option value="Failed">Thất bại</option>
                    <option value="Closed">Đã đóng</option>
                  </select>
                </td>
                <td><button onClick={() => setEditingLead(lead)} className={styles.editBtn}>Ghi chú</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Note Modal */}
      {editingLead && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ marginBottom: '20px' }}>Ghi chú: {editingLead.fullName}</h2>
            <textarea 
              value={editingLead.adminNote || ''} 
              onChange={(e) => setEditingLead({...editingLead, adminNote: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px', marginBottom: '15px' }}
              placeholder="Nhập nhật ký tư vấn..."
            />
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Lịch nhắc hẹn:</label>
            <input type="date" value={editingLead.reminderDate || ''} onChange={(e) => setEditingLead({...editingLead, reminderDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingLead(null)} className={styles.templateBtn}>Hủy</button>
              <button onClick={handleSaveEdit} className={styles.addBtn}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Config Modal */}
      {showMarketingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '850px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '25px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>Thiết lập Chiến dịch Email 📧</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tiêu đề Email:</label>
                  <input type="text" value={emailConfig.subject} onChange={(e) => setEmailConfig({...emailConfig, subject: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nội dung:</label>
                  <textarea value={emailConfig.body} onChange={(e) => setEmailConfig({...emailConfig, body: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '150px' }} />
                  <small style={{ color: '#718096' }}>Dùng <code>{"{{name}}"}</code> để chèn tên khách hàng.</small>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Chọn Tour đính kèm:</label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
                    {allTours.map(tour => (
                      <label key={tour.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '13px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={emailConfig.selectedTours.includes(tour.id)} onChange={(e) => {
                          const newTours = e.target.checked ? [...emailConfig.selectedTours, tour.id] : emailConfig.selectedTours.filter(id => id !== tour.id);
                          setEmailConfig({...emailConfig, selectedTours: newTours});
                        }} />
                        {tour.title}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ marginBottom: '15px', color: '#64748b', textTransform: 'uppercase', fontSize: '11px' }}>Xem trước nội dung</h4>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '14px' }}>
                  <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}><strong>Chủ đề:</strong> {emailConfig.subject}</div>
                  <div style={{ whiteSpace: 'pre-wrap', marginBottom: '20px' }}>{emailConfig.body.replace('{{name}}', leads.find(l => selectedLeadIds.includes(l.id))?.fullName || 'Quý khách')}</div>
                  {emailConfig.selectedTours.length > 0 && (
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '13px' }}>Gợi ý cho bạn:</p>
                      {allTours.filter(t => emailConfig.selectedTours.includes(t.id)).map(t => (
                        <div key={t.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundImage: `url(${t.featuredImage})`, backgroundSize: 'cover' }}></div>
                          <div style={{ fontWeight: '600', fontSize: '12px' }}>{t.title}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button onClick={() => setShowMarketingModal(false)} className={styles.templateBtn}>Đóng</button>
              <button onClick={executeMarketingCampaign} className={styles.addBtn} style={{ padding: '12px 30px' }}>🚀 Gửi chiến dịch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
