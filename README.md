# TinyLearn – Bé Khám Phá (Mầm Non 12–24 Tháng) 👶✨

> **Nền tảng giáo dục mầm non thông minh**: Giúp giáo viên tạo trò chơi tương tác, giáo án chuẩn Bộ GD&ĐT, giọng nữ tiếng Việt 100% tự nhiên và mã QR trình chiếu lên Smart TV trong vòng **1 phút**.

---

## 🌟 Điểm Nhấn Nổi Bật

1. **AI Tạo Trò Chơi Tự Động (1 Phút)**:
   - Giáo viên chỉ cần nhập: *"Chủ đề: Con vật nuôi, độ tuổi 12–24 tháng"*.
   - Hệ thống tự sinh: Tên trò chơi, mục tiêu hoạt động, câu hỏi, câu đọc, gợi ý vận động kèm theo và âm thanh tượng thanh.

2. **AI Sinh Giáo Án Chuẩn Bộ GD&ĐT**:
   - Tự động sinh giáo án 4 bước hoàn chỉnh (Ổn định gây hứng thú, Hoạt động trọng tâm, Trò chơi củng cố trên TinyLearn, Kết thúc).
   - Xuất file Word (`.doc`), in ấn trực tiếp hoặc sao chép văn bản.

3. **Nhiều Dạng Trò Chơi Phù Hợp Trẻ 12–24 Tháng**:
   - **Nghe và tìm** (Listen & Find): Nghe tiếng kêu/câu hỏi → Chạm hình đúng.
   - **Chạm để nghe** (Touch & Explore): Trẻ chạm vào hình nào, cô đọc tên và tiếng kêu đối tượng đó.
   - **Tìm hình giống nhau** (Match Similar): So sánh hình mẫu ở trên với các bạn sinh đôi ở dưới.
   - **Ai biến mất?** (Who Disappeared?): Trò chơi ú òa rèn luyện trí nhớ thị giác ngắn hạn.
   - **Bong bóng kiến thức** (Knowledge Bubbles): Chạm nổ bong bóng xà phòng chứa đáp án.
   - **Chọn màu sắc** (Color Match): Phân biệt màu đỏ, vàng, xanh.

4. **100% Giọng Nữ Tiếng Việt Chuẩn (Bản Xứ)**:
   - Phát âm chuẩn Bắc Bộ / Hà Nội, tròn vành rõ chữ, chuẩn 5 thanh điệu tiếng Việt (hỏi, ngã, nặng, sắc, huyền).
   - Tích hợp bộ thu âm giọng nói giáo viên trực tiếp.

5. **Trợ Giúp Tự Động Cho Trẻ Nhỏ (Viền Sáng Pulse)**:
   - Sau khi câu hỏi phát lại lần 2 nếu trẻ chưa chọn được, thẻ hình đúng tự động phát sáng viền vàng ấm áp và nhấp nháy (pulse) nhẹ nhàng.

6. **Mã QR & Chế Độ TV Cảm Ứng**:
   - Tự sinh mã QR cho từng bài học. Quét bằng iPad/TV là mở trực tiếp chế độ cảm ứng toàn màn hình.
   - Khóa góc giáo viên bằng PIN toán học an toàn.

7. **Quản Lý Hồ Sơ Trẻ & Báo Cáo Sư Phạm**:
   - Lưu trữ danh sách trẻ theo nhóm lớp Nhà trẻ D1 (12–18m), D2 (18–24m).
   - Theo dõi tiến bộ cá nhân, xuất báo cáo tuần/tháng cho phụ huynh và nhà trường.

---

## 🛠️ Công Nghệ & Kiến Trúc

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas-Confetti, Motion.
- **Backend**: Node.js, Express, TSX, @google/genai SDK (Gemini 3.8 Flash).
- **TTS Engine**: Google Translate Vietnamese Voice Proxy + Web Speech API (Google Tiếng Việt, Microsoft Hoài My, Apple Linh).
- **Database / Cloud**: Supabase PostgreSQL (schema RLS tại `supabase/schema.sql`).
- **QR Code**: `qrcode.react`.
- **Offline / Local-first**: Tự động lưu và đồng bộ LocalStorage phiên bản v2.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Thiết lập môi trường (`.env`):
Sao chép từ `.env.example`:
```bash
cp .env.example .env
```
*(Nếu muốn dùng thêm Gemini AI ngoài bộ tạo chuyên môn mầm non có sẵn, thêm `GEMINI_API_KEY=your_key`)*.

### 3. Khởi chạy ứng dụng:
```bash
npm run dev
```
Truy cập tại: `http://localhost:3000`

---

## 🗄️ Cấu Trúc Database Supabase (`supabase/schema.sql`)

- `profiles`: Hồ sơ giáo viên, ban giám hiệu.
- `schools`: Danh mục trường mầm non.
- `children`: Hồ sơ trẻ 12–24 tháng.
- `topics`: Chủ đề mầm non.
- `games`: Trò chơi tương tác.
- `questions`: Câu hỏi và gợi ý vận động.
- `answers`: Thẻ hình ảnh và âm thanh.
- `lesson_plans`: Kế hoạch bài dạy chuẩn Bộ GD&ĐT.
- `activity_results`: Nhật ký tương tác & đánh giá trẻ.
- `media`: Kho học liệu dùng chung.
