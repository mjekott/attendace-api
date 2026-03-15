import { IsString, IsNotEmpty } from 'class-validator';

export class CreateKioskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}
