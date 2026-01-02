# POS App

A modern Point of Sale application built with React Native, Expo SDK 54, Firebase, and styled with NativeWind (Tailwind CSS for React Native).

## Tech Stack

- **React Native** with **Expo SDK 54**
- **Firebase** for backend services (Authentication, Firestore)
- **NativeWind** (Tailwind CSS for React Native)
- **TypeScript** for type safety

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Update `firebaseConfig.ts` with your Firebase project credentials
   - Get your config from Firebase Console > Project Settings

### Running the App

Start the development server:
```bash
npm start
```

Run on specific platforms:
```bash
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## Project Structure

```
pos-app/
├── App.tsx              # Main application component
├── firebaseConfig.ts    # Firebase configuration
├── global.css           # Global Tailwind styles
├── tailwind.config.js   # Tailwind configuration
├── babel.config.js      # Babel configuration
├── tsconfig.json        # TypeScript configuration
├── app.json            # Expo configuration
└── assets/             # Images and static assets
```

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Copy your Firebase config to `firebaseConfig.ts`

## Styling with NativeWind

This project uses NativeWind for styling. Use Tailwind CSS classes directly in your components:

```tsx
<Text className="text-2xl font-bold text-blue-600">Hello World</Text>
```

## License

MIT
