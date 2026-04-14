import {
  IsEnum,
  IsString,
  IsDateString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { BookingStatus } from '../entities/enums';

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  stripe_payment_intent_id?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  stripe_payment_status?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  google_calendar_event_id?: string;

  @IsDateString()
  @IsOptional()
  cancelled_at?: string;
}
