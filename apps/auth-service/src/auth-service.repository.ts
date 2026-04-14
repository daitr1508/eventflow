// src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService, emailVerificationTokens, userProfiles, users } from '@app/database';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly dbService: DatabaseService,
  ) {}

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
    
      return user
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

  async createVerificationToken(userId: string, token: string, expiresAt: Date) {
    return await this.dbService.db
      .insert(emailVerificationTokens)
      .values({ userId, token, expiresAt })
      .returning();
  }
}
