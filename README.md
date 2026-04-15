# PDT Health App 🚀

A premium, AI-powered health and fitness tracking application built with **React Native** and **Expo SDK 51**. This app features a seamless authentication flow, real-time health metrics, and a modern, high-performance UI.

## 📱 Features

- **Seamless Authentication**: Secure Phone OTP login using Firebase with an invisible, non-intrusive reCAPTCHA flow.
- **Real-time Dashboard**: Dynamic health tracking with AI-powered insights.
- **Premium UI/UX**: Built with NativeWind (Tailwind CSS) and smooth Reanimated animations.
- **Persistent Sessions**: Automatic session management using `@react-native-async-storage/async-storage`.
- **Platform Optimized**: Designed for high performance on both Android and iOS.

---

## 🛠️ Tech Stack

- **Framework**: [Expo SDK 51](https://expo.dev/)
- **Language**: JavaScript (JSX)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend**: [Firebase JS SDK](https://firebase.google.com/docs/web/setup)
- **Icons**: [Expo Vector Icons](https://docs.expo.dev/guides/icons/)

---

## 🚀 Getting Started

Follow these steps to set up the project locally:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Firebase Configuration
Update the Firebase configuration in `src/data/firebase/config.js` with your project's credentials.

### 4. Running the App
The project is optimized for Windows development and uses `localhost` by default to avoid network adapter conflicts.
```bash
npm start
```
- Press **'a'** to open on an Android emulator.
- Press **'i'** to open on an iOS simulator.

---

## 🔐 Authentication & Development

We use a custom **Invisible reCAPTCHA** implementation to maintain a pure OTP-based user experience.

### Development Bypass
For smooth development, the app is configured to bypass reCAPTCHA when using **Testing Numbers**.
1. Add fictional phone numbers in your **Firebase Console** (Auth > Sign-in method > Phone > Phone numbers for testing).
2. Set a fixed 6-digit OTP for these numbers.
3. Use these numbers in the app for an instant, bypass-verified login experience.

---

## 📂 Project Structure

```text
src/
├── core/           # Utility functions and validators
├── data/           # Firebase config and data models
├── presentation/   # UI layer
│   ├── common/     # Reusable components (UI, Layout)
│   ├── screens/    # App screens (Auth, Dashboard, etc.)
│   ├── state/      # Zustand store for global state
│   └── themes/     # Design system (colors, typography)
```

---

## 🏥 Project Health
To check the project health and dependency compatibility:
```bash
npx expo-doctor
```

---

## 📄 License
Created by TDTE Project. All rights reserved.
