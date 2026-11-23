import { IsByteLength, IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Body of POST /auth/signup. The global ValidationPipe rejects anything else (e.g. "role").
export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @IsEmail()
  @MaxLength(254)
  email: string;

  // bcrypt only uses the first 72 bytes, so longer passwords would be silently cut.
  // Bytes, not characters: æ, ø and å take 2 bytes each in UTF-8.
  @IsString()
  @IsByteLength(8, 72)
  password: string;

  @IsString()
  confirmPassword: string;
}
