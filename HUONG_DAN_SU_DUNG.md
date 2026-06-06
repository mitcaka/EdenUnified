# Hướng dẫn Sử dụng Hệ thống Quản lý Công việc Nội bộ (TaskForge)

Tài liệu này hướng dẫn cách vận hành hệ thống TaskForge dựa trên từng cấp quyền (Role) của người dùng. Hệ thống chia làm 4 cấp độ: **OWNER**, **ADMIN**, **MEMBER** và **VIEWER**.

---

## 1. Dành cho Quản trị viên (OWNER & ADMIN)

**Mục tiêu:** Quản lý toàn bộ hệ thống, điều phối dự án, giao việc, chấm điểm và đánh giá hiệu suất của nhân viên.

### Chức năng chính:
- **Bảng tin Quản lý (Dashboard):** 
  - Xem ngay lập tức danh sách các công việc **Cần Review**.
  - Theo dõi các công việc **Cảnh báo khẩn/Quá hạn**.
  - Xem báo cáo trực quan **"Ai đang làm gì?"** để dễ dàng điều phối.
  - Theo dõi bảng xếp hạng "Top 3 Thành Viên" có điểm số cao nhất tháng.

- **Quản lý Nhân sự:**
  - Vào mục **Nhân sự**, thêm/sửa/xóa tài khoản của nhân viên.
  - Cấp quyền (Role) tương ứng cho từng người.
  - Reset lại mật khẩu cho nhân viên nếu họ quên.

- **Duyệt công việc (Review & Đánh giá):**
  - Khi nhân viên báo cáo xong việc (chuyển sang *Need Review*), Admin vào bảng tin để kiểm tra.
  - **Bấm Duyệt (Mark Done):** Nếu công việc đạt yêu cầu. Hệ thống tự động ghi nhận điểm số.
  - **Bấm Yêu cầu làm lại (Return to Doing):** Nếu công việc chưa đạt, yêu cầu nhân viên sửa lại.

- **Quản lý Báo cáo:**
  - Truy cập tab **Báo cáo** để xem điểm số thực tế, số lượng công việc hoàn thành và số điểm thưởng/phạt của toàn team trong tháng.

---

## 2. Dành cho Nhân viên (MEMBER)

**Mục tiêu:** Nhận việc, báo cáo tiến độ và hoàn thành các đầu việc được giao.

### Chức năng chính:
- **Bảng tin Cá nhân (My Work Dashboard):**
  - Khi vừa đăng nhập, hệ thống sẽ tự động lọc và CHỈ hiển thị các công việc được giao cho bạn.
  - Giúp bạn tập trung 100% vào các task **Khẩn cấp** hoặc **Quá hạn** mà không bị phân tâm bởi việc của người khác.

- **Quy trình làm việc (Thao tác nhanh 1 chạm):**
  Hệ thống hỗ trợ các nút bấm chuyển trạng thái cực kỳ thông minh ngay trên thẻ công việc:
  1. Thấy việc ở mục *TODO*, bấm nút **[Bắt đầu làm]** -> Việc tự động chuyển sang *DOING*.
  2. Khi làm xong, bấm nút **[Gửi đi Test]** hoặc **[Gửi đi Review]**.
  3. Quản lý sẽ nhận được thông báo để vào chấm điểm.
  
  *(Lưu ý: Bạn không có quyền tự ý đánh dấu hoàn thành - Done cho công việc của mình)*

- **Theo dõi tiến độ:**
  - Bạn có thể xem lại 5 công việc hoàn thành gần nhất và điểm số mà quản lý đã chấm cho mình ngay tại trang chủ.

---

## 3. Dành cho Khách (VIEWER)

**Mục tiêu:** Giám sát tổng quan tình hình dự án (Thường dành cho Đối tác, Khách hàng hoặc Cấp trên không trực tiếp điều hành).

### Chức năng chính:
- **Bảng tin Tổng quan (Read-only Dashboard):**
  - Xem thống kê các chỉ số sức khỏe của Team (Số task đang mở, số task quá hạn, số task đã hoàn thành trong tháng).
  - Quan sát luồng công việc: **Toàn team đang làm gì** và **Hoàn thành gần đây**.
  
- **Tính năng bảo mật:**
  - VIEWER chỉ có quyền XEM (Read-only).
  - Tuyệt đối không thể thấy bất kỳ nút bấm tạo mới, chỉnh sửa, xóa hay thay đổi trạng thái nào. Hệ thống tự động ẩn mọi công cụ thao tác.

---

*Tài liệu được kết xuất tự động từ hệ thống TaskForge.*
