import { Controller, Post, Body } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { EnrollEmbeddingDto } from './dto/enroll-embedding.dto';

@Controller('embeddings')
export class EmbeddingsController {
  constructor(private readonly embeddingsService: EmbeddingsService) {}

  @Post('enroll')
  enroll(@Body() dto: EnrollEmbeddingDto) {
    return this.embeddingsService.enroll(dto);
  }
}
