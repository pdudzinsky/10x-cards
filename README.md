# 10x-cards

AI-powered flashcard learning application that accelerates knowledge retention through intelligent spaced repetition.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

10x-cards is a web application that supports effective learning through the spaced repetition method by enabling rapid creation of educational flashcards. The core value proposition is significantly reducing the time needed to prepare high-quality flashcards through AI generation, while maintaining full user control over quality through a simple and fast verification process.

**Key Features:**

- **User Account System**: Email and password-based authentication with password reset functionality
- **Deck Management**: Create, rename, and delete flashcard decks with organized views
- **Manual Flashcard Creation**: Add individual flashcards with front (up to 200 characters) and back (up to 500 characters)
- **AI-Powered Generation**: Automatically generate 5, 10, or 20 flashcards from pasted text (up to 10,000 characters, Polish language only)
  - Daily limit: 5 generations per user
  - Smart verification workflow for AI-generated cards
- **Spaced Repetition System**: Built-in SM-2 algorithm for optimized review scheduling
- **Review Sessions**: Rate flashcards on a 0-5 scale to adjust future review intervals

## Tech Stack

### Frontend

- **Astro 5** - Fast, modern static site generator with minimal JavaScript
- **React 19** - Interactive UI components
- **TypeScript 5** - Static typing and enhanced IDE support
- **Tailwind CSS 4** - Utility-first CSS framework for rapid styling
- **Shadcn/ui** - Accessible, customizable React component library built on Radix UI
- **Lucide React** - Icon library

### Backend

- **Supabase** - Comprehensive backend-as-a-service solution
  - PostgreSQL database
  - Built-in user authentication
  - Open-source, self-hostable solution
  - Multi-language SDK support

### AI Integration

- **Openrouter.ai** - Unified access to multiple AI models
  - Access to OpenAI, Anthropic, Google, and other providers
  - Financial limit controls on API keys
  - Cost-effective model selection

### CI/CD & Hosting

- **GitHub Actions** - Continuous integration and deployment pipelines
- **DigitalOcean** - Application hosting via Docker containers

### Development Tools

- **ESLint** - Code linting and quality checks
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files

### Testing

- **Vitest** - Fast unit test runner with native TypeScript and ESM support
- **@testing-library/react** - React component testing with user-centric queries
- **@testing-library/user-event** - Realistic user interaction simulation
- **MSW (Mock Service Worker)** - API mocking at the network level
- **Playwright** - Cross-browser E2E testing and API testing
- **axe-playwright** - Automated accessibility testing (WCAG 2.1)
- **Artillery** - Load testing for API endpoints (Node.js-native)
- **Lighthouse CI** - Frontend performance monitoring and Core Web Vitals

## Getting Started Locally

### Prerequisites

- **Node.js** version `22.14.0` (specified in `.nvmrc`)
  - We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions
  - Run `nvm use` in the project directory to automatically switch to the correct version

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/10x-cards.git
cd 10x-cards
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Openrouter.ai Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:4321` (default Astro port).

## Available Scripts

| Script             | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the development server with hot reload |
| `npm run build`    | Build the application for production         |
| `npm run preview`  | Preview the production build locally         |
| `npm run astro`    | Run Astro CLI commands                       |
| `npm run lint`     | Check code for linting errors                |
| `npm run lint:fix` | Automatically fix linting errors             |
| `npm run format`   | Format code with Prettier                    |

### Pre-commit Hooks

The project uses Husky and lint-staged to run automatic checks before commits:

- TypeScript, TSX, and Astro files are linted and auto-fixed
- JSON, CSS, and Markdown files are formatted with Prettier

## Project Scope

### MVP Features (In Scope)

- Web application only (Polish language)
- Basic user account system (email + password)
- Deck and flashcard management
- Manual flashcard creation
- AI-powered flashcard generation (5 generations/day limit)
- Flashcard verification workflow (accept, edit, reject)
- Built-in SM-2 spaced repetition algorithm
- Review sessions with 0-5 rating scale
- Product analytics and technical logging

### Explicitly Out of Scope for MVP

- Mobile applications (iOS/Android)
- File imports (PDF, DOCX, etc.)
- Deck sharing between users
- External platform integrations
- Advanced repetition algorithms (SuperMemo, Anki)
- Duplicate detection
- AI compliance features
- Multi-language support (only Polish in MVP)

### Success Metrics

1. **AI Flashcard Acceptance Rate**: ≥75% of generated flashcards are accepted or edited and saved
2. **AI Contribution to Flashcard Creation**: ≥75% of flashcards created by active users over 7 days come from AI generation

## Project Status

**Current Status**: 🚧 MVP Development

This project is in active development. The MVP scope focuses on core functionality for Polish-language flashcard generation and spaced repetition learning.

### Recent Activity

- Initial project setup with Astro, React, and Tailwind
- Tech stack documentation completed
- Product Requirements Document (PRD) finalized

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: This is an educational tool designed to accelerate learning through spaced repetition. The AI generation feature is limited to ensure quality and manage costs during the MVP phase.
