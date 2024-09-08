import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

import type { CreateUserDto } from 'src/auth/dto/create-user.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { NewUser } from 'src/user/user.interface';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtServices: JwtService,
    private userService: UserService,
    private prismaService: PrismaClient,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByUsername(username);

    if (!user)
      throw new InternalServerErrorException('The user does not exists');

    const passwordValid = await bcrypt.compare(pass, user.password);

    if (passwordValid) {
      const { password, ...result } = user;
      return result;
    }

    throw new BadRequestException('Incorrect password or username');
  }

  async generateToken(user: any, expiresIn?: string) {
    const payload = {
      sub: user.id,
      username: user.username,
      tokenId: uuidv4(),
    };

    if (!expiresIn) {
      return await this.jwtServices.signAsync(payload);
    }

    return await this.jwtServices.signAsync(payload, { expiresIn });
  }

  async login(username: string, pass: string): Promise<any> {
    const user = await this.validateUser(username, pass);

    if (!user) throw new UnauthorizedException();

    const accessToken = await this.generateToken(user);
    const refreshToken = await this.generateToken(
      user,
      this.configService.get<string>('refreshTokenLifetime'),
    );

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(createUserDto: CreateUserDto): Promise<any> {
    const user = await this.userService.findUserByUsername(
      createUserDto.username,
    );

    if (user) {
      throw new InternalServerErrorException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userToCreate: NewUser = {
      ...createUserDto,
      password: hashedPassword,
    };

    await this.userService.createUser(userToCreate);
    return await this.login(createUserDto.username, createUserDto.password);
  }

  async refreshToken(payload: RefreshTokenDto) {
    const oldRefreshToken = payload.refreshToken;
    const { sub } = await this.jwtServices.decode(oldRefreshToken);

    const response = await this.prismaService.refreshToken.findFirst({
      where: {
        token: oldRefreshToken,
      },
    });

    if (!response) throw new BadRequestException('The token does not exists');

    const user = await this.userService.findById(sub);
    if (!user) throw new UnauthorizedException('The user does not exists');

    const accessToken = await this.generateToken(user);
    const refreshToken = await this.generateToken(
      user,
      this.configService.get<string>('refreshTokenLifetime'),
    );

    await this.prismaService.refreshToken.update({
      where: { id: response.id },
      data: { token: refreshToken },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
