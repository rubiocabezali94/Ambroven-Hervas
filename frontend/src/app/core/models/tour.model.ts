import { TourCategory, TourStatus } from './enums';

export interface Waypoint {
  id: string;
  tour_id: string;
  lat: number;
  lng: number;
  order: number;
  label: string;
}

export interface Tour {
  id: string;
  title: string;
  description: string;
  short_description: string;
  category: TourCategory;
  price_per_person: number;
  duration_hours: number;
  max_capacity: number;
  language: string[];
  images: string[];
  status: TourStatus;
  meeting_point: string;
  meeting_point_lat: number;
  meeting_point_lng: number;
  operator_id: string;
  waypoints: Waypoint[];
  created_at: string;
  updated_at: string;
}
