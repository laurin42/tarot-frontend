# Tarot App Frontend

A React Native/Expo mobile application for tarot card readings and interpretations.

## Commit History & Project Structure
Initially, this project was created as a single repository containing both the backend and frontend. Later, it was split into two separate repositories to improve the separation of concerns between the frontend and backend.

Unfortunately, during this restructuring, some commits were lost. The current commit history reflects the changes made after the split, with the original commit messages and order being preserved as much as possible.

Despite the lost commits, the codebase remains stable and continues to meet the project's initial objectives.

Contributing
Feel free to open issues or pull requests if you'd like to contribute. Please follow the coding standards and ensure clear, descriptive commit messages.

## Features

- Daily tarot card readings
- Three-card spread readings
- User authentication
- Card interpretations
- Responsive design
- Offline support

## Tech Stack

- React Native/Expo
- TypeScript
- React Navigation
- Reanimated 2

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npx expo start
```

## Building for Production

```bash
npx expo prebuild
npx expo run:android  # for Android
npx expo run:ios     # for iOS
```

## Project Structure

- `/app` - Main application screens and navigation
- `/components` - Reusable UI components
- `/services` - API and third-party service integrations
- `/utils` - Helper functions and utilities
- `/assets` - Images, fonts, and other static assets
- `/context` - React Context providers
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions
