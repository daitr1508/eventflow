import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './auth-service.repository';
import { ConfigService } from '@nestjs/config';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  private generateToken(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('auth.jwtExpiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('auth.jwtExpiresInRefreshToken'),
    });

    return { accessToken, refreshToken };
  }

  private getTokenExpiry(): Date {
    return new Date(Date.now() + TOKEN_EXPIRY_MS);
  }

  async register(email: string, password: string, name: string) {
    if (await this.usersRepo.exitingUser(email)) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.usersRepo.createUser(email, hashedPassword, name);

    if (!user) {
      throw new BadRequestException('Failed to create user');
    }

    await this.usersRepo.createProfile(user.id);

    const verificationToken = Math.random().toString(36).substring(2, 15);
    const expiresAt = this.getTokenExpiry();

    await this.usersRepo.createVerificationToken(
      user.id,
      verificationToken,
      expiresAt,
    );

    this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
      userId: user.id,
      email: user.email,
      name: user.name,
      timestamp: new Date().toISOString(),
      verificationToken,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      message: 'User registered successfully',
      userId: user.id,
      verificationToken,
    };
  }

  async verifyEmail(verificationToken: string, userId: string) {
    const user = await this.usersRepo.getMe(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.users?.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const tokenRecord = await this.usersRepo.getVerificationToken(
      userId,
      verificationToken,
    );

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.usersRepo.verifyEmail(userId);
    await this.usersRepo.deleteVerificationToken(userId, verificationToken);

    const { accessToken, refreshToken } = this.generateToken(
      userId,
      user.users.email,
    );

    await this.usersRepo.createRefreshToken({
      userId,
      token: refreshToken,
      expiresAt: this.getTokenExpiry(),
    });

    return {
      accessToken,
      refreshToken,
      message: 'Email verified successfully',
    };
  }

  async getMe(userId: string) {
    const user = await this.usersRepo.getMe(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const tokenRecord = await this.usersRepo.getVerificationToken(userId, '');

    return { ...user, tokenRecord };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.exitingUser(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generateToken(
      user.id,
      user.email,
    );

    await this.usersRepo.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: this.getTokenExpiry(),
    });

    this.kafkaClient.emit(KAFKA_TOPICS.USER_LOGIN, {
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const tokenRecord = await this.usersRepo.getRefreshToken(
      userId,
      refreshToken,
    );

    if (
      !tokenRecord ||
      tokenRecord.isRevoked ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepo.getUserByUserId(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      this.generateToken(userId, user.email);

    await this.usersRepo.revokeRefreshToken(userId, refreshToken);
    await this.usersRepo.createRefreshToken({
      userId,
      token: newRefreshToken,
      expiresAt: this.getTokenExpiry(),
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(userId: string, refreshToken: string) {
    await this.usersRepo.revokeRefreshToken(userId, refreshToken);
    return { message: 'Logged out successfully' };
  }
}
