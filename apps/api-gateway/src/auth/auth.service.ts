import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuthResponse, UserProfileResponse } from '@app/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<UserProfileResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<UserProfileResponse>(
          `${this.configService.get('auth.authServiceUrl')}/register`,
          data,
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyEmail(token: string, verificationToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.configService.get('auth.authServiceUrl')}/verify-email`,
          {},
          {
            headers: {
              Authorization: token,
              'x-token-verify-email': verificationToken,
            },
          },
        ),
      );
      return response.data as { message: string };
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<AuthResponse>(
          `${this.configService.get('auth.authServiceUrl')}/login`,
          data,
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async refreshToken(
    token: string,
    refreshToken: string,
  ): Promise<AuthResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<AuthResponse>(
          `${this.configService.get('auth.authServiceUrl')}/refresh`,
          { refreshToken },
          {
            headers: {
              Authorization: token,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout(token: string, refreshToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.configService.get('auth.authServiceUrl')}/logout`,
          { refreshToken },
          {
            headers: {
              Authorization: token,
            },
          },
        ),
      );

      return response.data as { message: string };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMe(token: string): Promise<UserProfileResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<UserProfileResponse>(
          `${this.configService.get('auth.authServiceUrl')}/me`,
          {
            headers: { Authorization: token },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    const err = error as {
      response?: { data: string | object; status: number };
    };
    if (err.response) {
      throw new HttpException(err.response.data, err.response.status);
    }
    throw new HttpException('Something went wrong', 503);
  }
}
