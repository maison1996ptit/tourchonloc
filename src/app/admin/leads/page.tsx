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

  // State variables for Filter, Sort, Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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

  // Filter and Sort leads
  const filteredAndSortedLeads = React.useMemo(() => {
    let result = [...leads];

    // 1. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(lead => 
        lead.fullName.toLowerCase().includes(q) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        lead.phone.toLowerCase().includes(q) ||
        (lead.tourName && lead.tourName.toLowerCase().includes(q)) ||
        lead.message.toLowerCase().includes(q)
      );
    }

    // 2. Filter by Status
    if (statusFilter !== 'All') {
      result = result.filter(lead => lead.status === statusFilter);
    }

    // 3. Filter by Source
    if (sourceFilter !== 'All') {
      result = result.filter(lead => lead.sourceForm === sourceFilter);
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'name-asc') {
        return a.fullName.localeCompare(b.fullName, 'vi');
      }
      if (sortBy === 'name-desc') {
        return b.fullName.localeCompare(a.fullName, 'vi');
      }
      return 0;
    });

    return result;
  }, [leads, searchQuery, statusFilter, sourceFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredAndSortedLeads.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = () => {
    const visibleIds = filteredAndSortedLeads.map(l => l.id);
    const allVisibleSelected = visibleIds.every(id => selectedLeadIds.includes(id));
    
    if (allVisibleSelected) {
      setSelectedLeadIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedLeadIds(prev => {
        const unique = new Set([...prev, ...visibleIds]);
        return Array.from(unique);
      });
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
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvText = event.target?.result as string;
        if (!csvText) return;

        try {
          // Split by lines
          const lines = csvText.split(/\r?\n/);
          if (lines.length < 2) {
            alert('Tệp tin CSV không hợp lệ hoặc rỗng.');
            return;
          }

          // Get and clean headers
          const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
          
          // Find indices of headers
          const fullNameIdx = headers.indexOf('fullName');
          const emailIdx = headers.indexOf('email');
          const phoneIdx = headers.indexOf('phone');
          const messageIdx = headers.indexOf('message');

          if (fullNameIdx === -1 || phoneIdx === -1) {
            alert('Định dạng CSV không đúng. Phải chứa tối thiểu cột "fullName" và "phone".');
            return;
          }

          const parsedLeads: any[] = [];

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV line parser that handles quotes and commas
            const values: string[] = [];
            let currentVal = '';
            let inQuotes = false;

            for (let j = 0; j < line.length; j++) {
              const char = line[j];
              if (char === '"' || char === "'") {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(currentVal.trim());
                currentVal = '';
              } else {
                currentVal += char;
              }
            }
            values.push(currentVal.trim());

            const fullName = values[fullNameIdx]?.replace(/^["']|["']$/g, '') || '';
            const phone = values[phoneIdx]?.replace(/^["']|["']$/g, '') || '';
            const email = emailIdx !== -1 ? (values[emailIdx]?.replace(/^["']|["']$/g, '') || '') : '';
            const message = messageIdx !== -1 ? (values[messageIdx]?.replace(/^["']|["']$/g, '') || '') : '';

            if (fullName && phone) {
              parsedLeads.push({
                fullName,
                email,
                phone,
                message,
                sourceForm: 'Imported',
                status: 'New'
              });
            }
          }

          if (parsedLeads.length === 0) {
            alert('Không tìm thấy bản ghi hợp lệ nào trong file CSV.');
            return;
          }

          await leadService.bulkCreateLeads(parsedLeads);
          const data = await leadService.getLeads();
          setLeads(data);
          alert(`Đã import thành công ${parsedLeads.length} khách hàng từ tệp CSV!`);
        } catch (err) {
          console.error('Lỗi khi xử lý file CSV:', err);
          alert('Đã xảy ra lỗi khi đọc và xử lý file CSV.');
        }
      };
      reader.readAsText(file, 'UTF-8');
      // Reset file input value so same file can be selected again
      e.target.value = '';
    }
  };

  const handleSendMarketing = () => {
    const selectedLeads = leads.filter(l => selectedLeadIds.includes(l.id));
    if (selectedLeads.length === 0) {
      alert('Vui lòng chọn ít nhất một khách hàng.');
      return;
    }

    const leadsWithEmail = selectedLeads.filter(l => l.email && l.email.trim() !== '');
    if (leadsWithEmail.length === 0) {
      alert('Tất cả khách hàng được chọn đều không có địa chỉ email. Vui lòng nhấn nút "Chi tiết" ở khách hàng đó để cập nhật email trước khi gửi chiến dịch quảng cáo.');
      return;
    }

    setShowMarketingModal(true);
  };

  const executeMarketingCampaign = async () => {
    try {
      const result = await leadService.sendMarketingCampaignAction(
        selectedLeadIds,
        emailConfig.subject,
        emailConfig.body,
        emailConfig.selectedTours
      );
      if (result.success) {
        alert(`Chiến dịch đã được khởi tạo thành công! Đã gửi mail cho ${result.count} khách hàng có email.`);
      } else {
        alert('Có lỗi xảy ra khi gửi chiến dịch.');
      }
    } catch (err) {
      console.error('Campaign error:', err);
      alert('Có lỗi xảy ra khi gửi chiến dịch.');
    } finally {
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
            <span>📧</span> Gửi Mail Quảng Cáo
          </button>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '20px', alignItems: 'center' }}>
        
        {/* Search Input */}
        <div style={{ flex: '1 1 250px', display: 'flex', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, SĐT, tour..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
          />
        </div>

        {/* Filter by Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Trạng thái:</label>
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', outline: 'none' }}
          >
            <option value="All">Tất cả</option>
            <option value="New">Mới</option>
            <option value="Contacted">Đã liên hệ</option>
            <option value="Converted">Thành công</option>
            <option value="Failed">Thất bại</option>
            <option value="Closed">Đã đóng</option>
          </select>
        </div>

        {/* Filter by Source */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Nguồn:</label>
          <select 
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', outline: 'none' }}
          >
            <option value="All">Tất cả</option>
            <option value="Customize Trip">Customize Trip</option>
            <option value="Tour Inquiry">Tour Inquiry</option>
            <option value="Chatbot Inquiry">Chatbot Inquiry</option>
            <option value="Visa Inquiry">Visa Inquiry</option>
            <option value="Download Guide">Download Guide</option>
            <option value="Newsletter">Newsletter</option>
            <option value="Imported">Imported</option>
          </select>
        </div>

        {/* Sort by */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Sắp xếp:</label>
          <select 
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', outline: 'none' }}
          >
            <option value="date-desc">Ngày tạo: Mới nhất</option>
            <option value="date-asc">Ngày tạo: Cũ nhất</option>
            <option value="name-asc">Tên KH: A-Z</option>
            <option value="name-desc">Tên KH: Z-A</option>
          </select>
        </div>

        {/* Reset Filters button */}
        {(searchQuery || statusFilter !== 'All' || sourceFilter !== 'All' || sortBy !== 'date-desc') && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
              setSourceFilter('All');
              setSortBy('date-desc');
              setCurrentPage(1);
            }}
            style={{ padding: '8px 14px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={filteredAndSortedLeads.length > 0 && filteredAndSortedLeads.every(l => selectedLeadIds.includes(l.id))} 
                  onChange={handleSelectAll} 
                />
              </th>
              <th>Khách hàng</th>
              <th>Yêu cầu / Tour / Ngày tạo</th>
              <th>Nhắc hẹn</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map(lead => (
              <tr key={lead.id} style={{ backgroundColor: lead.status === 'Failed' ? '#fff5f5' : 'inherit' }}>
                <td><input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => handleSelectLead(lead.id)} /></td>
                <td><strong>{lead.fullName}</strong><br/><small>{lead.email || 'Không có email'}</small><br/><small>{lead.phone}</small></td>
                <td>
                  <span className={styles.statusBadge} style={{ fontSize: '10px', display: 'inline-block', marginBottom: '4px' }}>{lead.sourceForm}</span>
                  {lead.tourName && (
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1a56db', marginTop: '2px' }}>
                      ✈️ {lead.tourName}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                    📅 {new Date(lead.createdAt).toLocaleString('vi-VN')}
                  </div>
                </td>
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
                <td><button onClick={() => setEditingLead(lead)} className={styles.editBtn}>Chi tiết</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', backgroundColor: '#ffffff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            Hiển thị <strong>{startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredAndSortedLeads.length)}</strong> trong tổng số <strong>{filteredAndSortedLeads.length}</strong> khách hàng
          </span>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: currentPage === 1 ? '#f1f5f9' : '#fff', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}
            >
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                if (page === 2 || page === totalPages - 1) {
                  return <span key={page} style={{ padding: '8px 4px', color: '#94a3b8' }}>...</span>;
                }
                return null;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: currentPage === page ? '#2563eb' : '#cbd5e1',
                    backgroundColor: currentPage === page ? '#2563eb' : '#fff',
                    color: currentPage === page ? '#fff' : '#334155',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  {page}
                </button>
              );
            })}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#fff', color: currentPage === totalPages ? '#94a3b8' : '#334155', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Edit/Note Modal */}
      {editingLead && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '650px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Chi tiết yêu cầu CRM</span>
              <span style={{ fontSize: '14px', padding: '4px 10px', borderRadius: '12px', backgroundColor: '#e2e8f0', color: '#4a5568', fontWeight: 'normal' }}>
                #{editingLead.id.substring(editingLead.id.length - 6)}
              </span>
            </h2>
            
            {/* Lead Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
              <div>
                <strong style={{ color: '#64748b', fontSize: '12px' }}>THÔNG TIN KHÁCH HÀNG:</strong>
                <div style={{ marginTop: '6px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Họ và tên *</label>
                  <input 
                    type="text" 
                    value={editingLead.fullName} 
                    onChange={(e) => setEditingLead({...editingLead, fullName: e.target.value})}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '2px' }}
                  />
                </div>
                <div style={{ marginTop: '6px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Email</label>
                  <input 
                    type="email" 
                    value={editingLead.email || ''} 
                    onChange={(e) => setEditingLead({...editingLead, email: e.target.value})}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '2px' }}
                    placeholder="Chưa cung cấp"
                  />
                </div>
                <div style={{ marginTop: '6px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Số điện thoại *</label>
                  <input 
                    type="text" 
                    value={editingLead.phone} 
                    onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '2px' }}
                  />
                </div>
                <div style={{ marginTop: '6px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Quốc tịch</label>
                  <input 
                    type="text" 
                    value={editingLead.nationality || ''} 
                    onChange={(e) => setEditingLead({...editingLead, nationality: e.target.value})}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '2px' }}
                    placeholder="Chưa cung cấp"
                  />
                </div>
              </div>
              
              <div>
                <strong style={{ color: '#64748b', fontSize: '12px' }}>YÊU CẦU:</strong>
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  📌 Nguồn: <span style={{ fontWeight: '600' }}>{editingLead.sourceForm}</span>
                </div>
                {editingLead.tourName && (
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                    ✈️ Tour: <span style={{ fontWeight: '600', color: '#2563eb' }}>{editingLead.tourName}</span>
                  </div>
                )}
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                  📅 Ngày tạo: {new Date(editingLead.createdAt).toLocaleString('vi-VN')}
                </div>
                {editingLead.travelDate && (
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                    📅 Khởi hành: {editingLead.travelDate}
                  </div>
                )}
                {editingLead.numberOfTravelers !== undefined && (
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                    👥 Số khách: {editingLead.numberOfTravelers} người
                  </div>
                )}
              </div>
            </div>

            {/* Customer Message */}
            <div style={{ marginBottom: '20px' }}>
              <strong style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '6px' }}>NỘI DUNG FORM GỬI:</strong>
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', fontSize: '14px', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto', color: '#334155' }}>
                {editingLead.message || 'Không có tin nhắn đi kèm.'}
              </div>
            </div>

            {/* Admin Actions */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '10px' }}>
              <strong style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '10px' }}>XỬ LÝ NỘI BỘ:</strong>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Trạng thái:</label>
                  <select 
                    value={editingLead.status} 
                    onChange={(e) => setEditingLead({...editingLead, status: e.target.value as Lead['status']})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="New">Mới</option>
                    <option value="Contacted">Đã liên hệ</option>
                    <option value="Converted">Thành công</option>
                    <option value="Failed">Thất bại</option>
                    <option value="Closed">Đã đóng</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Lịch nhắc hẹn:</label>
                  <input 
                    type="date" 
                    value={editingLead.reminderDate || ''} 
                    onChange={(e) => setEditingLead({...editingLead, reminderDate: e.target.value})} 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Ghi chú tư vấn:</label>
                <textarea 
                  value={editingLead.adminNote || ''} 
                  onChange={(e) => setEditingLead({...editingLead, adminNote: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px', fontSize: '14px' }}
                  placeholder="Nhập ghi chú hoặc nhật ký liên hệ..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingLead(null)} className={styles.templateBtn}>Đóng</button>
              <button onClick={handleSaveEdit} className={styles.addBtn}>Lưu thông tin</button>
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
