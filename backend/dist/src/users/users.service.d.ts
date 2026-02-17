import { IUser } from '../types/interfaces/user.interface';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(email: string): Promise<IUser | undefined>;
}
