import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Tour } from './entities/Tour';
import { Waypoint } from './entities/Waypoint';
import { TourSlot } from './entities/TourSlot';

if (!process.env.DATABASE_PASSWORD) {
  throw new Error('DATABASE_PASSWORD is not set. Copy .env.example to .env and fill in the values.');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  database: process.env.DATABASE_NAME ?? 'ambroven_dev',
  username: process.env.DATABASE_USER ?? 'ambroven',
  password: process.env.DATABASE_PASSWORD,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Tour, Waypoint, TourSlot],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
