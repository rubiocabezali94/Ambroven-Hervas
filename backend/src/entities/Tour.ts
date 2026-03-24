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
import { TourCategory, TourStatus } from './enums';
import { User } from './User';
import { Waypoint } from './Waypoint';

@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 300 })
  short_description!: string;

  @Column({ type: 'enum', enum: TourCategory })
  category!: TourCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_per_person!: number;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  duration_hours!: number;

  @Column({ type: 'int' })
  max_capacity!: number;

  @Column({ type: 'simple-array' })
  language!: string[];

  @Column({ type: 'simple-array' })
  images!: string[];

  @Column({ type: 'enum', enum: TourStatus, default: TourStatus.DRAFT })
  status!: TourStatus;

  @Column({ type: 'varchar', length: 300 })
  meeting_point!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  meeting_point_lat!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  meeting_point_lng!: number;

  @Column({ type: 'uuid' })
  operator_id!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'operator_id' })
  operator!: User;

  @OneToMany(() => Waypoint, (waypoint) => waypoint.tour, { cascade: true })
  waypoints!: Waypoint[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
