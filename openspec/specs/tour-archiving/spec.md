## ADDED Requirements

### Requirement: Archive preserves existing bookings
The system SHALL allow archiving a tour that has active bookings. Existing confirmed bookings SHALL remain valid after archiving.

#### Scenario: Archive tour with active bookings
- **GIVEN** a tour has `status = 'published'` with 3 bookings in status `'confirmed'`
- **WHEN** an admin sets `status = 'archived'`
- **THEN** the system SHALL update the tour status to `'archived'`
- **AND** the 3 existing bookings SHALL remain in status `'confirmed'`
- **AND** SHALL NOT be cancelled automatically

### Requirement: Archived tour blocks new bookings
The system SHALL prevent new bookings from being created for a tour with `status = 'archived'`.

#### Scenario: Booking attempt on archived tour
- **GIVEN** a tour has `status = 'archived'`
- **WHEN** a tourist attempts to create a booking for that tour
- **THEN** the system SHALL return HTTP 409 Conflict
- **AND** the response SHALL include message "This tour is no longer available for booking"

### Requirement: Admin warning on archive with active bookings
The system SHALL inform the admin of the number of active bookings before confirming an archive action (UI responsibility — the API SHALL still process the archive without requiring confirmation).

#### Scenario: Archive response includes active booking count
- **GIVEN** a tour has `status = 'published'` with 5 confirmed bookings
- **WHEN** an admin sends `PATCH /api/v1/admin/tours/:id` with `{ "status": "archived" }`
- **THEN** the system SHALL return HTTP 200
- **AND** the response body SHALL include `{ "archivedWithActiveBookings": 5 }`
