import { IsEmail, IsOptional, IsString, Length, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 100)
  full_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @IsOptional()
  @IsBoolean()
  show_public_profile?: boolean;

  @IsOptional()
  @IsBoolean()
  is_iconic?: boolean;
}
