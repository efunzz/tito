// Load environment variables from .env file
require('dotenv').config();

module.exports = {
  expo: {
    name: "tito",
    slug: "tito",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/tito-icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.efunzz.tito",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/tito-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "com.efunzz.tito"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    // Deep linking scheme for OAuth callbacks
    scheme: "com.efunzz.tito",
    // Expo plugins
    plugins: [
      "expo-font"
    ],
    // Make environment variables available to the app
    extra: {
      eas: {
        projectId: "de5545ab-70f0-476f-9bd6-c90089be4759"
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    }
  }
};
