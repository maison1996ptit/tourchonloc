'use client';

import React, { useEffect, useState } from 'react';
import { blogService } from '@/services/blogService';
import { Blog } from '@/types/blog';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from '../tours/tours.module.css'; // Reusing tours CSS layout

export default function MemosAdminPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [memos, setMemos] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchMemos = async () => {
    try {
      const allBlogs = await blogService.getBlogs();
      // Filter for memos only
      const onlyMemos = allBlogs.filter(b => b.isMemo === true);
      setMemos(onlyMemos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMemos();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!isAdmin) {
      alert('Bạn không có quyền thực hiện hành động này. Chỉ Admin mới được xóa Memo.');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa Memo "${title}" không?`)) {
      try {
        const result = await blogService.deleteBlog(id);
        if (result.success) {
          setMemos(memos.filter(m => m.id !== id));
          alert('Xóa thành công!');
        } else {
          alert('Không thể xóa bài viết này.');
        }
      } catch {
        alert('Lỗi xảy ra khi xóa.');
      }
    }
  };

  // Filtering Logic
  const filteredMemos = memos.filter(memo => {
    const matchesSearch = memo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          memo.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || memo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });



  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredMemos.length / itemsPerPage));
  const paginatedMemos = filteredMemos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Quản lý Memo Sales</h1>
        {isAdmin ? (
          <Link href="/admin/memos/create" className={styles.createBtn}>
            ➕ Tạo Memo mới
          </Link>
        ) : (
          <span style={{ fontSize: '0.875rem', color: '#64748b', background: '#e2e8f0', padding: '6px 12px', borderRadius: '6px' }}>
            Quyền xem danh sách (Editor)
          </span>
        )}
      </div>

      {/* Filter and Search controls */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Tìm kiếm tiêu đề, tóm tắt..."
          className={styles.searchInput}
          style={{ flex: 1, margin: 0, padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: '180px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="Published">Công khai</option>
          <option value="Draft">Bản nháp</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải danh sách Memo...</div>
      ) : paginatedMemos.length === 0 ? (
        <div className={styles.loading}>Không có Memo nào phù hợp với bộ lọc của bạn.</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Ngày đăng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMemos.map(memo => (
                  <tr key={memo.id}>
                    <td style={{ width: '80px' }}>
                      <img 
                        src={memo.thumbnail || '/logo.png'} 
                        alt={memo.title} 
                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                    </td>
                    <td>
                      <strong style={{ display: 'block', fontSize: '1.05rem', color: '#1e293b' }}>{memo.title}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/{memo.slug}</span>
                    </td>
                    <td>{memo.category || memo.categoryId}</td>
                    <td>{new Date(memo.publishedDate).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className={`${styles.statusTag} ${styles[memo.status.toLowerCase()]}`}>
                        {memo.status === 'Published' ? 'Công khai' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <Link href={`/admin/memos/${memo.id}/edit`} className={styles.editBtn}>
                        {isAdmin ? 'Sửa' : 'Xem'}
                      </Link>
                      {isAdmin && (
                        <button onClick={() => handleDelete(memo.id, memo.title)} className={styles.deleteBtn}>
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <button
                className={styles.pageBtn || ''}
                style={{ padding: '8px 16px', borderRadius: '6px', background: currentPage === 1 ? '#e2e8f0' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: '1px solid #cbd5e1' }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: currentPage === idx + 1 ? 'var(--primary-color, #4f46e5)' : 'white',
                    color: currentPage === idx + 1 ? 'white' : '#1e293b',
                    cursor: 'pointer',
                    border: '1px solid #cbd5e1'
                  }}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className={styles.pageBtn || ''}
                style={{ padding: '8px 16px', borderRadius: '6px', background: currentPage === totalPages ? '#e2e8f0' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border: '1px solid #cbd5e1' }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
