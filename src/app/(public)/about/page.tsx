import React from 'react';
import { Metadata } from 'next';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'Giới Thiệu Về Hệ Sinh Thái Tour Chọn Lọc | Kiến Tạo Hành Trình Độc Bản',
  description: 'Tìm hiểu về sứ mệnh và hệ sinh thái Tour Chọn Lọc. Chúng tôi mang đến những hành trình du lịch cao cấp, độc bản với tri thức thực chiến và chất lượng dịch vụ khắt khe nhất.',
  keywords: ['giới thiệu tour chọn lọc', 'về chúng tôi', 'thương hiệu tour chọn lọc', 'du lịch độc bản', 'tour cao cấp'],
  openGraph: {
    title: 'Giới Thiệu Về Hệ Sinh Thái Tour Chọn Lọc | Kiến Tạo Hành Trình Độc Bản',
    description: 'Tìm hiểu về sứ mệnh và hệ sinh thái Tour Chọn Lọc - Nhà sàng lọc tinh hoa lữ hành.',
    url: 'https://tourchonloc.com/about',
    type: 'website',
  }
};

export default function AboutPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageOverlay}></div>
      
      <div className={styles.container}>
        <header className={styles.heroSection}>
          <span className={styles.heroBadge}>Câu Chuyện Thương Hiệu</span>
          <h1 className={styles.heroTitle}>Hệ Sinh Thái<br/>Tour Chọn Lọc</h1>
          <p className={styles.heroSubtitle}>Kiến tạo những hành trình độc bản trên khắp thế giới. Nền tảng tri thức du lịch & hệ thống sàng lọc tour tinh hoa dành riêng cho người Việt.</p>
        </header>

        <div className={styles.innerContent}>
          <section className={styles.cardSection}>
            <div className={styles.textContent}>
              <h2>Chấm Dứt Cuộc "Đánh Cược" Đường Xa</h2>
              <p>Bước ra thế giới là một hành trình tuyệt vời, nhưng để chuẩn bị cho nó thì chưa bao giờ là dễ dàng. Giữa một "ma trận" thông tin bùng nổ như hiện nay, việc tìm kiếm một hành trình nước ngoài hoàn hảo thường vô tình biến thành một cuộc đánh cược với thời gian và chi phí của chính bạn.</p>
              <p>Bạn phải tự mình bơi giữa hàng ngàn bài review ngược chiều trên mạng xã hội, tra cứu mẹo vặt ở khắp nơi, rồi lại tiếp tục lạc lối trước những lịch trình "thượng vàng hạ cám" của các đơn vị lữ hành.</p>
              <p>Đó là lý do Tour Chọn Lọc ra đời. Chúng tôi không phải là một đơn vị bán tour đại trà, cũng không phải là trang tổng hợp thông tin thô sơ. Chúng tôi là nhà sàng lọc tinh hoa lữ hành, mang đến giải pháp khám phá thông minh, an tâm và đẳng cấp nhất tại một điểm chạm duy nhất.</p>
            </div>
          </section>

          <section className={styles.transparentSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Hệ Giá Trị</span>
              <h2>4 Điểm Tựa Sáng Tạo Nên Sức Bật</h2>
              <p>Mọi trải nghiệm và bước chân ra thế giới của bạn đều được định hình dựa trên hệ sinh thái giá trị nghiêm túc của chúng tôi.</p>
            </div>

            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>📚</div>
                <h4>Tri Thức Thực Chiến</h4>
                <p>Từ chối thông tin sao chép đại trà. Mọi cẩm nang đều được biên soạn từ trải nghiệm thực tế của các chuyên gia sành sỏi.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>💎</div>
                <h4>Tuyển Chọn Tinh Hoa</h4>
                <p>Sàng lọc sâu sắc cấu trúc dịch vụ. Chỉ niêm yết những hành trình từ các hãng lữ hành hàng đầu phát huy đúng thế mạnh cốt lõi.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>🤝</div>
                <h4>Nghiệp Vụ Vững Vàng</h4>
                <p>Đội ngũ chuyên gia sở hữu nghiệp vụ lữ hành quốc tế sâu sắc, lắng nghe nhu cầu thực tế để giúp bạn chọn đúng tour, trúng kỳ vọng.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>⚡</div>
                <h4>Tối Ưu Thời Gian</h4>
                <p>Hiểu rõ khách hàng là những người bận rộn. Hệ thống lọc thông minh giúp sở hữu phương án du lịch hoàn hảo chỉ trong vài phút.</p>
              </div>
            </div>
          </section>

          <div className={styles.quoteBlock}>
            <blockquote>
              "Chúng tôi bảo vệ quyền lợi của bạn từ trước khi chuyến đi bắt đầu cho đến khi bạn trở về nhà an toàn."
            </blockquote>
          </div>

          <section className={styles.cardSection}>
            <div className={styles.textContent}>
              <h2>Niềm Tin Được Đo Lường Bằng Sự Khắt Khe</h2>
              <p>Du lịch quốc tế luôn tiềm ẩn những thay đổi bất ngờ. Chúng tôi không chỉ là cổng thông tin, mà đứng về phía bạn với tư cách là người bảo hộ quyền lợi:</p>
              <ul className={styles.featureList}>
                <li>
                  <div className={styles.featureIcon}>✓</div>
                  <div>
                    <strong>Minh bạch 100%</strong>
                    <p>Mọi thông tin về giá cả, chính sách hoàn hủy, bảo hiểm đều công khai rõ ràng. Nói không với giật tít hay ẩn chi phí.</p>
                  </div>
                </li>
                <li>
                  <div className={styles.featureIcon}>✓</div>
                  <div>
                    <strong>Giám sát chất lượng</strong>
                    <p>Kiểm soát chặt chẽ đối tác lữ hành liên kết, đảm bảo mọi cam kết về dịch vụ phải được thực hiện chuẩn xác.</p>
                  </div>
                </li>
                <li>
                  <div className={styles.featureIcon}>✓</div>
                  <div>
                    <strong>Đồng hành trọn vẹn</strong>
                    <p>Đội ngũ hỗ trợ am hiểu chuyên môn luôn sẵn sàng kết nối, xử lý mọi tình huống phát sinh tại nước ngoài 24/7.</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <footer className={styles.manifesto}>
            <h3>Sứ Mệnh Của Chúng Tôi</h3>
            <p>Nguyên tắc của chúng tôi khắt khe: Nếu một hành trình không đủ tốt để chúng tôi tự tin đưa gia đình mình đi, nó sẽ không bao giờ xuất hiện trên hệ thống. Du lịch không chỉ là dịch chuyển, đó là quá trình thu hoạch tri thức và trải nghiệm sống vô giá.</p>
            <div className={styles.signature}>Tour Chọn Lọc – Trọn Vẹn Tinh Hoa</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
