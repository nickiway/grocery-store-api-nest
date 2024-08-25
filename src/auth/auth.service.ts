import * as bcrypt from 'bcrypt';

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

import type { CreateUserDto } from 'src/user/dto/create-user.dto';
import type { NewUser } from 'src/user/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtServices: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByUsername(username);

    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (user && isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }

    throw new BadRequestException('Incorrect password or username');
  }
  async login(username: string, pass: string): Promise<any> {
    const user = await this.validateUser(username, pass);

    const payload = { sub: user.id, username: user.username };

    return {
      access_token: await this.jwtServices.signAsync(payload),
    };
  }

  async register(user: CreateUserDto): Promise<any> {
    const userDb = await this.userService.findUserByUsername(user.username);
    const emailDb = await this.userService.findUserByEmail(user.email);

    if (userDb || emailDb) {
      throw new HttpException(
        'User already exists',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const userToCreate: NewUser = {
      ...user,
      password: hashedPassword,
    };

    await this.userService.createUser(userToCreate);
    return await this.login(user.username, hashedPassword);
  }
}
