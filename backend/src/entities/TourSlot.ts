import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tour } from './Tour';
import { Booking } from './Booking';

@Entity('tour_slots')
export class TourSlot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tour_id!: string;

  @ManyToOne(() => Tour, (tour) => tour.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tour_id' })
  tour!: Tour;

  @Column({ type: 'timestamptz' })
  start_datetime!: Date;

  @Column({ type: 'timestamptz' })
  end_datetime!: Date;

  @Column({ type: 'int' })
  available_spots!: number;

  @Column({ type: 'boolean', default: false })
  blocked!: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  blocked_reason!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => Booking, (booking) => booking.slot)
  bookings!: Booking[];
}
