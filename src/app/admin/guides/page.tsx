'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Guide, GuideCategory } from '@/types/guide';
import styles from '../tours/tours.module.css'; // Reusing tours layout styling

export default function GuidesAdminPage({ isSubComponent = false }: { isSubComponent?: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (!isSubComponent) {
      router.replace('/admin/blogs');
    }
  }, [isSubComponent, router]);

  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const fetchFilters = async () => {
    try {
      const res = await fetch('/api/guide-categories');
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter,
        sortBy: sortBy,
        page: page.toString(),
        limit: limit.toString()
      });
      const res = await fetch(`/api/guides?${params}`);
      if (res.ok) {
        const result = await res.json();
        setGuides(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchGuides();
  }, [searchQuery, statusFilter, categoryFilter, sortBy, page]);

  const handleDelete = async (id: string, title: string) => {
    if (!isAdmin) {
      alert('Bạn không có quyền thực hiện hành động này. Chỉ Admin mới được xóa Cẩm Nang.');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa Cẩm Nang "${title}" không?`)) {
      try {
        const res = await fetch(`/api/guides/admin/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          alert('Xóa thành công!');
          fetchGuides();
        } else {
          const data = await res.json();
          alert(`Lỗi: ${data.error || 'Không thể xóa'}`);
        }
      } catch (err) {
        alert('Lỗi kết nối xảy ra khi xóa.');
      }
    }
  };

  const renderContent = () => (
    <>
      {/* Filter and Search controls */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Tìm kiếm cẩm nang..."
          className={styles.searchInput}
          style={{ flex: 1, minWidth: '200px', margin: 0, padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={{ width: '180px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="Published">Công khai</option>
          <option value="Draft">Bản nháp</option>
          <option value="Scheduled">Hẹn giờ đăng</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          style={{ width: '200px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          style={{ width: '180px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        >
          <option value="createdAt">Mới nhất</option>
          <option value="views">Lượt xem nhiều nhất</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải danh sách Cẩm Nang...</div>
      ) : guides.length === 0 ? (
        <div className={styles.loading}>Không tìm thấy cẩm nang nào.</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Bộ lọc (QG/TP)</th>
                  <th>Lượt xem</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {guides.map(guide => (
                  <tr key={guide.id}>
                    <td style={{ width: '80px' }}>
                      <img 
                        src={guide.coverImage || '/logo.png'} 
                        alt={guide.title} 
                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                    </td>
                    <td>
                      <strong style={{ display: 'block', fontSize: '1.05rem', color: '#1e293b' }}>{guide.title}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/{guide.slug}</span>
                    </td>
                    <td>{guide.category?.name || 'Chưa phân loại'}</td>
                    <td>
                      {guide.country ? (
                        <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>📍 {guide.country}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Chưa chọn QG</span>
                      )}
                      {guide.city && (
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>🏙️ {guide.city}</span>
                      )}
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.95rem', color: '#0284c7' }}>{guide.views}</strong>
                    </td>
                    <td>
                      <span className={`${styles.statusTag} ${styles[guide.status.toLowerCase()]}`}>
                        {guide.status === 'Published' ? 'Công khai' : guide.status === 'Draft' ? 'Bản nháp' : 'Hẹn giờ'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <Link href={`/admin/guides/${guide.id}/edit`} className={styles.editBtn}>
                        {isAdmin ? 'Sửa' : 'Xem'}
                      </Link>
                      {isAdmin && (
                        <button onClick={() => handleDelete(guide.id, guide.title)} className={styles.deleteBtn}>
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
                style={{ padding: '8px 16px', borderRadius: '6px', background: page === 1 ? '#e2e8f0' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', border: '1px solid #cbd5e1' }}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: page === idx + 1 ? 'var(--primary-color, #4f46e5)' : 'white',
                    color: page === idx + 1 ? 'white' : '#1e293b',
                    cursor: 'pointer',
                    border: '1px solid #cbd5e1'
                  }}
                  onClick={() => setPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                style={{ padding: '8px 16px', borderRadius: '6px', background: page === totalPages ? '#e2e8f0' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', border: '1px solid #cbd5e1' }}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  if (isSubComponent) {
    return (
      <div>
        <div className={styles.header} style={{ marginTop: '10px' }}>
          <h2>Danh sách cẩm nang du lịch (Guides)</h2>
          {isAdmin ? (
            <Link href="/admin/guides/create" className={styles.createBtn}>
              ➕ Tạo Cẩm Nang mới
            </Link>
          ) : (
            <span style={{ fontSize: '0.875rem', color: '#64748b', background: '#e2e8f0', padding: '6px 12px', borderRadius: '6px' }}>
              Quyền xem danh sách (Editor)
            </span>
          )}
        </div>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Quản lý Cẩm Nang (Story Block System)</h1>
        {isAdmin ? (
          <Link href="/admin/guides/create" className={styles.createBtn}>
            ➕ Tạo Cẩm Nang mới
          </Link>
        ) : (
          <span style={{ fontSize: '0.875rem', color: '#64748b', background: '#e2e8f0', padding: '6px 12px', borderRadius: '6px' }}>
            Quyền xem danh sách (Editor)
          </span>
        )}
      </div>
      {renderContent()}
    </div>
  );
}

// Keep the old unused render logic at the bottom commented out or removed so that it compiles cleanly
const UnusedPageEndMarker = () => null;
