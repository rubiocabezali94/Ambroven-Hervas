import { IsInt, IsNumber, IsString, Length, Max, Min } from 'class-validator';

export class CreateWaypointDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsInt()
  @Min(1)
  order!: number;

  @IsString()
  @Length(1, 100)
  label!: string;
}
