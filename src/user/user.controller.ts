import {
  Controller,
  Request,
  Get,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from './user.service';

import { UpdateUserDto } from './dto/user-to-update.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getUserProfile(@Request() req: any) {
    const userObj = await this.userService.findById(req.user.userId);

    const { password, ...user } = userObj;
    return user;
  }

  @Post('profile')
  async updateUserProfile(
    @Request() req: any,
    @Body() userToUpdate: UpdateUserDto,
  ): Promise<any> {
    const response = await this.userService.update(
      req.user.userId,
      userToUpdate,
    );

    return response;
  }
}
