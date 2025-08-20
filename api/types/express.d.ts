import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        roles: string[];
        permissions: string[];
        iat?: number;
        exp?: number;
      };
    }
  }
}