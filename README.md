# Tarot App Frontend

A React Native/Expo mobile application for tarot card readings and interpretations.

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
- Tailwind CSS
- Firebase Authentication
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
