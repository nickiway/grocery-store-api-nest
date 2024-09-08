import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { LoggerMiddleware } from './logger/logger.middleware';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
