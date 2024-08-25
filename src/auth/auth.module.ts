import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// import { JwtStrategy } from './jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';

// @Module({
//   imports: [
//     PassportModule.register({ defaultStrategy: 'jwt' }),
//     JwtModule.register({
//       secret: 'secret',
//       signOptions: { expiresIn: '60s' },
//     }),
//     UserModule,
//   ],
//   controllers: [AuthController],
//   providers: [AuthService, JwtStrategy],
//   exports: [JwtModule, PassportModule],
// })
// export class AuthModule {}

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    PassportModule.register({
      defaultStrategy: 'local',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '60m' },
    }),
  ],

  providers: [AuthService, LocalStrategy],
  controllers: [AuthController],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
