export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface LoginDTO {
  email: string;
  password: string;
}
