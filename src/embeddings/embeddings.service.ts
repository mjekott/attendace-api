import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cosineSimilarity } from '../common/utils/cosine-similarity';
import { EnrollEmbeddingDto } from './dto/enroll-embedding.dto';

// MobileFaceNet 192-dim cosine similarity threshold
// >= 0.6 = confident match, 0.4-0.6 = uncertain, < 0.4 = no match
const MATCH_THRESHOLD = 0.6;

interface MatchResult {
  matched: boolean;
  userId?: string;
  userName?: string;
  confidence?: number;
}

@Injectable()
export class EmbeddingsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(dto: EnrollEmbeddingDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const embeddings = await Promise.all(
      dto.vectors.map((vector) =>
        this.prisma.faceEmbedding.create({
          data: { userId: dto.userId, vector: JSON.stringify(vector) },
        }),
      ),
    );

    return {
      userId: user.id,
      enrolledCount: embeddings.length,
    };
  }

  async findMatchForUser(
    inputEmbedding: number[],
    employeeId: string,
  ): Promise<MatchResult> {
    const user = await this.prisma.user.findUnique({
      where: { employeeId },
      include: { embeddings: true },
    });

    if (!user) {
      return { matched: false };
    }

    let highestSimilarity = 0;

    for (const stored of user.embeddings) {
      const storedVector: number[] = JSON.parse(stored.vector);
      const similarity = cosineSimilarity(inputEmbedding, storedVector);

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
      }
    }

    if (highestSimilarity >= MATCH_THRESHOLD) {
      return {
        matched: true,
        userId: user.id,
        userName: user.name,
        confidence: highestSimilarity,
      };
    }

    return { matched: false };
  }

  async findMatch(inputEmbedding: number[]): Promise<MatchResult> {
    const allEmbeddings = await this.prisma.faceEmbedding.findMany({
      include: { user: { select: { id: true, name: true } } },
    });

    let bestMatch: MatchResult = { matched: false };
    let highestSimilarity = 0;

    for (const stored of allEmbeddings) {
      const storedVector: number[] = JSON.parse(stored.vector);
      const similarity = cosineSimilarity(inputEmbedding, storedVector);

      if (similarity > highestSimilarity && similarity >= MATCH_THRESHOLD) {
        highestSimilarity = similarity;
        bestMatch = {
          matched: true,
          userId: stored.user.id,
          userName: stored.user.name,
          confidence: similarity,
        };
      }
    }

    return bestMatch;
  }
}
