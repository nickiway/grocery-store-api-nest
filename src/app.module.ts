import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BinModule } from './bin/bin.module';
import { BinService } from './bin/bin.service';

import { LoggerMiddleware } from './logger/logger.middleware';

@Module({
  imports: [BinModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(private binService: BinService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
