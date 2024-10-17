export interface User {
    id: number; 
    username: string;
    email: string; 
    password: string;
    role: 'admin' | 'user';
    city: string;
    country: string; 
    domain: string;
  }
  