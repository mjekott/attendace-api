import { IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';

export class EnrollEmbeddingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ArrayMinSize(1)
  vectors: number[][];
}
