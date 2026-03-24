## ADDED Requirements

### Requirement: Waypoints stored as ordered list
The system SHALL persist tour waypoints as an ordered list in a separate table, maintaining `order` as an integer starting from 1.

#### Scenario: Waypoints returned in order
- **GIVEN** a tour has 3 waypoints with `order` values 1, 2, 3
- **WHEN** `GET /api/v1/tours/:id` is called
- **THEN** the response SHALL include a `waypoints` array sorted ascending by `order`

#### Scenario: Waypoints deleted with tour
- **GIVEN** a tour has waypoints
- **WHEN** the tour is deleted
- **THEN** all associated waypoints SHALL be deleted via CASCADE
- **AND** no orphaned waypoint records SHALL remain

### Requirement: Waypoints require valid coordinates
The system SHALL validate that `lat` is between -90 and 90, and `lng` is between -180 and 180.

#### Scenario: Invalid latitude
- **GIVEN** a request to create a waypoint includes `{ "lat": 95.0, "lng": -3.7 }`
- **WHEN** the request is processed
- **THEN** the system SHALL return HTTP 400 Bad Request
- **AND** the response SHALL identify `lat` as invalid

### Requirement: Minimum one waypoint for published tours
The system SHALL require at least one waypoint before a tour can be published.

#### Scenario: Publish attempt with no waypoints
- **GIVEN** a tour has `status = 'draft'` and no associated waypoints
- **WHEN** an admin attempts to set `status = 'published'`
- **THEN** the system SHALL return HTTP 422 Unprocessable Entity
- **AND** the response SHALL include message "At least one waypoint is required to publish a tour"
