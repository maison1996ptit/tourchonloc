'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CountryGuideMap, RegionMarker } from '@/types/guideMap';
import { Blog } from '@/types/blog';
// Removed blogService import as blogs are unified with guides
import styles from '@/app/(public)/cam-nang/guides.module.css';
import { getMarkerDetailContent } from '@/actions/guideActions';

interface GuideMapCardProps {
  countryMap: CountryGuideMap;
  onMarkerClick: (marker: RegionMarker) => void;
}

const MapController = ({ targetCenter, zoom }: { targetCenter: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(targetCenter, zoom, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [targetCenter, zoom, map]);
  return null;
};

const GuideMapCard: React.FC<GuideMapCardProps> = ({ countryMap, onMarkerClick }) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(countryMap.center);
  const [showAllMarkers, setShowAllMarkers] = useState(false);
  const cacheBuster = useRef(Date.now()).current;

  const [selectedMarker, setSelectedMarker] = useState<RegionMarker | null>(null);
  const [relatedBlog, setRelatedBlog] = useState<Blog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailedContent, setDetailedContent] = useState('');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch detailed content from Gemini when a marker is opened
  useEffect(() => {
    const fetchDetailedContent = async () => {
      if (selectedMarker) {
        setIsLoadingDetails(true);
        setDetailedContent('');
        try {
          const content = await getMarkerDetailContent(selectedMarker.name, countryMap.countryName);
          setDetailedContent(content);
        } catch (error) {
          console.error("DEBUG: Detailed content fetch error", error);
          setDetailedContent("Đang cập nhật nội dung chi tiết...");
        } finally {
          setIsLoadingDetails(false);
        }
      }
    };
    if (showModal && selectedMarker) {
      fetchDetailedContent();
    }
  }, [selectedMarker, showModal, countryMap.countryName]);

  const filteredMarkers = countryMap.markers.filter((marker) =>
    marker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    marker.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-fetch related blog when a marker is selected for detail
  useEffect(() => {
    const fetchBlog = async () => {
      if (selectedMarker) {
        try {
          const res = await fetch(`/api/guides/${selectedMarker.contentSlug}`);
          if (res.ok) {
            const guide = await res.json();
            setRelatedBlog({
              id: guide.id,
              title: guide.title,
              slug: guide.slug,
              thumbnail: guide.coverImage || guide.thumbnail || '',
              excerpt: guide.excerpt,
              content: '',
              tags: guide.tags?.map((t: any) => t.name) || [],
              status: guide.status === 'Published' ? 'Published' : 'Draft',
              publishedDate: (guide.publishedAt || guide.createdAt),
              createdAt: guide.createdAt,
              updatedAt: guide.updatedAt,
              categoryId: guide.categoryId || 'cam-nang'
            } as any);
          } else {
            setRelatedBlog(null);
          }
        } catch (error) {
          console.error("DEBUG: Blog fetch error", error);
          setRelatedBlog(null);
        }
      }
    };
    if (showModal) fetchBlog();
  }, [selectedMarker, showModal]);

  const handleMarkerClick = (marker: RegionMarker) => {
    setSelectedId(marker.id);
    setMapCenter([marker.lat, marker.lng]);
    setSelectedMarker(marker);
    setShowModal(true);
    onMarkerClick(marker);
  };

  const handleItemClick = (marker: RegionMarker) => {
    setSelectedId(marker.id);
    setMapCenter([marker.lat, marker.lng]);
    setIsActive(true);
    setSelectedMarker(marker);
  };

  const openDetail = (e: React.MouseEvent, marker: RegionMarker) => {
    e.stopPropagation();
    setSelectedMarker(marker);
    setShowModal(true);
  };

  const getMascot = (marker: RegionMarker) => {
    if (marker.markerType === 'Airport') return '✈️';
    return countryMap.mascot || (countryMap.countrySlug === 'nhat-ban' ? '⛩️' : '🏮');
  };

  const getMarkerIcon = (marker: RegionMarker) => {
    const isCurrent = selectedId === marker.id;
    const iconContent = marker.markerType === 'Airport' ? '✈️' : (countryMap.flag || '📍');
    
    return L.divIcon({
      className: `${styles.scientificMarker} ${marker.markerType === 'Airport' ? styles.airportMarker : ''} ${isCurrent ? styles.activeMarker : ''}`,
      iconSize: isCurrent ? [32, 32] : [24, 24],
      iconAnchor: isCurrent ? [16, 16] : [12, 12],
      html: `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: ${isCurrent ? '1.4rem' : '1.1rem'};">
              ${iconContent}
             </div>`
    });
  };

  const INITIAL_VISIBLE_COUNT = 8;
  const isSearching = searchQuery.trim().length > 0;
  const visibleMarkers = isSearching || showAllMarkers 
    ? filteredMarkers 
    : filteredMarkers.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <div className={styles.mapCard}>
      <div className={styles.cardHeader}>
        <div className={styles.titleAndSearch}>
          <h3 className={styles.countryTitle}>{countryMap.countryName}</h3>
          <div className={styles.searchBarWrapper}>
            <span className={styles.searchBarIcon}>🔍</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm địa điểm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchBarInput}
            />
          </div>
        </div>
        <div className={styles.saleBadge}>Top {filteredMarkers.length} địa điểm nổi tiếng</div>
      </div>
      
      <div className={styles.mapWrapper}>
        {!isActive && (
          <div className={styles.activationOverlay} onClick={() => setIsActive(true)}>
            <span>Chạm để khám phá bản đồ</span>
          </div>
        )}

        {isActive && (
          <button 
            className={styles.deactivateMapBtn} 
            onClick={(e) => { e.stopPropagation(); setIsActive(false); }}
          >
            🔒 Khóa bản đồ (Để cuộn trang)
          </button>
        )}
        
        <MapContainer 
          center={countryMap.center} 
          zoom={countryMap.zoom} 
          className={styles.leafletContainer}
          scrollWheelZoom={false}
          dragging={isActive}
          touchZoom={isActive}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png" />
          <MapController targetCenter={mapCenter} zoom={selectedId ? 11 : countryMap.zoom} />
          
          {filteredMarkers.map((marker) => (
            <Marker 
              key={marker.id} 
              position={[marker.lat, marker.lng]} 
              icon={getMarkerIcon(marker)}
              eventHandlers={{
                click: () => handleMarkerClick(marker),
              }}
            >
              <Tooltip 
                permanent 
                direction="top" 
                offset={[0, -15]} 
                className={styles.smartSaleLabel}
                interactive={true}
              >
                <div onClick={() => handleMarkerClick(marker)}>
                   <strong>{marker.name}</strong>
                   <div className={styles.discoverHint}>Bấm để xem chi tiết →</div>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className={styles.gridWrapper}>
        <div className={styles.landmarkGrid}>
          {visibleMarkers.length > 0 ? (
            visibleMarkers.map((marker) => (
              <div 
                key={marker.id} 
                id={`dest-${marker.id}`}
                className={`${styles.landmarkCard} ${selectedId === marker.id ? styles.activeLandmarkCard : ''}`}
                onClick={() => handleItemClick(marker)}
              >
                <div className={styles.landmarkCardImageWrapper}>
                  <div 
                    className={styles.landmarkCardImage}
                    style={{ backgroundImage: `url(${marker.imageUrl || '/logo.png'}?v=${cacheBuster})` }}
                  />
                  <div className={styles.landmarkBadge}>{getMascot(marker)}</div>
                </div>
                <div className={styles.landmarkCardContent}>
                  <h4 className={styles.landmarkName}>{marker.name}</h4>
                  <p className={styles.landmarkDesc}>{marker.shortDescription}</p>
                  <button className={styles.landmarkDetailBtn} onClick={(e) => openDetail(e, marker)}>
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResultsFound}>
              Không tìm thấy địa điểm nào phù hợp với từ khóa của bạn.
            </div>
          )}
        </div>

        {filteredMarkers.length > INITIAL_VISIBLE_COUNT && !isSearching && (
          <div className={styles.expandWrapper}>
            <button 
              className={styles.expandBtn}
              onClick={() => setShowAllMarkers(!showAllMarkers)}
            >
              {showAllMarkers 
                ? 'Thu gọn danh sách ▲' 
                : `Xem tất cả ${filteredMarkers.length} địa điểm ▼`
              }
            </button>
          </div>
        )}
      </div>

      {showModal && selectedMarker && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>&times;</button>
            <div 
              className={styles.modalImage} 
              style={{ backgroundImage: `url(${relatedBlog?.thumbnail || selectedMarker.imageUrl || '/logo.png'}?v=${cacheBuster})` }}
            ></div>
            <div className={styles.modalBody}>
              <h2 className={styles.modalTitle}>{selectedMarker.name}</h2>
              <div className={styles.modalDescription} style={{ whiteSpace: 'pre-line', fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
                <p style={{ fontWeight: '500', color: 'var(--text-muted)', marginBottom: '15px' }}>
                  {selectedMarker.shortDescription}
                </p>
                {isLoadingDetails ? (
                  <div style={{ padding: '20px 0', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⏳</span>
                    <span style={{ fontStyle: 'italic' }}>Đang tìm kiếm thêm thông tin chi tiết và câu chuyện lịch sử thú vị về {selectedMarker.name}...</span>
                  </div>
                ) : (
                  <div>
                    {detailedContent}
                    <div style={{ marginTop: '25px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                      <a 
                        href={`https://vi.wikipedia.org/w/index.php?search=${encodeURIComponent(selectedMarker.name)}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        🔍 Tìm hiểu thêm về {selectedMarker.name} trên Wikipedia →
                      </a>
                    </div>
                  </div>
                )}
              </div>
              {relatedBlog && (
                <div className={styles.modalActions}>
                  <a href={`/cam-nang/${relatedBlog.slug}`} className={styles.readFullBtn}>Đọc cẩm nang chi tiết</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideMapCard;
