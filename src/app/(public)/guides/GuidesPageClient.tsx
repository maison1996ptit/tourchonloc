'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CountryGuideMap } from '@/types/guideMap';
import styles from '@/app/(public)/cam-nang/guides.module.css';
import { useLanguage } from '@/hooks/useLanguage';

interface GuidesPageClientProps {
  initialGuides: CountryGuideMap[];
}

const COUNTRY_CUSTOM_DESCS: Record<string, string> = {
  'viet-nam': 'Khám phá hành trình di sản dọc theo dải đất hình chữ S, từ ruộng bậc thang Mù Cang Chải kì vĩ, vịnh Hạ Long lung linh đến nhịp sống năng động của Sài Gòn và nét ẩm thực đường phố độc đáo.',
  'nhat-ban': 'Vương quốc cổ kính giao hòa giữa nét hiện đại sầm uất của Tokyo và không gian thanh tịnh của cố đô Kyoto. Chiêm ngưỡng núi Phú Sĩ tuyết phủ và hoa anh đào nở rộ.',
  'han-quoc': 'Xứ sở Kim Chi đầy quyến rũ với văn hóa K-Pop sôi động, những cung điện hoàng gia cổ kính tại Seoul và hòn đảo thiên đường Jeju yên bình thơ mộng.',
  'dai-loan': 'Hòn đảo xinh đẹp nổi tiếng với các chợ đêm sầm uất, tòa tháp Taipei 101 biểu tượng, và cảnh sắc thiên nhiên thơ mộng tại hồ Nhật Nguyệt hay phố cổ Cửu Phần.',
  'trung-quoc': 'Nền văn minh nghìn năm với Vạn Lý Trường Thành vĩ đại, những dãy núi đá vôi kỳ vĩ tại Trương Gia Giới và sự hiện đại xa hoa vượt bậc của Thượng Hải.',
  'phap': 'Kinh đô thời trang và nghệ thuật lãng mạn bậc nhất thế giới. Dạo bước dưới tháp Eiffel, ngắm dòng sông Seine thơ mộng và thưởng thức ẩm thực Pháp tinh tế hàng đầu.',
  'y': 'Trái tim của nghệ thuật Phục Hưng và di sản cổ đại. Khám phá đấu trường La Mã cổ kính, đi thuyền Gondola lãng mạn tại Venice và thưởng thức pizza, pasta đích thực.',
  'duc': 'Vương quốc của những lâu đài cổ tích, thung lũng sông Rhine thơ mộng và các lễ hội bia Oktoberfest sôi động mang đậm nét văn hóa truyền thống châu Âu.',
  'anh': 'Khám phá xứ sở sương mù cổ kính với tháp đồng hồ Big Ben kiêu hãnh, cung điện Buckingham lộng lẫy và nét văn hóa thưởng trà chiều thanh lịch bậc nhất.',
  'tay-ban-nha': 'Xứ sở bò tót đầy cuồng nhiệt với những điệu nhảy Flamenco rực lửa, kiến trúc Sagrada Familia kỳ vĩ của Gaudi và các bãi biển ngập tràn nắng ấm vùng Địa Trung Hải.',
  'thuy-si': 'Thiên đường nghỉ dưỡng tinh khiết nhất thế giới với những đỉnh núi Alps tuyết phủ quanh năm, các hồ nước xanh màu ngọc bích và những ngôi làng cổ tích bình yên.',
  'ha-lan': 'Đất nước của hoa tulip rực rỡ, những chiếc cối xay gió khổng lồ cổ kính và hệ thống kênh đào thanh bình uốn lượn khắp thủ đô Amsterdam quyến rũ.',
  'ao': 'Nôi âm nhạc cổ điển thế giới, quê hương của Mozart. Đắm chìm trong vẻ đẹp thơ mộng của ngôi làng cổ Hallstatt bên hồ và các cung điện hoàng gia nguy nga tại Vienna.',
  'hy-lap': 'Cội nguồn của nền văn minh phương Tây với đền Parthenon cổ kính và hòn đảo thiên đường Santorini nổi tiếng với những mái vòm xanh ngọc hướng ra biển Địa Trung Hải.',
  'tho-nhi-ky': 'Nơi giao thoa độc đáo giữa hai nền văn minh Á-Âu. Bay khinh khí cầu ngắm thung lũng đá Cappadocia kỳ ảo và khám phá nhà thờ Hagia Sophia huyền thoại.'
};

// Asia country slugs
const ASIA_SLUGS = ['viet-nam', 'nhat-ban', 'han-quoc', 'dai-loan', 'trung-quoc'];

