import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
import { AuthServiceModule } from './auth-service.module';
import { SERVICES_PORTS } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { RedisStore } from 'connect-redis';
import { RedisService } from './redis/redis.service';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  const redisService = app.get(RedisService);
  const redisClient = redisService.getClient();

  const store = new RedisStore({
    client: redisClient,
    prefix: 'session:',
  });

  // Sessions
  // Set up express-session
  app.use(
    session({
      store,
      secret: process.env.SESSION_SECRET || 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60, // Set the cookie to expire in 1 hour
      },
    }),
  );

  // Initialize passport for JWT and request handling
  app.use(passport.initialize());

  //Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(SERVICES_PORTS.AUTH_SERVICE);
  console.log(`Auth Service is running on port ${SERVICES_PORTS.AUTH_SERVICE}`);
}
void bootstrap();
