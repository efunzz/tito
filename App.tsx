import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import CustomTabBar from './components/CustomTabBar';

import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignupScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';

import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

// Import Context Providers
import { ShiftsProvider } from './contexts/ShiftsContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Import AddShiftModal
import AddShiftModal from './components/AddShiftModal';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Your existing tab navigator (when user IS logged in)
function RootTabs() {
  const [addShiftModalVisible, setAddShiftModalVisible] = React.useState(false);

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            onAddShift={() => setAddShiftModalVisible(true)}
          />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Details" 
        component={DetailsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "stats-chart" : "stats-chart-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      </Tab.Navigator>

      {/* Add Shift Modal */}
      <AddShiftModal
        visible={addShiftModalVisible}
        onClose={() => setAddShiftModalVisible(false)}
      />
    </>
  );
}

export default function App() {
  // ✨ NOW USING REAL AUTH STATE FROM SUPABASE
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show nothing while checking auth (optional: add a loading screen)
  if (loading) {
    return null;
  }

  // ✨ session = logged in, no session = show login
  const isLoggedIn = !!session;

  return (
    <ShiftsProvider>
      <SettingsProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
              // Auth Stack - shown when NOT logged in
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
              </>
            ) : (
              // Main App - shown when logged in (wrapped with Context)
              <>
                <Stack.Screen name="MainApp" component={RootTabs} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SettingsProvider>
    </ShiftsProvider>
  );
}