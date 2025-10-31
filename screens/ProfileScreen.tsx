import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define navigation types
type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

// Cardy Pay Color Palette
const COLORS = {
  background: '#E8E5E0',
  cardBg: '#FFFFFF',
  darkCard: '#1A1A1A',
  grayCard: '#D4D1CC',
  primary: '#FF5555',
  primaryDark: '#C0392B',
  textPrimary: '#1A1A1A',
  textSecondary: '#8E8E93',
  textLight: '#B8B8B8',
} as const;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  // State for settings
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [autoClockOut, setAutoClockOut] = useState<boolean>(false);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Profile</Text>
        
        <TouchableOpacity style={styles.editButton}>
          <Feather name="edit-2" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Profile Info Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>IS</Text>
          </View>
          <View style={styles.statusDot} />
        </View>
        
        <Text style={styles.profileName}>Irfan Sofyan</Text>
        <Text style={styles.profileEmail}>irfansofyan2001@gmail.com</Text>
        
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>$620</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Shifts</Text>
          </View>
        </View>
      </View>

      {/* Work Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work Settings</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="cash-outline" size={20} color={COLORS.textPrimary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Hourly Rate</Text>
            <Text style={styles.menuSubtitle}>$15.00 per hour</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconWrapper}>
            <Feather name="clock" size={20} color={COLORS.textPrimary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Work Hours</Text>
            <Text style={styles.menuSubtitle}>9:00 AM - 5:00 PM</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconWrapper}>
            <MaterialCommunityIcons name="calendar-month" size={20} color={COLORS.textPrimary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Monthly Goal</Text>
            <Text style={styles.menuSubtitle}>$1,000</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.menuItem}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Notifications</Text>
            <Text style={styles.menuSubtitle}>Break and shift reminders</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: COLORS.grayCard, true: COLORS.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.menuItem}>
          <View style={styles.menuIconWrapper}>
            <MaterialCommunityIcons name="clock-alert-outline" size={20} color={COLORS.textPrimary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Auto Clock Out</Text>
            <Text style={styles.menuSubtitle}>After 12 hours</Text>
          </View>
          <Switch
            value={autoClockOut}
            onValueChange={setAutoClockOut}
            trackColor={{ false: COLORS.grayCard, true: COLORS.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconWrapper}>
            <Feather name="download" size={20} color={COLORS.textPrimary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Export Data</Text>
            <Text style={styles.menuSubtitle}>Download timesheets as CSV</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* Other Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconWrapper}>
            <Feather name="help-circle" size={20} color={COLORS.textPrimary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Help & Support</Text>
            <Text style={styles.menuSubtitle}>FAQs and contact us</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconWrapper}>
            <Feather name="shield" size={20} color={COLORS.textPrimary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Privacy Policy</Text>
            <Text style={styles.menuSubtitle}>How we protect your data</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconWrapper}>
            <Feather name="info" size={20} color={COLORS.textPrimary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>About</Text>
            <Text style={styles.menuSubtitle}>Version 1.0.0</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}>
        <Feather name="log-out" size={20} color={COLORS.primary} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Profile Card
  profileCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.darkCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#34C759',
    borderWidth: 3,
    borderColor: COLORS.cardBg,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.grayCard,
  },

  // Sections
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});