import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '@app/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //***********Nhóm Authentication (Xác thực cơ bản)*******

  //POST /auth/register: Đăng ký tài khoản mới (Tạo dữ liệu trong bảng users và user_profiles).
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  //POST /auth/login: Đăng nhập. Trả về Access Token và thiết lập Refresh Token vào HttpOnly Cookie (Ghi log vào auth_audit_logs).
  @Post('login')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  //POST /auth/refresh: Sử dụng Refresh Token để cấp mới Access Token khi token cũ hết hạn (Kiểm tra trong bảng refresh_tokens).

  //POST /auth/logout: Đăng xuất. Xóa Refresh Token trong Database (Update is_revoked = true) và xóa Cookie phía Client.

  //POST /auth/forgot-password: Yêu cầu khôi phục mật khẩu (Gửi email chứa link/OTP).

  //POST /auth/reset-password: Đặt lại mật khẩu mới bằng token được gửi từ email.

  //POST /auth/verify-email: Xác nhận email sau khi đăng ký (Gửi email chứa link/OTP để xác thực).
  @Post('verify-email')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  verifyEmail(
    @Headers('authorization') authorization: string,
    @Headers('x-token-verify-email') verificationToken: string,
  ) {
    return this.authService.verifyEmail(authorization, verificationToken);
  }

  // ---------------------------------------------------------

  // ******* Nhóm Multi-Factor Authentication (MFA/2FA) *******
  //GET /auth/mfa/setup: Tạo Secret Key và trả về mã QR Code để người dùng quét vào app (Google Authenticator).

  //POST /auth/mfa/enable: Xác nhận mã OTP đầu tiên để chính thức kích hoạt 2FA.

  //POST /auth/mfa/disable: Vô hiệu hóa 2FA cho tài khoản.POST /auth/mfa/disable: Tắt 2FA (Yêu cầu mật khẩu hoặc mã xác nhận).

  //POST /auth/mfa/verify: Bước xác thực thứ 2 sau khi đăng nhập thành công bằng mật khẩu.

  // ----------------------------------------------------------

  // ******* Nhóm Social Login (Đăng nhập xã hội) *******
  //GET /auth/google: Điều hướng người dùng đến trang đăng nhập của Google.

  //GET /auth/google/callback: Tiếp nhận dữ liệu từ Google trả về, kiểm tra bảng social_accounts để đăng nhập hoặc tạo mới user.

  // ----------------------------------------------------------

  // ****** Nhóm User Profile & Account (Cá nhân hóa) ******
  //GET /me: Lấy thông tin chi tiết của người dùng đang đăng nhập (bao gồm cả Profile và Roles).
  @Get('me')
  @SkipThrottle()
  getMe(@Headers('authorization') authorization: string) {
    return this.authService.getMe(authorization);
  }

  //PATCH /me/profile: Cập nhật thông tin cá nhân (Họ tên, avatar, bio).

  //PATCH /me/change-password: Thay đổi mật khẩu (Yêu cầu mật khẩu cũ).

  //GET /me/sessions: Liệt kê tất cả các thiết bị/phiên đang đăng nhập (Lấy từ bảng refresh_tokens).

  //DELETE /me/sessions/:id: Đăng xuất từ xa một thiết bị cụ thể (Revoke token theo ID).

  // ----------------------------------------------------------

  //******* Nhóm RBAC - Role & Permissions (Quản trị viên) *******
  //GET /admin/users: Danh sách toàn bộ người dùng (Phân trang, tìm kiếm).

  //PATCH /admin/users/:id/status: Khóa hoặc kích hoạt lại tài khoản (Update bảng users.status).

  //GET /admin/roles: Danh sách các vai trò trong hệ thống.

  //POST /admin/roles/:id/permissions: Gán thêm hoặc gỡ bỏ quyền cho một Role cụ thể.

  //PATCH /admin/users/:id/role: Thay đổi quyền hạn của một người dùng.

  // ----------------------------------------------------------

  //***** Nhóm Audit & Logs (Giám sát) *******
  //GET /admin/audit-logs: Xem lịch sử đăng nhập/hoạt động của toàn hệ thống (Bảng auth_audit_logs).

  //GET /admin/audit-logs/:userId: Xem lịch sử hoạt động riêng của một người dùng để điều tra nghi vấn hack.
}
