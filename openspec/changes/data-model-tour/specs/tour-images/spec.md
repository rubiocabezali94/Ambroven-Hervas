## ADDED Requirements

### Requirement: Minimum one image required to publish
The system SHALL require at least one image URL in the `images` array before a tour can transition from `draft` to `published`.

#### Scenario: Publish attempt with no images
- **GIVEN** a tour has `status = 'draft'` and `images = []`
- **WHEN** an admin attempts to set `status = 'published'`
- **THEN** the system SHALL return HTTP 422 Unprocessable Entity
- **AND** the response SHALL include message "At least one image is required to publish a tour"
- **AND** the `status` SHALL remain `'draft'`

#### Scenario: Publish succeeds with images
- **GIVEN** a tour has `status = 'draft'` and `images` contains at least 1 URL
- **WHEN** an admin sets `status = 'published'`
- **THEN** the system SHALL update status to `'published'`

### Requirement: Image array non-empty on creation via API
The system SHALL reject tour creation requests that include an empty `images` array when `status` is set to `published` directly.

#### Scenario: Creation with empty images and published status
- **GIVEN** a POST request to `POST /api/v1/admin/tours` includes `{ "status": "published", "images": [] }`
- **WHEN** the endpoint processes the request
- **THEN** the system SHALL return HTTP 400 Bad Request
- **AND** SHALL identify the `images` field as invalid

#### Scenario: Creation with draft status allows empty images
- **GIVEN** a POST request to `POST /api/v1/admin/tours` includes `{ "status": "draft", "images": [] }`
- **WHEN** the endpoint processes the request
- **THEN** the system SHALL create the tour with `status = 'draft'`
