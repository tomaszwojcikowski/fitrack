# FiTrack - Fitness Workout Tracker

A local, offline-first fitness workout tracking web application with no backend required. Track your workouts, exercises, sets, reps, weights, and rest times with a clean, mobile-optimized interface.

🌐 **Live Demo**: [https://tomaszwojcikowski.github.io/fitrack/](https://tomaszwojcikowski.github.io/fitrack/)

## Features

- ✅ **130+ Exercise Database** - Comprehensive list of exercises covering all major muscle groups
- 🔍 **Smart Search** - Quickly find exercises by name, category, or equipment
- 📊 **Workout Tracking** - Log sets, reps, weights, and time for each exercise
- ⏱️ **Rest Timer** - Animated countdown timer with sound notifications
- 💾 **Local Storage** - All data saved locally in your browser
- 📱 **Mobile Optimized** - Responsive design that works perfectly on mobile devices
- 📈 **Workout History** - Review your past workouts organized by date
- 🚀 **No Backend** - Completely client-side, works offline

## Getting Started

### Quick Start

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start tracking your workouts!

### Using a Local Server (Recommended)

```bash
# Using Python 3
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080
```

Then open http://localhost:8080 in your browser.

## How to Use

### Adding Exercises

1. Type in the search box to find exercises
2. Click on an exercise from the dropdown to add it to your workout
3. The exercise will appear with an empty set ready to fill in

### Logging Sets

For each set, you can track:
- **Reps** - Number of repetitions
- **Weight** - Weight used (in kg)
- **Time** - Duration (for timed exercises)
- **Completion** - Check the circle when you complete the set

### Rest Timer

- The rest timer automatically starts when you complete a set
- Default rest time is 90 seconds
- Click "+30s" to add more time
- Click "Stop" to close the timer
- Or use the "Start Rest" button in the bottom right corner

### Viewing History

- Click the History button in the top right
- See all your past workouts organized by date
- Review exercises and sets from previous sessions

### Data Persistence

All your workout data is automatically saved to your browser's localStorage. Your data will persist even if you close the browser or refresh the page.

## Exercise Categories

- **Chest** - Bench press, push-ups, flyes, etc.
- **Back** - Deadlifts, rows, pull-ups, etc.
- **Shoulders** - Overhead press, lateral raises, etc.
- **Biceps** - Curls, hammer curls, etc.
- **Triceps** - Dips, pushdowns, extensions, etc.
- **Quads** - Squats, lunges, leg press, etc.
- **Hamstrings** - Romanian deadlifts, leg curls, etc.
- **Glutes** - Hip thrusts, glute bridges, etc.
- **Calves** - Calf raises, etc.
- **Core** - Planks, crunches, leg raises, etc.
- **Olympic Lifts** - Clean and jerk, snatch, etc.
- **Cardio** - Running, cycling, rowing, etc.

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Privacy

All your data is stored locally in your browser. No data is sent to any server. Your workout information stays completely private on your device.

## Technical Stack

- Pure HTML5, CSS3, and JavaScript
- No frameworks or dependencies
- LocalStorage API for data persistence
- Web Audio API for timer sounds
- Responsive CSS Grid and Flexbox layouts

## Development

### Running Tests

The project includes a comprehensive test suite that runs in less than 10 seconds:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

The test suite covers all major features including:
- Exercise database validation
- Workout tracking functionality
- Rest timer operations
- Data persistence
- UI state management

See [tests/README.md](tests/README.md) for more details.

## Deployment

This application is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment is handled by GitHub Actions.

To deploy your own version:
1. Fork this repository
2. Go to your repository Settings > Pages
3. Under "Build and deployment", select "GitHub Actions" as the source
4. Push changes to the main branch to trigger automatic deployment

## License

MIT License - Feel free to use and modify as needed.