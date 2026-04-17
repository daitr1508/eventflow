// src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import {
  DatabaseService,
  emailVerificationTokens,
  refreshTokens,
  userProfiles,
  users,
} from '@app/database';

@Injectable()
export class UsersRepository {
  constructor(private readonly dbService: DatabaseService) {}

  async exitingUser(email: string) {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user;
  }

  async createUser(email: string, hashedPassword: string, name: string) {
    const [user] = await this.dbService.db
      .insert(users)
      .values({ email, passwordHash: hashedPassword, name })
      .returning();

    return user;
  }

  async createProfile(userId: string) {
    return await this.dbService.db
      .insert(userProfiles)
      .values({ userId })
      .returning();
  }

  async getMe(userId: string) {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, userId))
      .limit(1);

    return user;
  }

  async getUserByUserId(userId: string) {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user;
  }

  async createVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ) {
    return await this.dbService.db
      .insert(emailVerificationTokens)
      .values({ userId, token, expiresAt })
      .returning();
  }

  async getVerificationToken(userId: string, token: string) {
    const [verificationToken] = await this.dbService.db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.userId, userId),
          eq(emailVerificationTokens.token, token),
        ),
      )
      .limit(1);

    return verificationToken;
  }

  async deleteVerificationToken(userId: string, token: string) {
    await this.dbService.db
      .delete(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.userId, userId),
          eq(emailVerificationTokens.token, token),
        ),
      );
  }

  async verifyEmail(userId: string) {
    await this.dbService.db
      .update(users)
      .set({ isEmailVerified: true })
      .where(eq(users.id, userId));
  }

  async createRefreshToken({
    userId,
    token,
    // deviceId,
    // ipAddress,
    // userAgent,
    expiresAt,
  }: {
    userId: string;
    token: string;
    // deviceId: string | null;
    // ipAddress: string | null;
    // userAgent: string | null;
    expiresAt: Date;
  }) {
    return await this.dbService.db
      .insert(refreshTokens)
      .values({
        userId,
        token,
        expiresAt,
      })
      .returning();
  }

  async getRefreshToken(userId: string, token: string) {
    const [refreshToken] = await this.dbService.db
      .select()
      .from(refreshTokens)
      .where(
        and(eq(refreshTokens.userId, userId), eq(refreshTokens.token, token)),
      )
      .limit(1);

    return refreshToken;
  }

  async revokeRefreshToken(userId: string, token: string) {
    await this.dbService.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(
        and(eq(refreshTokens.userId, userId), eq(refreshTokens.token, token)),
      );
  }
}
