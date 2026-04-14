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

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authServiceService.register(dto.email, dto.password, dto.name);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('verify-email')
  verifyEmail(
    @Headers('x-token-verify-email') verificationToken: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.authServiceService.verifyEmail(verificationToken, userId);
  }

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