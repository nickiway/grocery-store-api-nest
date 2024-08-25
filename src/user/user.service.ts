import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NewUser } from './user.interface';

@Injectable()
export class UserService {
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

  async findById(id: number) {
    return this.prisma.user.findFirst({
      where: {
        id,
      },
    });
  }

  async createUser(newUser: NewUser) {
    await this.prisma.user.create({ data: newUser });
  }
}
