import {
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  IsArray,
  IsUrl,
  IsOptional,
  Length,
  MinLength,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { TourCategory, TourStatus } from '../entities/enums';

export class UpdateTourDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(50)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  short_description?: string;

  @IsOptional()
  @IsEnum(TourCategory)
  category?: TourCategory;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price_per_person?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  duration_hours?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_capacity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  language?: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @IsOptional()
  @IsEnum(TourStatus)
  status?: TourStatus;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  meeting_point?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  meeting_point_lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  meeting_point_lng?: number;
}

