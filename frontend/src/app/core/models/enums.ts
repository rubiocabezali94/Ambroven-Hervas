export enum UserRole {
  TOURIST = 'tourist',
  ADMIN = 'admin',
}

export enum TourCategory {
  CULTURAL = 'cultural',
  NATURE = 'nature',
  GASTRONOMY = 'gastronomy',
  ADVENTURE = 'adventure',
  URBAN = 'urban',
}

export enum TourStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}
