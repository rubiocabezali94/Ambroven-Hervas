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

export class CreateTourDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  @IsString()
  @MinLength(50)
  description!: string;

  @IsString()
  @Length(1, 300)
  short_description!: string;

  @IsEnum(TourCategory)
  category!: TourCategory;

  @IsNumber()
  @Min(0)
  price_per_person!: number;

  @IsNumber()
  @Min(0.5)
  duration_hours!: number;

  @IsInt()
  @Min(1)
  max_capacity!: number;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  language!: string[];

  @IsArray()
  @IsUrl({}, { each: true })
  images!: string[];

  @IsEnum(TourStatus)
  @IsOptional()
  status?: TourStatus;

  @IsString()
  @Length(1, 300)
  meeting_point!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  meeting_point_lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  meeting_point_lng!: number;
}
