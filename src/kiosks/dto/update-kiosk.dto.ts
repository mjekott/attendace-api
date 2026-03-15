import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateKioskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
