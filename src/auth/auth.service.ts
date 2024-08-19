import bcrypt from 'bcrypt';

import { BadRequestException, Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

import type { CreateUserDto } from 'src/user/dto/create-user.dto';
import type { User } from 'src/user/user.interface';
import type { AccessToken } from './access-token.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtServices: JwtService,
    private userService: UserService,
  ) {}

  async validate(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('The user is not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequestException('The password incorrect');

    return user;
  }
  async login(user: User): Promise<AccessToken> {
    const payload = { email: user.email, id: user.id };
    return { access_token: this.jwtServices.sign(payload) };
  }

  async register(user: CreateUserDto): Promise<AccessToken> {
    const existingUser = this.userService.findOneByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('The email already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: User = await this.userService.create({
      ...user,
      password: hashedPassword,
    });

    return this.login(newUser);
  }
}
