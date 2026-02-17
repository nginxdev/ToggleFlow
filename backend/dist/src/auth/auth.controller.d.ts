import { Request } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: Request): {
        access_token: string;
        user: {
            id: number;
            email: string;
            username: string;
        };
    };
    getProfile(req: Request): Express.User | undefined;
}
