import {
  IsDateString,
  IsInt,
  IsBoolean,
  IsString,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class UpdateTourSlotDto {
  @IsDateString()
  @IsOptional()
  end_datetime?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  available_spots?: number;

  @IsBoolean()
  @IsOptional()
  blocked?: boolean;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  blocked_reason?: string | null;
}
