import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NewUser } from './user.interface';
// import { PrismaClient } from '@prisma/client';
// import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  // constructor(private prisma: PrismaClient) {}
  // async create(user: CreateUserDto) {
  //   return await this.prisma.user.create({
  //     data: {
  //       ...user,
  //     },
  //   });
  // }
  // async findOneByEmail(email: string) {
  //   return await this.prisma.user.findFirst({
  //     where: {
  //       email,
  //     },
  //   });
  // }

  constructor(private prisma: PrismaClient) {}
  async findUserByUsername(username: string) {
    return this.prisma.user.findFirst({
      where: {
        username,
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  async createUser(newUser: NewUser) {
    await this.prisma.user.create({ data: newUser });
  }
}
