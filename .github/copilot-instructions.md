# FiTrack - GitHub Copilot Instructions

## Project Overview

FiTrack is a local, offline-first fitness workout tracking web application. It's a pure client-side application with no backend, using vanilla JavaScript, HTML5, and CSS3.

**Live Demo**: https://tomaszwojcikowski.github.io/fitrack/

## Architecture & Technology Stack

- **Pure vanilla JavaScript** (ES6 modules) - No frameworks or libraries
- **HTML5 & CSS3** - Responsive design with CSS Grid and Flexbox
- **LocalStorage API** - Client-side data persistence
- **Web Audio API** - Timer sound notifications
- **Vitest + Happy DOM** - Testing framework
- **GitHub Actions** - CI/CD for testing and deployment to GitHub Pages

## Project Structure

```
/
├── app.js              # Main application logic (FiTrackApp class)
├── exercises.js        # Exercise database (130+ exercises)
├── programs.js         # Workout programs database
├── index.html          # Main HTML structure
├── styles.css          # All application styles
├── components/         # UI components
│   └── syncModal.js    # Cloud sync modal component
├── services/           # Service layer
│   ├── githubDeviceAuth.js  # GitHub OAuth device flow
│   ├── gistSyncService.js   # GitHub Gist sync service
│   ├── storage.js           # Storage utilities
│   └── timer.js             # Timer utilities
├── src/                # Additional source files
└── tests/              # Test suite (Vitest)
    ├── app.test.js
    ├── exercises.test.js
    ├── programs.test.js
    ├── sync.test.js
    └── setup.js        # Test setup and mocks
```

## Development Guidelines

### Code Style

1. **No frameworks**: Use vanilla JavaScript, DOM APIs, and native features
2. **Class-based**: Main app uses ES6 classes with clear separation of concerns
3. **ES6 modules**: Use `import`/`export` syntax
4. **Minimal dependencies**: Only dev dependencies for testing
5. **Comments**: Only add comments when necessary to explain complex logic
6. **Naming**: Use descriptive camelCase for variables and methods

### Testing

- **Framework**: Vitest with Happy DOM environment
- **Performance requirement**: All tests must complete in under 10 seconds
- **Coverage**: Tests should cover main functionality in `app.js` and `exercises.js`
- **Run tests**: `npm test` (or `npm run test:watch` for development)
- **Test files**: Mirror the structure of the code being tested

**Important**: Always run tests after making changes:
```bash
npm test
```

### Data Persistence

- All user data is stored in **browser localStorage**
- Key storage items:
  - `fitrack-workout`: Current workout session
  - `fitrack-history`: Workout history
  - `fitrack-active-program`: Active program state
  - `fitrack-completed-days`: Completed workout days
  - `fitrack-github-token`: GitHub auth token (for sync)
- Always handle corrupted localStorage gracefully (try/catch with JSON.parse)
- No data is sent to external servers (privacy-first approach)

### Key Features to Preserve

1. **Exercise Database**: 130+ exercises organized by categories
2. **Workout Tracking**: Sets, reps, weights, and time tracking
3. **Rest Timer**: Animated countdown with sound notifications
4. **Workout History**: Date-organized past workouts
5. **Workout Programs**: Pre-built programs with progression tracking
6. **URL Routing**: Hash-based navigation (`#workout`, `#history`, `#programs`, `#settings`)
7. **Cloud Sync**: Optional GitHub Gist sync for backup
8. **Offline-first**: Must work without internet connection

### Build & Deployment

- **No build step required**: Pure client-side application
- **Testing**: Run via GitHub Actions on push/PR
- **Deployment**: Automatic deployment to GitHub Pages via GitHub Actions
- **Local development**: Open `index.html` directly or use a simple HTTP server:
  ```bash
  python3 -m http.server 8080
  # or
  npx http-server -p 8080
  ```

### Making Changes

1. **Run tests first**: `npm install && npm test` to understand baseline
2. **Make minimal changes**: Preserve existing functionality
3. **Test frequently**: Run `npm test` after each significant change
4. **Verify manually**: Test in a browser to ensure UI works correctly
5. **Check test duration**: Ensure tests still run in under 10 seconds
6. **Update documentation**: If changing core features, update README.md

### Common Tasks

#### Adding a New Exercise
- Edit `exercises.js` and add to the `EXERCISES` array
- Follow existing structure: `{ name, category, equipment, description }`
- Run tests to ensure database integrity

#### Modifying UI
- All styles are in `styles.css` using CSS custom properties (variables)
- Dark theme is the default and only theme
- Mobile-first, responsive design
- Test on both desktop and mobile viewports

#### Adding New Features
- Keep offline-first principle
- Maintain localStorage compatibility
- Add tests for new functionality
- Update UI state management in `updateUI()` method

#### Working with Workout Programs
- Programs are defined in `programs.js`
- Each program has weeks and days structure
- Respect existing program format when modifying

### Error Handling

- Handle localStorage quota exceeded
- Handle JSON parse errors gracefully
- Handle missing or corrupted data
- Console logging for errors (use `console.error`)
- User-friendly error messages via alerts when appropriate

### Browser Compatibility

Target modern browsers (Chrome, Firefox, Safari, Edge):
- ES6+ features are acceptable
- Use native APIs (no polyfills needed)
- LocalStorage and Web Audio API required

### Security & Privacy

- **No external data transmission** (except optional GitHub sync)
- **No analytics or tracking**
- **User data stays local** by default
- **No secrets in code**: Use GitHub OAuth device flow for sync
- Handle GitHub tokens securely (stored in localStorage, never logged)

### Git & Version Control

- **Branch naming**: Feature branches like `feature/description` or `fix/issue`
- **Commits**: Clear, descriptive commit messages
- **Testing**: All tests must pass before merging
- **No committed secrets**: Never commit tokens or credentials

## Troubleshooting

### Tests Failing
1. Ensure `npm install` was run
2. Check if changes broke existing functionality
3. Review test output for specific failures
4. Verify localStorage mocking in tests

### UI Issues
1. Check browser console for JavaScript errors
2. Verify CSS custom properties are defined
3. Test responsive design at different viewports
4. Clear localStorage if seeing stale data: `localStorage.clear()`

### Deployment Issues
1. Check GitHub Actions workflow status
2. Ensure all tests pass in CI
3. Verify GitHub Pages is enabled in repository settings

## Resources

- [Project README](../README.md)
- [Test Suite Documentation](../tests/README.md)
- [Live Demo](https://tomaszwojcikowski.github.io/fitrack/)

## Questions?

If you're unsure about architectural decisions or best practices for this project, refer to existing code patterns or ask for clarification before making significant changes.
