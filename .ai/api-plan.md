# REST API Plan

## 1. Resources

1. **Profile**
   - Backed by: `public.profiles`
   - Purpose: per-user data including AI generation limits

2. **Deck**
   - Backed by: `public.decks`
   - Purpose: grouping cards, entry point for reviews and AI generation

3. **Card**
   - Backed by: `public.cards`
   - Purpose: flashcards with SM-2 scheduling metadata

4. **Review Session (virtual resource)**
   - Not persisted as a table
   - Purpose: orchestrates SM-2 review flow over cards

5. **AI Generation (action resource)**
   - Not persisted as a table
   - Purpose: controlled creation of unverified cards with daily limits

## 2. Endpoints

### 2.1 Profiles

#### GET /v1/profile

- **Description**: Fetch current user profile including AI limits
- **Auth**: Required
- **Response 200**:
  ```json
  {
    "id": "uuid",
    "created_at": "timestamptz",
    "ai_generation_date": "YYYY-MM-DD",
    "ai_generation_count": 3
  }
  ```
- **Errors**:
  - 401 Unauthorized

### 2.2 Decks

#### GET /v1/decks

- **Description**: List user decks sorted by last usage
- **Auth**: Required
- **Query params**:
  - `limit` (default 20, max 100)
  - `offset` (default 0)
- **Response 200**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "name": "Deck name",
        "last_used_at": "timestamptz",
        "due_cards_count": 12
      }
    ],
    "limit": 20,
    "offset": 0,
    "total": 3
  }
  ```
- **Errors**:
  - 401 Unauthorized

---

#### POST /v1/decks

- **Description**: Create new deck
- **Auth**: Required
- **Request**:
  ```json
  {
    "name": "My Deck"
  }
  ```
- **Response 201**:
  ```json
  {
    "id": "uuid",
    "name": "My Deck",
    "created_at": "timestamptz",
    "last_used_at": "timestamptz"
  }
  ```
- **Errors**:
  - 400 Validation error
  - 401 Unauthorized

---

#### PATCH /v1/decks/{deckId}

- **Description**: Rename deck
- **Auth**: Required
- **Request**:
  ```json
  {
    "name": "New name"
  }
  ```
- **Response 200**: updated deck
- **Errors**:
  - 400 Validation error
  - 401 Unauthorized
  - 404 Not found

---

#### DELETE /v1/decks/{deckId}

- **Description**: Delete deck with cascade cards deletion
- **Auth**: Required
- **Response 204**
- **Errors**:
  - 401 Unauthorized
  - 404 Not found

### 2.3 Cards

#### GET /v1/decks/{deckId}/cards

- **Description**: List cards in a deck
- **Auth**: Required
- **Query params**:
  - `status` = `all` | `unverified` | `accepted`
- **Response 200**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "front": "Question",
        "back": "Answer",
        "status": "accepted",
        "next_review_at": "timestamptz"
      }
    ]
  }
  ```
- **Errors**:
  - 401 Unauthorized
  - 404 Deck not found

---

#### POST /v1/decks/{deckId}/cards

- **Description**: Manually create card (accepted immediately)
- **Auth**: Required
- **Request**:
  ```json
  {
    "front": "Question",
    "back": "Answer"
  }
  ```
- **Response 201**:
  ```json
  {
    "id": "uuid",
    "status": "accepted",
    "next_review_at": "timestamptz"
  }
  ```
- **Errors**:
  - 400 Validation error
  - 401 Unauthorized
  - 404 Deck not found

---

#### PATCH /v1/cards/{cardId}

- **Description**: Edit card (always results in status=accepted)
- **Auth**: Required
- **Request**:
  ```json
  {
    "front": "Updated front",
    "back": "Updated back"
  }
  ```
- **Response 200**: updated card
- **Errors**:
  - 400 Validation error
  - 401 Unauthorized
  - 404 Not found

---

#### DELETE /v1/cards/{cardId}

- **Description**: Permanently delete accepted card
- **Auth**: Required
- **Response 204**
- **Errors**:
  - 401 Unauthorized
  - 404 Not found
  - 409 Card not deletable (if unverified)

### 2.4 AI Generation

#### POST /v1/decks/{deckId}/ai-generate

- **Description**: Generate unverified cards using AI
- **Auth**: Required
- **Request**:
  ```json
  {
    "source_text": "long polish text",
    "cards_count": 10
  }
  ```
- **Response 201**:
  ```json
  {
    "generated": 10,
    "remaining_daily_limit": 2
  }
  ```
- **Errors**:
  - 400 Validation error (text too long, invalid count)
  - 401 Unauthorized
  - 403 Daily limit exceeded
  - 404 Deck not found
  - 502 AI generation failed

### 2.5 Verification (Bulk)

#### POST /v1/decks/{deckId}/cards/accept-all

- **Description**: Accept all unverified cards in deck
- **Auth**: Required
- **Response 200**:
  ```json
  {
    "accepted": 15
  }
  ```
- **Errors**:
  - 401 Unauthorized
  - 404 Deck not found

---

#### DELETE /v1/decks/{deckId}/cards/unverified

- **Description**: Reject (delete) all unverified cards
- **Auth**: Required
- **Response 200**:
  ```json
  {
    "deleted": 8
  }
  ```
- **Errors**:
  - 401 Unauthorized
  - 404 Deck not found

### 2.6 Reviews

#### POST /v1/decks/{deckId}/reviews/start

- **Description**: Start review session and update last_used_at
- **Auth**: Required
- **Response 200**:
  ```json
  {
    "cards": [
      {
        "id": "uuid",
        "front": "Question",
        "back": "Answer"
      }
    ]
  }
  ```
- **Errors**:
  - 401 Unauthorized
  - 404 Deck not found

---

#### POST /v1/reviews/{cardId}/answer

- **Description**: Submit SM-2 grade for a card
- **Auth**: Required
- **Request**:
  ```json
  {
    "grade": 4
  }
  ```
- **Response 200**:
  ```json
  {
    "next_review_at": "timestamptz",
    "interval_days": 6,
    "ease_factor": 2.46
  }
  ```
- **Errors**:
  - 400 Invalid grade (must be 0-5)
  - 401 Unauthorized
  - 404 Card not found

## 3. Authentication and Authorization

- Authentication via Supabase Auth (JWT-based)
- Authorization: Bearer `<access_token>` required for all endpoints
- Authorization enforced by:
  - Supabase Row Level Security policies
  - API-level ownership checks only for compound operations
- No anonymous access

## 4. Validation and Business Logic

### Validation Rules

- **Deck name**: 1-100 characters
- **Card front**: non-empty, max 200 characters
- **Card back**: non-empty, max 500 characters
- **AI source text**: max 10,000 characters
- **AI cards_count**: one of [5, 10, 20]
- **SM-2 grade**: integer 0-5

### Business Logic Handling

- AI generation limits enforced atomically using `profiles.ai_generation_date` and `ai_generation_count`
- Timezone-sensitive logic uses `Europe/Warsaw`
- AI generation is transactional: on failure, no cards are persisted
- Accepting a card initializes SM-2 scheduling (`next_review_at` = `now()`)
- Review grading updates SM-2 fields and schedules next review
- `decks.last_used_at` updated when review session starts
- All destructive operations are irreversible by design
