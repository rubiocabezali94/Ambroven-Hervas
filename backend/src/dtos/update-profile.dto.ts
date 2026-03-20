import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export enum AllowedLanguage {
  ES = 'es',
  EN = 'en',
  FR = 'fr',
  PT = 'pt',
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatar_url?: string;

  @IsOptional()
  @IsEnum(AllowedLanguage)
  preferred_language?: AllowedLanguage;

  // email is intentionally excluded — cannot be updated via this endpoint
}
