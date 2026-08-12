declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
    };
  }
}
