import { Prisma } from '@prisma/client';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';

import type { CreateUserDto } from 'src/user/dto/create-user.dto';
import type { AccessToken } from './access-token.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any): Promise<AccessToken> {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() body: CreateUserDto): Promise<AccessToken> | never {
    try {
      await this.authService.register(body);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          console.log(e);
          throw new HttpException(
            'There is a unique constraint violation, a new user cannot be created with this email',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    throw new InternalServerErrorException();
  }
}
