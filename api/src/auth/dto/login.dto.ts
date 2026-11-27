import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// Body of POST /auth/login. No password rules here: login must not reveal the signup policy.
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
