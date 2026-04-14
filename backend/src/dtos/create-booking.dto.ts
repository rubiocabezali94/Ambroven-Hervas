import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  slot_id!: string;

  @IsInt()
  @Min(1)
  num_persons!: number;
}
