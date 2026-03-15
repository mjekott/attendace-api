import { IsString, IsNotEmpty } from 'class-validator';

export class LoginKioskDto {
  @IsString()
  @IsNotEmpty()
  secretKey: string;
}
