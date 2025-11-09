# FiTrack Vue 3 Application

This is the Vue 3 + TypeScript migration of FiTrack, a fitness workout tracking web application.

## Project Status

🚧 **Work in Progress** - Foundation completed, component migration in progress

### Completed ✅
- Project setup (Vue 3 + Vite + TypeScript)
- Dependencies installed (Vue Router, Pinia, VueUse)
- Testing infrastructure (Vitest, Vue Test Utils, Happy DOM)
- Type definitions (`src/types/index.ts`)
- Router configuration (`src/router/index.ts`)
- Workout store with tests (`src/stores/workout.ts`)
- Directory structure
- 8 passing tests for workout store

### Next Steps 📋
1. Copy exercise database from parent directory
2. Create exercise store
3. Migrate CSS styles
4. Build Vue components (ExerciseCard, SetRow, etc.)
5. Complete all views
6. Full test coverage
7. Production deployment

## Quick Start

```bash
# Development
npm run dev              # Start dev server at http://localhost:5173

# Testing
npm test                 # Run tests (8 tests currently passing)
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI

# Build
npm run build            # Build for production
npm run preview          # Preview production build
```

## Architecture

- **Vue 3.5** with Composition API
- **TypeScript** with strict mode
- **Pinia** for state management (reactive, type-safe)
- **Vue Router** with hash mode
- **VueUse** for composition utilities
- **Vite** for fast builds
- **Vitest** for testing

## Migration Guide

See `../MIGRATION_GUIDE.md` for complete step-by-step instructions.

## Resources

- [Migration Plan](../VUE3_MIGRATION_PLAN.md)
- [Proposal Summary](../PROPOSAL_SUMMARY.md)
- [Vue 3 Docs](https://vuejs.org/)
