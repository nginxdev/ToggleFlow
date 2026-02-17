import { UsersService } from '../users/users.service';
import { IUserWithoutPassword } from '../types/interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<IUserWithoutPassword | null>;
    login(user: IUserWithoutPassword): {
        access_token: string;
        user: {
            id: number;
            email: string;
            username: string;
        };
    };
}
