// src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService, users } from '@app/database';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly dbService: DatabaseService,
  ) {}


  async exitingUser(email: string) {
    return await this.dbService.db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
  }

  async createUser(email: string, hashedPassword: string, name: string) {
    const [user] = await this.dbService.db
      .insert(users)
      .values({ email, passwordHash: hashedPassword, name })
      .returning();
    
      return user
  }
}