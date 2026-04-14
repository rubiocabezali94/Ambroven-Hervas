import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingStatus } from './enums';
import { User } from './User';
import { Tour } from './Tour';
import { TourSlot } from './TourSlot';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid' })
  tour_id!: string;

  @ManyToOne(() => Tour, (tour) => tour.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tour_id' })
  tour!: Tour;

  @Column({ type: 'uuid' })
  slot_id!: string;

  @ManyToOne(() => TourSlot, (slot) => slot.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'slot_id' })
  slot!: TourSlot;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING_PAYMENT })
  status!: BookingStatus;

  @Column({ type: 'int' })
  num_persons!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount!: number;

  @Column({ type: 'timestamptz' })
  cancellation_deadline!: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  stripe_payment_intent_id!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  stripe_payment_status!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  google_calendar_event_id!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelled_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
