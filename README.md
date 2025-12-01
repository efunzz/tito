# Tito - Time Tracking for Shift Workers

A simple, elegant mobile app designed specifically for shift workers to track their hours, calculate earnings, and reach weekly goals.

## Overview

Tito is a React Native mobile application that solves a real problem I faced during my internships and part-time work: keeping track of work hours and earnings without the hassle of manual spreadsheets or forgetting when I clocked in.

Instead of scrambling at the end of the month to remember every shift, Tito lets you log your work in real-time, see exactly how much you've earned so far, and track progress toward your weekly hour goals—all in a clean, minimal interface.

## Tech Stack

- **React Native** - Cross-platform mobile development framework
- **Expo** - Development platform and tooling for React Native apps
- **TypeScript** - Type-safe JavaScript for better code quality
- **Supabase** - Backend-as-a-Service for authentication and database
  - PostgreSQL database for storing shift data
  - Google OAuth 2.0 for secure sign-in
- **React Navigation** - Navigation library for screen routing
- **AsyncStorage** - Local data persistence
- **Expo Application Services (EAS)** - Cloud build and deployment
- **Model Context Protocol (MCP)** - Integration for AI-assisted development

## Features

- **Easy Shift Logging** - Quickly add shifts with start/end times, hourly rate, and notes
- **Automatic Earnings Calculator** - Real-time calculation of total earnings based on logged hours
- **Weekly Goals** - Set target hours and visualize progress throughout the week
- **Google Sign-In** - Secure, one-tap authentication
- **Cloud Sync** - Access your data across all devices seamlessly
- **Export Data** - Download shift history and earnings reports
- **Privacy-First** - All data encrypted and never sold to third parties
- **Clean Design** - Minimal interface with warm beige color palette inspired by Cardy Pay

## The Process / How It Was Built

This app was born from personal frustration. During my internship and part-time work, I had to manually key in my hours at the end of every month. I never knew how much I'd earned until payday, couldn't track whether I was hitting my weekly goals, and often forgot exactly what time I'd arrived at the office each day.

I started by designing a simple interface that prioritized speed—logging a shift should take seconds, not minutes. I chose React Native with Expo to build for both Android and iOS from a single codebase, and Supabase to handle authentication and data storage without managing backend infrastructure.

The color palette was carefully chosen—a warm beige background (#E8E5E0) with white cards and a bright red accent (#FF5555)—to create a friendly, approachable feel rather than the sterile look of traditional time-tracking tools.

Throughout development, I integrated the Model Context Protocol (MCP) to work with Claude AI, which helped me understand best practices and debug issues faster. The app uses AsyncStorage for local caching and Supabase for cloud sync, ensuring your data is always accessible even offline.

## What I Learned / Key Takeaways

Building Tito taught me several valuable skills:

- **Model Context Protocol (MCP)**: Integrated MCP to enable AI-assisted development, helping me write better code and solve problems faster
- **AsyncStorage**: Learned how to implement local data persistence in React Native for offline functionality
- **Supabase Integration**: First time setting up a full backend with authentication, database, and real-time sync
- **Environment Variables in Production**: Discovered the hard way that `.env` files don't work in production builds—had to configure EAS secrets properly
- **Design Systems**: Created a consistent theme system with centralized colors, typography, and spacing values
- **User Privacy**: Implemented proper data handling and privacy policies for Play Store compliance

## Future Improvements

- **Code Optimization**: Refactor components following React Native best practices and performance patterns
- **Micro-Interactions**: Add smooth animations and transitions to make the UI feel more dynamic and polished
- **Better Analytics**: Add charts and visualizations to show earnings trends over time
- **Multiple Jobs**: Support tracking shifts for multiple jobs with different hourly rates
- **Dark Mode**: Implement a dark theme option for night shift workers
- **Notifications**: Remind users to log their shifts at the end of the day
- **Recurring Shifts**: Quick-add feature for regular weekly schedules

## Demo

> 🎥 Video demo and screenshots coming soon

### Download

Currently in closed beta testing on Google Play Store.

## Contact

**Developer**: Irfan Sofyan
**Email**: madebyarv@gmail.com
**Package**: com.efunzz.tito

---

Built with ❤️ for shift workers everywhere.
