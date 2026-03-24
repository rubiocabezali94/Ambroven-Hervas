## ADDED Requirements

### Requirement: Authenticated profile read
The system SHALL allow any authenticated user to retrieve their own profile.

#### Scenario: Successful profile fetch
- **GIVEN** a user is authenticated with a valid JWT
- **WHEN** `GET /api/v1/users/me` is called
- **THEN** the system SHALL return the user's `id`, `email`, `name`, `role`, `avatar_url` and `preferred_language`
- **AND** `password_hash` SHALL NOT be included in the response

#### Scenario: Unauthenticated profile fetch
- **GIVEN** no Authorization header is present
- **WHEN** `GET /api/v1/users/me` is called
- **THEN** the system SHALL return HTTP 401 Unauthorized

### Requirement: Profile update
The system SHALL allow authenticated users to update their `name`, `avatar_url` and `preferred_language`.

#### Scenario: Successful profile update
- **GIVEN** a user is authenticated
- **WHEN** `PATCH /api/v1/users/me` is called with `{ "name": "Nuevo Nombre" }`
- **THEN** the system SHALL update the `name` field
- **AND** SHALL return the updated user object
- **AND** `updated_at` SHALL reflect the current timestamp

#### Scenario: Email cannot be updated via profile endpoint
- **GIVEN** a user is authenticated
- **WHEN** `PATCH /api/v1/users/me` is called with `{ "email": "otro@example.com" }`
- **THEN** the system SHALL ignore the `email` field
- **AND** SHALL NOT change the user's email

### Requirement: Preferred language validation
The system SHALL only accept `es`, `en`, `fr` or `pt` as valid values for `preferred_language`.

#### Scenario: Invalid language code
- **GIVEN** a user is authenticated
- **WHEN** `PATCH /api/v1/users/me` is called with `{ "preferred_language": "zz" }`
- **THEN** the system SHALL return HTTP 400 Bad Request
- **AND** the `preferred_language` SHALL NOT be updated
