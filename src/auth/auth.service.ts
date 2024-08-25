import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

import type { CreateUserDto } from 'src/user/dto/create-user.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { NewUser } from 'src/user/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtServices: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByUsername(username);

    const passwordValid = await bcrypt.compare(pass, user.password);

    if (user && passwordValid) {
      const { password, ...result } = user;
      return result;
    }

    throw new BadRequestException('Incorrect password or username');
  }

  async generateRefreshToken(user: any) {
    const payload = { sub: user.id, tokenId: uuidv4() };
    return await this.jwtServices.signAsync(payload, { expiresIn: '7d' });
  }

  async generateAccessToken(user: any) {
    const payload = { sub: user.id, username: user.username };
    return await this.jwtServices.signAsync(payload);
  }

  async login(username: string, pass: string): Promise<any> {
    const user = await this.validateUser(username, pass);

    if (!user) throw new UnauthorizedException();

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

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
      throw new HttpException(
        'User already exists',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

    const user = await this.userService.findById(sub);

    const accessToken = await this.generateRefreshToken(user);
    const refreshToken = await this.generateAccessToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }
}
