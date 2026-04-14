import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { LoginDto, RegisterDto } from '@app/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) { }

  // Register a new user
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authServiceService.register(dto.email, dto.password, dto.name);
  }

  // Verify email address using token and user ID from headers
  @UseGuards(AuthGuard('jwt'))
  @Post('verify-email')
  verifyEmail(
    @Headers('x-token-verify-email') verificationToken: string,
    @Request() req: { user: { userId: string } },
  ) {
    console.log('verificationToken', verificationToken);
    return this.authServiceService.verifyEmail(verificationToken, req.user.userId);
  }

  // Get current user info (protected route)
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Request() req: { user: { userId: string } }) {
    return this.authServiceService.getMe(req.user.userId);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authServiceService.login(dto.email, dto.password);
  }

  // @UseGuards(AuthGuard('jwt'))
  // @Get('profile')
  // getProfile(@Request() req: { user: { userId: string } }) {
  //   return this.authServiceService.getProfile(req.user.userId);
  // }
}