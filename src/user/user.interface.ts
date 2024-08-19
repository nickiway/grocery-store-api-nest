import { CreateUserDto } from './dto/create-user.dto';

export interface User extends CreateUserDto {
  id: number;
}
