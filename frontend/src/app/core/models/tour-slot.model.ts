export interface TourSlot {
  id: string;
  tour_id: string;
  start_datetime: string;
  end_datetime: string;
  available_spots: number;
  blocked: boolean;
  blocked_reason: string | null;
  created_at: string;
  updated_at: string;
}
