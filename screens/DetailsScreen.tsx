import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define navigation types
type RootStackParamList = {
  Home: undefined;
  Details: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Details'>;

// Week day type
interface WeekDay {
  day: string;
  date: number;
  active: boolean;
}

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

export default function DetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  // Placeholder data
  const [monthlyGoal] = useState<number>(1000);
  const [earnedSoFar] = useState<number>(620);
  const [hoursWorked] = useState<number>(42);
  const [shiftsWorked] = useState<number>(5);
  
  const progressPercentage: number = Math.round((earnedSoFar / monthlyGoal) * 100);
  const averagePerShift: string = (earnedSoFar / shiftsWorked).toFixed(2);
  const remaining: number = monthlyGoal - earnedSoFar;

  // Circle progress calculation
  const radius: number = 100;
  const circumference: number = 2 * Math.PI * radius;
  const strokeDashoffset: number = circumference - (progressPercentage / 100) * circumference;

  // Week days data (placeholder)
  const weekDays: WeekDay[] = [
    { day: 'Sat', date: 11, active: false },
    { day: 'Sun', date: 12, active: false },
    { day: 'Mon', date: 13, active: false },
    { day: 'Tue', date: 14, active: true },
    { day: 'Wed', date: 15, active: false },
    { day: 'Thu', date: 16, active: false },
    { day: 'Fri', date: 17, active: false },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Earnings</Text>
          <Text style={styles.headerDate}>14 October 2024</Text>
        </View>
        
        <View style={{ width: 40 }} />
        {/* Empty view for symmetry */}
      </View>

      {/* Week Calendar Strip */}
      <View style={styles.weekStrip}>
        {weekDays.map((item: WeekDay, index: number) => (
          <TouchableOpacity 
            key={index} 
            style={styles.dayContainer}
          >
            <Text style={[styles.dayText, item.active && styles.activeDayText]}>
              {item.day}
            </Text>
            <View style={[styles.dateCircle, item.active && styles.activeDateCircle]}>
              <Text style={[styles.dateText, item.active && styles.activeDateText]}>
                {item.date}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Circular Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.circleWrapper}>
          <Svg width="240" height="240">
            {/* Background circle */}
            <Circle
              cx="120"
              cy="120"
              r={radius}
              stroke={COLORS.grayCard}
              strokeWidth="16"
              fill="none"
            />
            {/* Progress circle */}
            <Circle
              cx="120"
              cy="120"
              r={radius}
              stroke={COLORS.primary}
              strokeWidth="16"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin="120, 120"
            />
          </Svg>
          
          {/* Center content */}
          <View style={styles.centerContent}>
            <Text style={styles.mainAmount}>${earnedSoFar}</Text>
            <Text style={styles.goalSubtext}>of ${monthlyGoal}</Text>
          </View>
        </View>

        {/* Icon indicator */}
        <View style={styles.indicatorIcon}>
          <Feather name="trending-up" size={20} color={COLORS.primary} />
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Overview</Text>
        
        {/* Main Goal Card */}
        <TouchableOpacity style={styles.mainCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.textPrimary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Monthly Target</Text>
            <Text style={styles.cardSubtitle}>Goal: ${monthlyGoal} • ${remaining} remaining</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textLight} />
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Hours Card - Dark */}
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <Feather name="clock" size={18} color="#FFF" />
            </View>
            <Text style={styles.statValue}>{hoursWorked}h</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          
          {/* Per Shift Card - Red */}
          <View style={[styles.statCard, styles.redStatCard]}>
            <View style={styles.redStatIconWrapper}>
              <Ionicons name="cash-outline" size={18} color="#FFF" />
            </View>
            <Text style={styles.statValue}>${averagePerShift}</Text>
            <Text style={styles.statLabel}>Per Shift</Text>
          </View>
        </View>

        {/* Performance Card */}
        <TouchableOpacity style={styles.performanceCard}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="chart-line" size={24} color={COLORS.textPrimary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Performance</Text>
            <Text style={styles.cardSubtitle}>{shiftsWorked} shifts completed this month</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textLight} />
        </TouchableOpacity>

        {/* Bonus Cards Row */}
        <View style={styles.bonusRow}>
          {/* Dark card with progress */}
          <View style={styles.darkBonusCard}>
            <View style={styles.bonusCircle}>
              <Svg width="80" height="80">
                <Circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <Circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke={COLORS.primary}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - progressPercentage / 100)}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="40, 40"
                />
              </Svg>
              <View style={styles.bonusPercentage}>
                <Text style={styles.bonusPercentText}>{progressPercentage}%</Text>
              </View>
            </View>
            <Text style={styles.bonusTitle}>Goal Progress</Text>
            <Text style={styles.bonusSubtitle}>Keep going!</Text>
          </View>

          {/* Red bonus card */}
          <View style={styles.redBonusCard}>
            <View style={styles.bonusIconCircle}>
              <Feather name="gift" size={24} color="#FFF" />
            </View>
            <Text style={styles.bonusAmount}>${(monthlyGoal * 0.1).toFixed(0)}</Text>
            <Text style={styles.bonusLabel}>Bonus Available</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  headerDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Week Strip
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  dayText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeDayText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDateCircle: {
    backgroundColor: COLORS.textPrimary,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeDateText: {
    color: '#FFF',
  },

  // Progress Container
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  circleWrapper: {
    position: 'relative',
    width: 240,
    height: 240,
  },
  centerContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainAmount: {
    fontSize: 48,
    fontWeight: '300',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  goalSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  indicatorIcon: {
    position: 'absolute',
    top: 20,
    right: 80,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },

  // Main Card
  mainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  redStatCard: {
    backgroundColor: COLORS.primary,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  redStatIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  // Performance Card
  performanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  // Bonus Row
  bonusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  darkBonusCard: {
    flex: 1,
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  bonusCircle: {
    position: 'relative',
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  bonusPercentage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bonusPercentText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  bonusTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  bonusSubtitle: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  redBonusCard: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  bonusAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  bonusLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },
});