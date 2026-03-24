## ADDED Requirements

### Requirement: Email uniqueness
The system SHALL enforce unique email addresses across all users regardless of registration method.

#### Scenario: Duplicate email on local registration
- **GIVEN** a user with email `test@example.com` already exists
- **WHEN** a new registration request is submitted with email `test@example.com`
- **THEN** the system SHALL return HTTP 409 Conflict
- **AND** the system SHALL NOT create a duplicate user record

#### Scenario: Duplicate email on OAuth registration
- **GIVEN** a local user with email `test@example.com` already exists
- **WHEN** a Google OAuth login is attempted with the same email
- **THEN** the system SHALL return HTTP 409 Conflict with message "Email already registered with a different method"
- **AND** the system SHALL NOT create a second user record

### Requirement: Google OAuth user creation
The system SHALL create a local user record when Firebase authentication succeeds for a new user.

#### Scenario: First-time Google OAuth login
- **GIVEN** a user authenticates via Google OAuth for the first time
- **WHEN** Firebase authentication succeeds and no user with that email exists
- **THEN** the system SHALL create a User record with `firebase_uid` set
- **AND** `password_hash` SHALL be null
- **AND** `role` SHALL be set to `tourist` by default

#### Scenario: Returning Google OAuth user
- **GIVEN** a user with `firebase_uid = 'abc123'` already exists
- **WHEN** Firebase authentication succeeds for that same uid
- **THEN** the system SHALL NOT create a duplicate user record
- **AND** SHALL return the existing user

### Requirement: Local registration fields
The system SHALL require `email`, `password` and `name` to create a local user account.

#### Scenario: Missing required field
- **GIVEN** a registration request is submitted without the `name` field
- **WHEN** the registration endpoint is called
- **THEN** the system SHALL return HTTP 400 Bad Request
- **AND** the response SHALL identify which field is missing
