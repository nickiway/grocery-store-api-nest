import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  username: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
