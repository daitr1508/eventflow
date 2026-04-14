import { DatabaseService, users } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import {
  ConflictException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './auth-service.repository';

@Injectable()
export class AuthServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkClient: ClientKafka,
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    // connect to kafka when module initializes
    await this.kafkClient.connect();
  }

  async register(email: string, password: string, name: string) {
    // check if user exists
    const exitingUser = await this.usersRepo.exitingUser(email);

    if (exitingUser.length > 0) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await this.usersRepo.createUser(email, hashedPassword, name)

    // send user registered event
    this.kafkClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
      userId: user.id,
      email: user.email,
      name: user.name,
      timestamp: new Date().toISOString(),
    });

    return { message: 'User registered successfully', userId: user.id };
  }

  // async login(email: string, password: string) {
  //   const [user] = await this.dbService.db
  //     .select()
  //     .from(users)
  //     .where(eq(users.email, email))
  //     .limit(1);

  //   if (!user || !(await bcrypt.compare(password, user.password))) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }

  //   const token = this.jwtService.sign({ sub: user.id, email: user.email });

  //   this.kafkClient.emit(KAFKA_TOPICS.USER_LOGIN, {
  //     userId: user.id,
  //     timestamp: new Date().toISOString(),
  //   });

  //   return {
  //     access_token: token,
  //     user: {
  //       id: user.id,
  //       email: user.email,
  //       name: user.name,
  //       role: user.role,
  //     },
  //   };
  // }

  // async getProfile(userId: string) {
  //   const [user] = await this.dbService.db
  //     .select({
  //       id: users.id,
  //       email: users.email,
  //       name: users.name,
  //       role: users.role,
  //     })
  //     .from(users)
  //     .where(eq(users.id, userId))
  //     .limit(1);

  //   if (!user) {
  //     throw new UnauthorizedException('User not found');
  //   }

  //   return user;
  // }
}