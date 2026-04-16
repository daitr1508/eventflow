import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '@app/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3000, ttl: 60000 } })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email')
  @Throttle({ default: { limit: 3000, ttl: 60000 } })
  verifyEmail(
    @Headers('authorization') authorization: string,
    @Headers('x-token-verify-email') verificationToken: string,
  ) {
    return this.authService.verifyEmail(authorization, verificationToken);
  }

  @Get('me')
  @SkipThrottle()
  getMe(@Headers('authorization') authorization: string) {
    return this.authService.getMe(authorization);
  }

  @Post('login')
  @Throttle({ default: { limit: 500, ttl: 60000 } })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // @Get('profile')
  // @SkipThrottle()
  // getProfile(@Headers('authorization') authorization: string) {
  //   return this.authService.getProfile(authorization);
  // }
}
