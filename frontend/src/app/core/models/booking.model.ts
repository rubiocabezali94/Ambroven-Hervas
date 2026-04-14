import { BookingStatus } from './enums';

export interface Booking {
  id: string;
  user_id: string;
  tour_id: string;
  slot_id: string;
  status: BookingStatus;
  num_persons: number;
  total_amount: number;
  cancellation_deadline: string;
  stripe_payment_intent_id: string | null;
  stripe_payment_status: string | null;
  google_calendar_event_id: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}
