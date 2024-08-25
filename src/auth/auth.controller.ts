// import { Prisma } from '@prisma/client';
import {
  Body,
  Controller,
  HttpCode,
  // HttpException,
  HttpStatus,
  // InternalServerErrorException,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

// import type { CreateUserDto } from 'src/user/dto/create-user.dto';
// import type { AccessToken } from './access-token.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: Record<string, any>) {
    return this.authService.login(signInDto.username, signInDto.password);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
