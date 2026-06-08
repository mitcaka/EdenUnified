# TaskForge - Internal task hub for focused teams

Ứng dụng quản lý công việc (Project & Task Management) dành cho nội bộ, chạy trực tiếp trên Windows Server.

## Yêu cầu hệ thống
- Hệ điều hành: Windows Server 2019 (hoặc Windows 10/11)
- Node.js: >= 18.x
- Npm: >= 9.x

## Cài đặt lần đầu
1. Mở PowerShell hoặc Command Prompt tại thư mục dự án.
2. Chạy lệnh cài đặt thư viện:
   ```cmd
   npm install
   ```
3. Khởi tạo Database (SQLite) và seed tài khoản mặc định:
   ```cmd
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

## Chạy ứng dụng trên Production
1. Bạn chỉ cần chạy file `start.bat`. File này sẽ tự động build ứng dụng và khởi chạy trên port `3005`.
   *(Nếu bạn cần chạy trên port `3001` như dự định ban đầu, bạn có thể chuột phải vào file `start.bat` -> Edit, và sửa dòng `set PORT=3005` thành `set PORT=3001`)*.

## Mở cổng Firewall (Windows Server)
Để các máy tính khác trong mạng nội bộ hoặc bên ngoài có thể truy cập, bạn cần mở cổng Firewall cho Port của ứng dụng (VD: 3005).
1. Mở **PowerShell (Run as Administrator)**.
2. Dán và chạy lệnh sau:
   ```powershell
   New-NetFirewallRule -DisplayName "TaskForge Port" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow
   ```

## Sao lưu (Backup) & Khôi phục (Restore) Database
### Sao lưu:
- Chạy file `backup.bat`.
- Hệ thống sẽ tự động copy file database hiện tại (`data/app.db`) vào thư mục `backups/` với tên kèm theo timestamp.

### Khôi phục (Restore):
1. **Tắt ứng dụng**: Đóng cửa sổ CMD/PowerShell đang chạy `start.bat`.
2. Xóa hoặc đổi tên file database hiện tại tại `data/app.db` (VD: đổi thành `app_old.db`).
3. Vào thư mục `backups/`, copy file backup mà bạn muốn khôi phục (VD: `app_20240503_120000.db`).
4. Dán file đó vào thư mục `data/` và **đổi tên lại thành `app.db`**.
5. Chạy lại `start.bat` để ứng dụng nhận dữ liệu cũ.

## Tích hợp Discord Webhook
Hệ thống hỗ trợ gửi thông báo (tag thành viên) trực tiếp vào kênh Discord khi có công việc mới được giao, yêu cầu review, hoặc bị trả về.

### Cách cấu hình Webhook:
1. Mở Discord, vào **Server Settings > Integrations > Webhooks**.
2. Nhấn **New Webhook**, chọn kênh (channel) muốn nhận thông báo (VD: `#cong-viec`).
3. Nhấn **Copy Webhook URL**.
4. Mở file `.env` ở thư mục gốc của project (nếu chưa có thì copy từ `.env.example`).
5. Dán URL vào biến `DISCORD_WEBHOOK_URL`, và cập nhật `APP_BASE_URL` bằng IP/Domain thực tế của bạn để link chuyển hướng hoạt động đúng:
   ```env
   DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
   APP_BASE_URL="http://IP_VPS:3005"
   DISCORD_NOTIFY_ENABLED="true"
   ```
   *Lưu ý: Không để lộ Webhook URL ra ngoài.*

### Hướng dẫn lấy Discord User ID:
Để ứng dụng có thể tag (@) được bạn trên Discord, bạn cần điền **Discord User ID** vào Hồ sơ cá nhân.
1. Mở Discord > **User Settings > Advanced > Bật Developer Mode**.
2. Tìm tên của bạn trên một tin nhắn bất kỳ, **chuột phải** và chọn **Copy User ID** (Chỉ chứa số, VD: `123456789012345678`).
3. Đăng nhập vào TaskForge, chọn menu **Hồ sơ cá nhân** (ở góc trái bên dưới) hoặc nhờ Admin sửa trong quản lý nhân sự, dán ID vào mục **Discord User ID** và lưu lại.

## Phân quyền
- **OWNER / ADMIN**: Toàn quyền thêm, sửa, xóa dự án, nhân sự, công việc.
- **MEMBER**: Chỉ có quyền xem và Cập nhật trạng thái/thông tin của công việc (Task) được gán cho chính mình. Không thể tự sửa điểm (Point) hay tự ý đổi sang DONE nếu cần Review.
- **VIEWER**: Chỉ có quyền xem (Read-only).
