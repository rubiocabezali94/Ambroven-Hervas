import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tour } from './Tour';

@Entity('waypoints')
export class Waypoint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tour_id!: string;

  @ManyToOne(() => Tour, (tour) => tour.waypoints, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tour_id' })
  tour!: Tour;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  lat!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  lng!: number;

  @Column({ type: 'int' })
  order!: number;

  @Column({ type: 'varchar', length: 100 })
  label!: string;
}
