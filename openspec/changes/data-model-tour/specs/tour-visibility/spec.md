## ADDED Requirements

### Requirement: Published-only catalog
The system SHALL only expose tours with `status = 'published'` to unauthenticated users and users with role `tourist`.

#### Scenario: Draft tour excluded from public catalog
- **GIVEN** a tour has `status = 'draft'`
- **WHEN** a tourist requests `GET /api/v1/tours`
- **THEN** the system SHALL NOT include the draft tour in the response

#### Scenario: Archived tour excluded from public catalog
- **GIVEN** a tour has `status = 'archived'`
- **WHEN** a tourist requests `GET /api/v1/tours`
- **THEN** the system SHALL NOT include the archived tour in the response

#### Scenario: Admin can see all statuses
- **GIVEN** a user has role `admin` and is authenticated
- **WHEN** the admin requests `GET /api/v1/admin/tours`
- **THEN** the system SHALL return tours with all statuses (`draft`, `published`, `archived`)

### Requirement: Status transition rules
The system SHALL enforce valid status transitions: `draft → published`, `published → archived`. Reverting from `archived` to `draft` or `published` SHALL NOT be allowed.

#### Scenario: Invalid status transition
- **GIVEN** a tour has `status = 'archived'`
- **WHEN** an admin attempts to set `status = 'published'`
- **THEN** the system SHALL return HTTP 422 Unprocessable Entity
- **AND** the `status` SHALL remain `'archived'`

#### Scenario: Valid draft to published transition
- **GIVEN** a tour has `status = 'draft'` and at least 1 image
- **WHEN** an admin sets `status = 'published'`
- **THEN** the system SHALL update the status to `'published'`
- **AND** SHALL return HTTP 200 with the updated tour
