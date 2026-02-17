import { Injectable } from '@nestjs/common';
import { IUser } from '../types/interfaces/user.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<IUser | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return undefined;
    }

    return {
      userId: user.id,
      username: user.username,
      password: user.password,
      email: user.email,
    };
  }
}
