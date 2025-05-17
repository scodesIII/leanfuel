# LeanFuel

A React Native application built with Expo, featuring a counter functionality and UI components from Gluestack UI.

## Features

- Counter with increment and decrement functionality
- State management with Zustand
- UI components from Gluestack UI
- Styling with TailwindCSS/NativeWind

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- pnpm package manager
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm start
```

### Running on Different Platforms

```bash
# iOS
pnpm ios

# Android
pnpm android

# Web
pnpm web
```

## Testing

The project uses Jest and React Native Testing Library for testing components.

### Running Tests

To run all tests:

```bash
npx jest
```

To run a specific test file:

```bash
npx jest app/__tests__/index.test.tsx
```

### Test Coverage

To generate test coverage report:

```bash
npx jest --coverage
```

## Project Structure

```
.
├── app                    # App routes and screens
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Home screen
├── assets                 # Static assets
├── components             # UI components
│   └── ui                 # Gluestack UI components
├── store.ts               # Zustand store
└── tailwind.config.js     # TailwindCSS configuration
```

## State Management

This project uses Zustand for state management. The store is configured in `store.ts` and includes:

- A counter state with increment, decrement, and reset actions
- Persistence with AsyncStorage
- Redux DevTools integration for debugging

## Styling

The project uses TailwindCSS via NativeWind for styling components with utility classes.