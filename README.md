#
# Báo cáo Thần số học

Ứng dụng Next.js cho phép người dùng đăng nhập bằng Google, cung cấp thông tin ngày sinh và họ tên để tạo báo cáo thần số học đầy đủ. Hệ thống sinh báo cáo ở định dạng PDF, DOCX, lưu trữ kết quả trên Supabase và gửi email kèm file PDF đính kèm.

## Tính năng chính
- Đăng nhập một chạm với Google thông qua NextAuth.
- Biểu mẫu thu thập họ tên, ngày sinh và tự động liên kết với email Google.
- Tạo báo cáo thần số học chi tiết (đường đời, biểu đạt, linh hồn, nhân cách, gợi ý hành động).
- Xuất báo cáo PDF, DOCX ngay trên trình duyệt và tự động gửi email cho người dùng.
- Lưu trữ hồ sơ và báo cáo trên Supabase để tải lại khi người dùng quay trở lại.

## Yêu cầu môi trường
- Node.js 18+
- Tài khoản Google Cloud (OAuth 2.0 Client ID)
- Supabase project
- SMTP server để gửi email (có thể dùng SendGrid, Resend, Mailgun, v.v.)

## Thiết lập nhanh
1. Sao chép tệp `.env.example` thành `.env.local` và bổ sung giá trị thực:
   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   NEXTAUTH_SECRET=$(openssl rand -hex 32)
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SMTP_HOST=...
   SMTP_PORT=587
   SMTP_USER=...
   SMTP_PASS=...
   SMTP_FROM="Numerology App <no-reply@yourdomain.com>"
   ```
2. Khởi tạo cơ sở dữ liệu Supabase với bảng:
   ```sql
   create table if not exists profiles (
     user_id text primary key,
     email text not null,
     full_name text,
     birth_date text,
     report_json jsonb,
     created_at timestamptz default timezone('utc', now()),
     updated_at timestamptz default timezone('utc', now())
   );

   create trigger handle_updated_at
   before update on profiles
   for each row
   execute procedure moddatetime(updated_at);
   ```
   Bật Row Level Security nếu cần và tạo chính sách phù hợp cho các dịch vụ phía máy chủ.
3. Cài đặt phụ thuộc và chạy:
   ```bash
   npm install
   npm run dev
   ```
4. Truy cập `http://localhost:3000`, đăng nhập bằng Google và tạo báo cáo.

## Triển khai lên Vercel
1. Cấu hình biến môi trường `.env.local` của Vercel với các giá trị ở trên.
2. Chạy build và kiểm tra:
   ```bash
   npm run build
   npm start
   ```
3. Deploy:
   ```bash
   vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-3cd06abf
   ```

## Cấu trúc thư mục
```
app/
  api/
    auth/[...nextauth]/route.ts    # Định tuyến NextAuth
    report/route.ts                # API tạo báo cáo, gửi email, xuất file
  page.tsx                         # Trang chính, điều hướng theo trạng thái đăng nhập
  layout.tsx                       # Bao layout, SessionProvider
components/
  auth-buttons.tsx                 # Nút đăng nhập/đăng xuất
  report-form.tsx                  # Biểu mẫu và hiển thị báo cáo
lib/
  auth.ts                          # Cấu hình NextAuth
  email.ts                         # Nodemailer
  numerology.ts                    # Thuật toán tính toán
  profiles.ts                      # Tương tác Supabase
  report-export.ts                 # Tạo PDF, DOCX, HTML email
  supabase.ts                      # Supabase admin client
```

## Kiểm thử
- `npm run lint` đảm bảo code style Next.js.
- `npm run build` xác nhận ứng dụng biên dịch thành công trước khi deploy.

## Giấy phép
Dự án phát hành dưới giấy phép MIT. Vui lòng xem `LICENSE` (nếu có) hoặc bổ sung giấy phép phù hợp với nhu cầu của bạn.
