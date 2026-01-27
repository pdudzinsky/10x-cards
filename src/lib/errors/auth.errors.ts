export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Niepoprawny email lub hasło", 401, "INVALID_CREDENTIALS");
  }
}

export class EmailAlreadyExistsError extends AuthError {
  constructor() {
    super("Konto z tym adresem email już istnieje", 409, "EMAIL_EXISTS");
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super("Sesja wygasła. Zaloguj się ponownie.", 401, "SESSION_EXPIRED");
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super("Link resetowania hasła jest nieważny lub wygasł", 401, "INVALID_TOKEN");
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}
