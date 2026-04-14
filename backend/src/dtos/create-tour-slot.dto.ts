import {
  IsUUID,
  IsDateString,
  IsInt,
  IsBoolean,
  IsString,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateTourSlotDto {
  @IsUUID()
  tour_id!: string;

  @IsDateString()
  start_datetime!: string;

  @IsDateString()
  end_datetime!: string;

  @IsInt()
  @Min(0)
  available_spots!: number;

  @IsBoolean()
  @IsOptional()
  blocked?: boolean;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  blocked_reason?: string;
}