export default function GuidesPageClient({ initialGuides }: GuidesPageClientProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'asia' | 'europe'>('all');

  // Filter countries by continent tab and search query
  const filteredGuides = initialGuides.filter((guide) => {
    // 1. Filter by category tab
    if (activeTab === 'asia' && !ASIA_SLUGS.includes(guide.countrySlug)) {
      return false;
    }
    if (activeTab === 'europe' && ASIA_SLUGS.includes(guide.countrySlug)) {
      return false;
    }

    // 2. Filter by search query
    const nameMatch = guide.countryName.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (guide.introduction && guide.introduction.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (COUNTRY_CUSTOM_DESCS[guide.countrySlug] && COUNTRY_CUSTOM_DESCS[guide.countrySlug].toLowerCase().includes(searchQuery.toLowerCase()));

    return nameMatch || descMatch;
  });

  // Generate JSON-LD ItemList Schema markup for Google Rich Snippets
  const listSchemaJson = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Cẩm Nang Du Lịch - Danh Sách Quốc Gia",
    "description": "Hệ thống bản đồ và cẩm nang khám phá chi tiết các quốc gia hàng đầu thế giới từ Tour Chọn Lọc.",
    "numberOfItems": initialGuides.length,
    "itemListElement": initialGuides.map((guide, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://tourchonloc.com/guides/${guide.countrySlug}`,
      "name": `Cẩm Nang Du Lịch ${guide.countryName}`
    }))
  };

  return (
    <div className={styles.container}>
      {/* Inject JSON-LD Schema for listing page SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchemaJson) }}
      />

      {/* Hero Header Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.title}>
          <span className={styles.titleGradient}>Cẩm Nang Bản Đồ</span> Du Lịch
        </h1>
        <p className={styles.subtitle}>
          Khám phá thế giới qua hệ thống cẩm nang định vị GPS trực quan, chia sẻ kinh nghiệm du lịch chân thực từ chuyên gia và các hành trình văn hóa, lịch sử đặc sắc của 15 quốc gia tinh hoa.
        </p>
      </div>

      {/* Category Tabs & Search Container */}
      <div className={styles.filterContainer}>
        <div className={styles.categoryTabs}>
          <button 
            className={`${styles.categoryTab} ${activeTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất Cả Quốc Gia
          </button>
          <button 
            className={`${styles.categoryTab} ${activeTab === 'asia' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('asia')}
          >
            Châu Á Tinh Hoa
          </button>
          <button 
            className={`${styles.categoryTab} ${activeTab === 'europe' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('europe')}
          >
            Châu Âu Cổ Kính
          </button>
        </div>

        <div className={styles.directorySearch}>
          <span className={styles.directorySearchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm quốc gia (Ví dụ: Nhật Bản, Pháp...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.directorySearchInput}
          />
        </div>
      </div>

      {/* Cards List Grid */}
      <div className={styles.countryListGrid}>
        {filteredGuides.length > 0 ? filteredGuides.map((country) => {
          const coverImage = country.markers[0]?.imageUrl || '/logo.png';
          const description = COUNTRY_CUSTOM_DESCS[country.countrySlug] || country.introduction || `Cẩm nang kinh nghiệm du lịch ${country.countryName} chi tiết từ A-Z với bản đồ các điểm tham quan nổi tiếng.`;
          
          return (
            <Link 
              key={country.id} 
              href={`/guides/${country.countrySlug}`} 
              className={styles.countryCard}
            >
              <div className={styles.countryCardImageWrapper}>
                <div 
                  className={styles.countryCardImage}
                  style={{ backgroundImage: `url(${coverImage})` }}
                />
                <div className={styles.countryCardOverlay}>
                  <div className={styles.countryCardFlag}>
                    {country.flag || '🌏'}
                  </div>
                </div>
                <div className={styles.countryCardBadge}>
                  {country.markers.length} điểm đến
                </div>
              </div>
              <div className={styles.countryCardBody}>
                <h2 className={styles.countryCardName}>{country.countryName}</h2>
                <p className={styles.countryCardDesc}>
                  {description}
                </p>
                <div className={styles.countryCardFooter}>
                  Khám phá cẩm nang & bản đồ <span>→</span>
                </div>
              </div>
            </Link>
          );
        }) : (
          <div className={styles.noResultsDirectory}>
            <span style={{ fontSize: '2.5rem', marginBottom: '15px', display: 'block' }}>🔍</span>
            <h3>Không tìm thấy kết quả phù hợp</h3>
            <p>Hãy thử tìm kiếm với tên quốc gia khác hoặc đổi bộ lọc Châu lục.</p>
          </div>
        )}
      </div>
    </div>
  );
}
