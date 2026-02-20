import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getSources() {
    return await this.prisma.sources.findMany();
  }
}
