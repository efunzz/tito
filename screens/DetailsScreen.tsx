import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';

// Import centralized theme and types
import { COLORS } from '../constants/theme';
import type { Shift, WeekDay, RootStackParamList } from '../constants/types';

// Import Context hooks
import { useShifts } from '../contexts/ShiftsContext';
import { useSettings } from '../contexts/SettingsContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Details'>;

export default function DetailsScreen() {
  const navigation = useNavigation<NavigationProp>();

  // Get data from Context
  const { shifts } = useShifts();
  const { monthlyGoal } = useSettings();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // ISO format
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);

  // Load data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      generateWeekDays();
    }, [])
  );

  // Generate current week days
  const generateWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    const weekStart = new Date(today);
    
    // Go back to Saturday (start of week)
    weekStart.setDate(today.getDate() - currentDay - 1);
    
    const days: WeekDay[] = [];
    const dayNames = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const fullDate = date.toISOString().split('T')[0]; // ISO format: "2024-11-02"
      const todayISO = today.toISOString().split('T')[0];
      
      days.push({
        day: dayNames[i],
        date: date.getDate(),
        fullDate: fullDate,
        active: fullDate === todayISO,
      });
    }
    
    setWeekDays(days);
  };

  // Calculate earnings and hours for selected date
  const selectedDateShifts = shifts.filter(shift => shift.date === selectedDate);
  const selectedDateEarnings = selectedDateShifts.reduce((total, shift) => total + shift.earnings, 0);
  const selectedDateHours = selectedDateShifts.reduce((total, shift) => total + shift.totalHours, 0);

  // Get clock in/out times for selected date
  const selectedShift = selectedDateShifts[0]; // Assuming one shift per day
  const clockInTime = selectedShift
    ? new Date(selectedShift.clockIn).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '--';
  const clockOutTime = selectedShift && selectedShift.clockOut
    ? new Date(selectedShift.clockOut).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '--';

  // Calculate ALL-TIME total stats (not just this month)
  const totalEarnings = shifts.reduce((total, shift) => total + shift.earnings, 0);
  const totalHours = shifts.reduce((total, shift) => total + shift.totalHours, 0);
  const totalShifts = shifts.length;

  // Calculate monthly stats for the monthly target card
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyEarnings = shifts
    .filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getMonth() === currentMonth &&
             shiftDate.getFullYear() === currentYear;
    })
    .reduce((total, shift) => total + shift.earnings, 0);

  const monthlyShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    return shiftDate.getMonth() === currentMonth &&
           shiftDate.getFullYear() === currentYear;
  }).length;

  const remaining: number = monthlyGoal - monthlyEarnings;

  const averagePerShift: string = totalShifts > 0
    ? (totalEarnings / totalShifts).toFixed(2)
    : '0.00';

  // Circle - static decoration (no progress bar for selected day)
  const radius: number = 100;

  // Handle date selection
  const handleDateSelect = (day: WeekDay) => {
    setSelectedDate(day.fullDate);
    // Update active state
    setWeekDays(weekDays.map(d => ({
      ...d,
      active: d.fullDate === day.fullDate
    })));
  };

  // Get current date display
  const getDateDisplay = () => {
    const activeDay = weekDays.find(d => d.active);
    if (!activeDay) {
      return new Date().toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
    
    // Convert ISO string to Date object
    const [year, month, day] = activeDay.fullDate.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

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
          <Text style={styles.headerDate}>{getDateDisplay()}</Text>
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      {/* Week Calendar Strip */}
      <View style={styles.weekStrip}>
        {weekDays.map((item: WeekDay, index: number) => (
          <TouchableOpacity 
            key={index} 
            style={styles.dayContainer}
            onPress={() => handleDateSelect(item)}
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

      {/* Selected Day Earnings */}
      <View style={styles.selectedDayContainer}>
        <View style={styles.circleWrapper}>
          <Svg width="240" height="240">
            {/* Static circle decoration */}
            <Circle
              cx="120"
              cy="120"
              r={radius}
              stroke={COLORS.grayCard}
              strokeWidth="16"
              fill="none"
            />
          </Svg>

          {/* Center content - Selected Day Earnings */}
          <View style={styles.centerContent}>
            <Text style={styles.mainAmount}>${selectedDateEarnings.toFixed(2)}</Text>
            <Text style={styles.goalSubtext}>earned this day</Text>
          </View>
        </View>

        {/* Icon indicator */}
        <View style={styles.indicatorIcon}>
          <Feather name="calendar" size={20} color={COLORS.primary} />
        </View>
      </View>

      {/* Selected Day Details */}
      {selectedShift && (
        <View style={styles.selectedDayDetails}>
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Feather name="clock" size={16} color={COLORS.textSecondary} />
              <Text style={styles.timeLabel}>Clock In</Text>
              <Text style={styles.timeValue}>{clockInTime}</Text>
            </View>
            <View style={styles.timeSeparator} />
            <View style={styles.timeItem}>
              <Feather name="clock" size={16} color={COLORS.textSecondary} />
              <Text style={styles.timeLabel}>Clock Out</Text>
              <Text style={styles.timeValue}>{clockOutTime}</Text>
            </View>
          </View>
          <View style={styles.hoursRow}>
            <MaterialCommunityIcons name="timer-outline" size={18} color={COLORS.primary} />
            <Text style={styles.hoursText}>{selectedDateHours.toFixed(1)} hours worked</Text>
          </View>
        </View>
      )}

      {!selectedShift && (
        <View style={styles.noShiftContainer}>
          <Feather name="info" size={20} color={COLORS.textSecondary} />
          <Text style={styles.noShiftText}>No shift recorded for this day</Text>
        </View>
      )}

      {/* Monthly Target Card */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Monthly Target</Text>

        <View style={styles.mainCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.textPrimary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Goal: ${monthlyGoal.toLocaleString()}</Text>
            <Text style={styles.cardSubtitle}>
              Earned: ${monthlyEarnings.toFixed(0)} • Remaining: ${remaining > 0 ? remaining.toFixed(0) : 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Total Stats Section - All Time */}
      <View style={styles.totalStatsSection}>
        <Text style={styles.sectionTitle}>Total Earned So Far</Text>

        {/* Total Earnings Card */}
        <View style={styles.totalEarningsCard}>
          <View style={styles.totalEarningsHeader}>
            <MaterialCommunityIcons name="cash-multiple" size={32} color={COLORS.primary} />
            <Text style={styles.totalEarningsAmount}>${totalEarnings.toFixed(2)}</Text>
          </View>
          <Text style={styles.totalEarningsLabel}>All-time earnings</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Total Hours */}
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <Feather name="clock" size={18} color="#FFF" />
            </View>
            <Text style={styles.statValue}>{totalHours.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>

          {/* Total Shifts */}
          <View style={[styles.statCard, styles.redStatCard]}>
            <View style={styles.redStatIconWrapper}>
              <MaterialCommunityIcons name="calendar-check" size={18} color="#FFF" />
            </View>
            <Text style={styles.statValue}>{totalShifts}</Text>
            <Text style={styles.statLabel}>Total Shifts</Text>
          </View>
        </View>

        {/* Average Per Shift */}
        <View style={styles.performanceCard}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="chart-line" size={24} color={COLORS.textPrimary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Average Per Shift</Text>
            <Text style={styles.cardSubtitle}>${averagePerShift} average earnings</Text>
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

  // Selected Day Container
  selectedDayContainer: {
    alignItems: 'center',
    marginBottom: 16,
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

  // Selected Day Details
  selectedDayDetails: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayCard,
  },
  timeItem: {
    alignItems: 'center',
    gap: 6,
  },
  timeSeparator: {
    width: 1,
    backgroundColor: COLORS.grayCard,
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  noShiftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 32,
  },
  noShiftText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
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

  // Total Stats Section
  totalStatsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  totalEarningsCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  totalEarningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  totalEarningsAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  totalEarningsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  statsGrid: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});