import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { LoginDto, RegisterDto } from '@app/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionUser } from './session-user.decorator';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

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
    return this.authServiceService.verifyEmail(
      verificationToken,
      req.user.userId,
    );
  }

  // Get current user info (protected route)
  @UseGuards(SessionAuthGuard)
  @Get('me')
  me(@SessionUser() user: { userId: string }) {
    return this.authServiceService.getMe(user.userId);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response,
    @Request() req: any,
  ) {
    const data = await this.authServiceService.login(dto.email, dto.password);

    req.session.user = {
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
    };

    response.cookie('refreshToken', data.refresh_token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return data;
  }

  @UseGuards(SessionAuthGuard)
  @Post('refresh-token')
  refreshToken(
    @SessionUser() user: { userId: string },
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authServiceService.refreshToken(user.userId, refreshToken);
  }

  @UseGuards(SessionAuthGuard)
  @Post('logout')
  async logout(
    @Request() req: any,
    @Body('refreshToken') refreshToken: string,
  ) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required for logout');
    }

    const userId = req.session.user.userId;
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    return this.authServiceService.logout(userId, refreshToken);
  }
}
