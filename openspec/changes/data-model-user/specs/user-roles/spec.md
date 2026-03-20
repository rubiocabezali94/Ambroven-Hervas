## ADDED Requirements

### Requirement: Role assignment on creation
The system SHALL assign the `tourist` role to every new user by default unless explicitly set otherwise.

#### Scenario: Default role on local registration
- **GIVEN** a new user registers with email and password
- **WHEN** the user record is created
- **THEN** the user role SHALL be `tourist`

#### Scenario: Default role on OAuth registration
- **GIVEN** a new user registers via Google OAuth
- **WHEN** the user record is created
- **THEN** the user role SHALL be `tourist`

### Requirement: Role-based access control
The system SHALL enforce distinct permissions for each role: `tourist` and `admin`.

#### Scenario: Tourist cannot access admin routes
- **GIVEN** a user with role `tourist` is authenticated
- **WHEN** a request is made to `POST /api/v1/tours`
- **THEN** the system SHALL return HTTP 403 Forbidden

#### Scenario: Admin has full access
- **GIVEN** a user with role `admin` is authenticated
- **WHEN** a request is made to any `/api/v1/admin/*` endpoint
- **THEN** the system SHALL process the request normally

### Requirement: Role change restricted to admin
The system SHALL only allow users with role `admin` to change another user's role.

#### Scenario: Tourist attempts role change
- **GIVEN** a user with role `tourist` is authenticated
- **WHEN** a request is made to `PATCH /api/v1/admin/users/:id/role`
- **THEN** the system SHALL return HTTP 403 Forbidden
