'use client';

import React, { useEffect, useState } from 'react';
import { getVisaServices, getVisaStats } from '@/actions/visaActions';
import InquiryForm from '@/components/public/InquiryForm';
import { useLanguage } from '@/hooks/useLanguage';
import styles from './visa.module.css';

interface VisaService {
  id: string;
  country: string;
  price: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface VisaStats {
  passRate: number;
  successfulClients: number;
  experienceYears: number;
}

export default function VisaPage() {
  const { t } = useLanguage();
  const [visas, setVisas] = useState<VisaService[]>([]);
  const [stats, setStats] = useState<VisaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchVisaData = async () => {
      try {
        const [servicesData, statsData] = await Promise.all([
          getVisaServices(),
          getVisaStats()
        ]);
        setVisas(servicesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching visa page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVisaData();
  }, []);

  // Reset pagination to page 1 on search filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  };

  const getCountryFlagUrl = (country: string) => {
    const c = country.toLowerCase();
    let code = 'un'; // Fallback code
    if (c.includes('canada')) code = 'ca';
    else if (c.includes('mỹ') || c.includes('usa')) code = 'us';
    else if (c.includes('úc') || c.includes('australia')) code = 'au';
    else if (c.includes('new zealand')) code = 'nz';
    else if (c.includes('schengen')) code = 'eu';
    else if (c.includes('anh quốc') || c.includes('uk')) code = 'gb';
    else if (c.includes('hàn quốc')) code = 'kr';
    else if (c.includes('nhật')) code = 'jp';
    else if (c.includes('trung quốc')) code = 'cn';
    else if (c.includes('đài loan')) code = 'tw';
    else if (c.includes('hong kong') || c.includes('hồng kông')) code = 'hk';
    
    if (code === 'un') return null;
    return `https://flagcdn.com/w40/${code}.png`;
  };

  const handleSelectVisa = (countryName: string) => {
    setSelectedMessage(`Tôi muốn đăng ký tư vấn dịch vụ làm visa đi ${countryName}. Xin liên hệ lại cho tôi.`);
    const formElement = document.getElementById('visa-inquiry-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Helper to remove Vietnamese tones/diacritics for accents-insensitive searching
  const removeVietnameseTones = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  const filteredVisas = visas.filter(visa => {
    const countryNormalized = removeVietnameseTones(visa.country);
    const descNormalized = removeVietnameseTones(visa.description || '');
    const queryNormalized = removeVietnameseTones(searchQuery);
    return countryNormalized.includes(queryNormalized) || descNormalized.includes(queryNormalized);
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredVisas.length / itemsPerPage));
  const paginatedVisas = filteredVisas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{t('nav.visas')}</h1>
        <p>
          Bảng phí dịch vụ visa trọn gói, tỷ lệ đậu cao, thủ tục đơn giản và nhận kết quả nhanh chóng.
        </p>
      </header>

      {/* Trust Statistics Banner */}
      <div className={styles.trustBanner}>
        <div className={styles.trustStat}>
          <span className={styles.trustNumber}>{stats ? `${stats.passRate}%` : '98.6%'}</span>
          <span className={styles.trustLabel}>Tỷ Lệ Đậu Hồ Sơ</span>
        </div>
        <div className={styles.trustStat}>
          <span className={styles.trustNumber}>{stats ? `${new Intl.NumberFormat('vi-VN').format(stats.successfulClients)}+` : '10,000+'}</span>
          <span className={styles.trustLabel}>Khách Hàng Thành Công</span>
        </div>
        <div className={styles.trustStat}>
          <span className={styles.trustNumber}>{stats ? `${stats.experienceYears}+ Năm` : '10+ Năm'}</span>
          <span className={styles.trustLabel}>Kinh Nghiệm Thực Tế</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>{t('common.loading')}</div>
      ) : (
        <>
          {/* 1. Visa Table Section (Full Width) */}
          <div className={styles.tableSection}>
            <h2 className={styles.tableTitle}>
              <span className={styles.tableTitleIcon}>🛂</span> Danh sách Dịch vụ Visa
            </h2>

            {/* Country Search Bar */}
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm quốc gia hoặc từ khóa (ví dụ: 'my', 'uc', '5 nam', 'ho chieu')..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Quốc gia / Loại Visa</th>
                    <th style={{ textAlign: 'left' }}>Hồ sơ / Yêu cầu / Ghi chú chi tiết</th>
                    <th style={{ textAlign: 'right', width: '200px' }}>Giá dịch vụ trọn gói</th>
                    <th style={{ textAlign: 'center', width: '180px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVisas.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        Không tìm thấy dịch vụ visa cho quốc gia này.
                      </td>
                    </tr>
                  ) : (
                    paginatedVisas.map((visa) => {
                      const flagUrl = getCountryFlagUrl(visa.country);
                      return (
                        <tr key={visa.id}>
                          <td data-label="Quốc gia" className={styles.countryCol}>
                            <div className={styles.countryWrapper}>
                              <span className={styles.flagIcon}>
                                {flagUrl ? (
                                  <img 
                                    src={flagUrl} 
                                    alt={`Flag of ${visa.country}`} 
                                    width="24" 
                                    height="18"
                                    style={{ 
                                      objectFit: 'cover', 
                                      borderRadius: '2px', 
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)' 
                                    }}
                                  />
                                ) : (
                                  '🛂'
                                )}
                              </span>
                              <span className={styles.countryName}>{visa.country}</span>
                            </div>
                          </td>
                          <td data-label="Chi tiết" className={styles.descriptionCol}>
                            {visa.description || 'Hỗ trợ chuẩn bị hồ sơ chuẩn Đại sứ quán, dịch thuật công chứng và khai form nhanh gọn.'}
                          </td>
                          <td data-label="Giá dịch vụ" className={styles.priceCol}>
                            {formatCurrency(visa.price)}
                          </td>
                          <td data-label="Thao tác" style={{ textAlign: 'center' }}>
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleSelectVisa(visa.country)}
                            >
                              Đăng ký tư vấn
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredVisas.length > itemsPerPage && (
              <div className={styles.pagination}>
                <span className={styles.pageInfo}>
                  Hiển thị {Math.min(filteredVisas.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredVisas.length, currentPage * itemsPerPage)} trên {filteredVisas.length} kết quả
                </span>
                <div className={styles.paginationButtons}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                      key={idx + 1}
                      className={`${styles.pageBtn} ${currentPage === idx + 1 ? styles.activePageBtn : ''}`}
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Important Notes Section (Full Width, below the table) */}
          <div className={styles.noteSection}>
            <h4 className={styles.noteTitle}>⚠️ Lưu ý quan trọng về phí và hồ sơ:</h4>
            <p className={styles.noteText}>
              - Giá dịch vụ đã bao gồm lệ phí chính thức từ Đại sứ quán / Trung tâm tiếp nhận thị thực và hỗ trợ hoàn thiện hồ sơ từ A-Z.<br />
              - Hỗ trợ dịch thuật công chứng tư pháp các giấy tờ liên quan, chuẩn bị lịch trình chi tiết và book vé máy bay/khách sạn phục vụ visa.<br />
              - Đội ngũ chuyên gia xử lý hồ sơ sẽ liên hệ hỗ trợ bạn thẩm định và cải thiện điểm yếu hồ sơ (hộ chiếu trắng, tài chính yếu) để tăng tỷ lệ đậu tối đa.
            </p>
          </div>

          {/* 3. Scientific 3-Step Process (Full Width) */}
          <div className={styles.processSection}>
            <h2 className={styles.processTitle}>Quy trình làm việc 3 bước khoa học</h2>
            <div className={styles.processGrid}>
              <div className={styles.processCard}>
                <div className={styles.stepNumber}>1</div>
                <h3>Đánh giá Hồ sơ (15 phút)</h3>
                <p>Phân tích điểm mạnh/yếu của hộ chiếu, lịch sử du lịch và khả năng tài chính hoàn toàn miễn phí để đưa ra phương án tối ưu.</p>
              </div>
              <div className={styles.processCard}>
                <div className={styles.stepNumber}>2</div>
                <h3>Hoàn thiện Thủ tục</h3>
                <p>Chuẩn bị tờ khai sứ quán tỉ mỉ, dịch thuật công chứng hồ sơ, book vé máy bay/khách sạn và nộp phí visa đúng quy trình.</p>
              </div>
              <div className={styles.processCard}>
                <div className={styles.stepNumber}>3</div>
                <h3>Nhận Visa Tận Tay</h3>
                <p>Theo dõi sát sao tiến độ hồ sơ từ cơ quan lãnh sự và giao nhận hộ chiếu có dán visa tận nhà hoặc văn phòng của bạn.</p>
              </div>
            </div>
          </div>

          {/* 4. Consultation Form Card (Centered, Full Width Container) */}
          <div className={styles.formSection} id="visa-inquiry-form">
            <div className={styles.formContainer}>
              <h3>Đăng ký Tư vấn Visa miễn phí</h3>
              <p>
                Để lại thông tin liên hệ của bạn bên dưới. Chuyên viên tư vấn Visa của chúng tôi sẽ gọi lại ngay lập tức để hỗ trợ bạn thẩm định hồ sơ chi tiết.
              </p>
              <InquiryForm source="Visa Inquiry" defaultMessage={selectedMessage} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
