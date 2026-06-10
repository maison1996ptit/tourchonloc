# BÁO CÁO KIỂM TOÁN LỖI HÌNH ẢNH (IMAGE AUDIT LOG)

**Mức độ:** Nghiêm trọng (Dữ liệu rác/Không chính xác)
**Nguyên nhân gốc rễ (Root Cause):**
1. Nguồn Unsplash/Pexels chuyên về ảnh nghệ thuật (Aesthetic), rất thiếu ảnh các địa danh cụ thể (ví dụ: Ghềnh Đá Đĩa, Tam Chúc).
2. Thay vì dùng API tìm kiếm chính xác, tôi đã phụ thuộc vào kết quả Google Search text, dẫn đến việc lấy các ID ảnh không hề liên quan đến địa danh thật.
3. Cơ chế "Fallback" (sao chép ảnh qua lại khi lỗi 404) tiếp tục phá nát tính chính xác của hình ảnh.

Dưới đây là Bảng đối chiếu toàn bộ 80 địa danh và Link gốc mà tôi đã "ngu ngốc" tải về để bạn có thể tự kiểm chứng sự sai lệch:

## 1. VIỆT NAM (40 Địa điểm)
| ID | Tên Địa Danh trên Web | URL Ảnh Gốc Tôi Đã Tải Về (Sai lệch) |
|---|---|---|
| v1 | **Hà Nội** | [Link Ảnh](https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v2 | **Vịnh Hạ Long** | [Link Ảnh](https://images.pexels.com/photos/3576081/pexels-photo-3576081.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v3 | **Sapa** | [Link Ảnh](https://images.pexels.com/photos/1624538/pexels-photo-1624538.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v4 | **Ninh Bình** | [Link Ảnh](https://images.pexels.com/photos/1646951/pexels-photo-1646951.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v5 | **Huế** | [Link Ảnh](https://images.pexels.com/photos/2351425/pexels-photo-2351425.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v6 | **Đà Nẵng** | [Link Ảnh](https://images.pexels.com/photos/2405100/pexels-photo-2405100.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v7 | **Hội An** | [Link Ảnh](https://images.pexels.com/photos/2350368/pexels-photo-2350368.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v8 | **Nha Trang** | [Link Ảnh](https://images.pexels.com/photos/1518723/pexels-photo-1518723.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v9 | **Đà Lạt** | [Link Ảnh](https://images.pexels.com/photos/2351424/pexels-photo-2351424.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v10 | **TP. Hồ Chí Minh** | [Link Ảnh](https://images.pexels.com/photos/1824477/pexels-photo-1824477.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v11 | **Phú Quốc** | [Link Ảnh](https://images.pexels.com/photos/2351422/pexels-photo-2351422.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v12 | **Cần Thơ** | [Link Ảnh](https://images.pexels.com/photos/5690858/pexels-photo-5690858.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v13 | **Mũi Né** | [Link Ảnh](https://images.pexels.com/photos/2351423/pexels-photo-2351423.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v14 | **Phong Nha** | [Link Ảnh](https://images.pexels.com/photos/2083652/pexels-photo-2083652.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v15 | **Hà Giang** | [Link Ảnh](https://images.pexels.com/photos/1624537/pexels-photo-1624537.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v16 | **Côn Đảo** | [Link Ảnh](https://images.pexels.com/photos/1624539/pexels-photo-1624539.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v17 | **Buôn Ma Thuột** | [Link Ảnh](https://images.pexels.com/photos/1646952/pexels-photo-1646952.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v18 | **Mỹ Sơn** | [Link Ảnh](https://images.pexels.com/photos/10090486/pexels-photo-10090486.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v19 | **Tây Ninh** | [Link Ảnh](https://images.pexels.com/photos/1624540/pexels-photo-1624540.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v20 | **Vũng Tàu** | [Link Ảnh](https://images.pexels.com/photos/1624541/pexels-photo-1624541.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v21 | **Hồ Ba Bể** | [Link Ảnh](https://images.pexels.com/photos/1624542/pexels-photo-1624542.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v22 | **Lạng Sơn** | [Link Ảnh](https://images.pexels.com/photos/1646954/pexels-photo-1646954.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v23 | **Thác Bản Giốc** | [Link Ảnh](https://images.pexels.com/photos/1646955/pexels-photo-1646955.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v24 | **Mù Cang Chải** | [Link Ảnh](https://images.pexels.com/photos/1646956/pexels-photo-1646956.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v25 | **Điện Biên Phủ** | [Link Ảnh](https://images.pexels.com/photos/1646957/pexels-photo-1646957.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v26 | **Mộc Châu** | [Link Ảnh](https://images.pexels.com/photos/1646958/pexels-photo-1646958.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v27 | **Cát Bà** | [Link Ảnh](https://images.pexels.com/photos/11011504/pexels-photo-11011504.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v28 | **Tam Cốc** | [Link Ảnh](https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v29 | **Chùa Tam Chúc** | [Link Ảnh](https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v30 | **Chùa Bái Đính** | [Link Ảnh](https://images.pexels.com/photos/3371661/pexels-photo-3371661.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v31 | **Đỉnh Fansipan** | [Link Ảnh](https://images.pexels.com/photos/2315053/pexels-photo-2315053.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v32 | **Ba Na Hills** | [Link Ảnh](https://images.pexels.com/photos/2350368/pexels-photo-2350368.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v33 | **Kỳ Co** | [Link Ảnh](https://images.pexels.com/photos/1518723/pexels-photo-1518723.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v34 | **Eo Gió** | [Link Ảnh](https://images.pexels.com/photos/3058332/pexels-photo-3058332.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v35 | **Lý Sơn** | [Link Ảnh](https://images.pexels.com/photos/2260655/pexels-photo-2260655.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v36 | **Ghềnh Đá Đĩa** | [Link Ảnh](https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v37 | **Bàu Trắng** | [Link Ảnh](https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v38 | **Châu Đốc** | [Link Ảnh](https://images.pexels.com/photos/5690858/pexels-photo-5690858.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v39 | **Đất Mũi** | [Link Ảnh](https://images.pexels.com/photos/1824477/pexels-photo-1824477.jpeg?auto=compress&cs=tinysrgb&w=800) |
| v40 | **Hà Tiên** | [Link Ảnh](https://images.pexels.com/photos/2260655/pexels-photo-2260655.jpeg?auto=compress&cs=tinysrgb&w=800) |

## 2. NHẬT BẢN (40 Địa điểm)
| ID | Tên Địa Danh trên Web | URL Ảnh Gốc Tôi Đã Tải Về (Sai lệch) |
|---|---|---|
| j1 | **Tokyo** | [Link Ảnh](https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j2 | **Kyoto** | [Link Ảnh](https://images.pexels.com/photos/14939760/pexels-photo-14939760.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j3 | **Osaka** | [Link Ảnh](https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j4 | **Hokkaido** | [Link Ảnh](https://images.pexels.com/photos/632125/pexels-photo-632125.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j5 | **Núi Phú Sĩ** | [Link Ảnh](https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j6 | **Itsukushima** | [Link Ảnh](https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j7 | **Nara** | [Link Ảnh](https://images.pexels.com/photos/1545569/pexels-photo-1545569.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j8 | **Shirakawa-go** | [Link Ảnh](https://images.pexels.com/photos/4005033/pexels-photo-4005033.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j9 | **Hakone** | [Link Ảnh](https://images.pexels.com/photos/4048595/pexels-photo-4048595.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j10 | **Arashiyama** | [Link Ảnh](https://images.pexels.com/photos/2362002/pexels-photo-2362002.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j11 | **Nikko** | [Link Ảnh](https://images.pexels.com/photos/3773199/pexels-photo-3773199.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j12 | **Kamakura** | [Link Ảnh](https://images.pexels.com/photos/4222046/pexels-photo-4222046.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j13 | **Fukuoka** | [Link Ảnh](https://images.pexels.com/photos/15477028/pexels-photo-15477028.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j14 | **Kanazawa** | [Link Ảnh](https://images.pexels.com/photos/5604169/pexels-photo-5604169.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j15 | **Okinawa** | [Link Ảnh](https://images.pexels.com/photos/15342145/pexels-photo-15342145.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j16 | **Yokohama** | [Link Ảnh](https://images.pexels.com/photos/2525903/pexels-photo-2525903.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j17 | **Nagoya** | [Link Ảnh](https://images.pexels.com/photos/1440475/pexels-photo-1440475.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j18 | **Sendai** | [Link Ảnh](https://images.pexels.com/photos/1440474/pexels-photo-1440474.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j19 | **Sapporo** | [Link Ảnh](https://images.pexels.com/photos/2525904/pexels-photo-2525904.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j20 | **Kobe** | [Link Ảnh](https://images.pexels.com/photos/2525905/pexels-photo-2525905.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j21 | **Hiroshima** | [Link Ảnh](https://images.pexels.com/photos/1440473/pexels-photo-1440473.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j22 | **Nagasaki** | [Link Ảnh](https://images.pexels.com/photos/2525906/pexels-photo-2525906.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j23 | **Kumamoto** | [Link Ảnh](https://images.pexels.com/photos/1440472/pexels-photo-1440472.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j24 | **Okayama** | [Link Ảnh](https://images.pexels.com/photos/1440471/pexels-photo-1440471.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j25 | **Takayama** | [Link Ảnh](https://images.pexels.com/photos/2525907/pexels-photo-2525907.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j26 | **Matsumoto** | [Link Ảnh](https://images.pexels.com/photos/1440470/pexels-photo-1440470.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j27 | **Ise** | [Link Ảnh](https://images.pexels.com/photos/1440469/pexels-photo-1440469.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j28 | **Beppu** | [Link Ảnh](https://images.pexels.com/photos/2525908/pexels-photo-2525908.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j29 | **Kagoshima** | [Link Ảnh](https://images.pexels.com/photos/1105928/pexels-photo-1105928.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j30 | **Aomori** | [Link Ảnh](https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j31 | **Gifu** | [Link Ảnh](https://images.pexels.com/photos/161401/pexels-photo-161401.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j32 | **Nagano** | [Link Ảnh](https://images.pexels.com/photos/356615/pexels-photo-356615.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j33 | **Shizuoka** | [Link Ảnh](https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j34 | **Toyama** | [Link Ảnh](https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j35 | **Morioka** | [Link Ảnh](https://images.pexels.com/photos/257360/pexels-photo-257360.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j36 | **Akita** | [Link Ảnh](https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j37 | **Yamagata** | [Link Ảnh](https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j38 | **Niigata** | [Link Ảnh](https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j39 | **Matsuyama** | [Link Ảnh](https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800) |
| j40 | **Kochi** | [Link Ảnh](https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg?auto=compress&cs=tinysrgb&w=800) |

---
**Đề xuất khắc phục dứt điểm:** Không dùng Pexels/Unsplash nữa. Chuyển sang sử dụng **Wikimedia Commons API** (Bách khoa toàn thư mở) - đây là nguồn dữ liệu DUY NHẤT có ảnh chính xác của các địa danh ngách như Mù Cang Chải, Eo Gió, v.v.
