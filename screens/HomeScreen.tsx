import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AllShiftsModal from '../components/AllShiftsModal';

// Import centralized theme and types
import { COLORS } from '../constants/theme';
import type { Status, Shift, TabParamList } from '../constants/types';

// Import Context hooks
import { useShifts } from '../contexts/ShiftsContext';

type NavigationProp = NativeStackNavigationProp<TabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  // Get shifts from Context
  const { shifts, addShift, deleteShift } = useShifts();

  const [status, setStatus] = useState<Status>('idle');
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [currentBreaks, setCurrentBreaks] = useState<{ start: string; end: string | null }[]>([]);
  const [hourlyRate, setHourlyRate] = useState(15);
  const [allShiftsModalVisible, setAllShiftsModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedStatus = await AsyncStorage.getItem('status');
      const savedClockIn = await AsyncStorage.getItem('currentClockIn');
      const savedBreaks = await AsyncStorage.getItem('currentBreaks');
      const savedRate = await AsyncStorage.getItem('hourlyRate');

      // Shifts come from Context now
      if (savedStatus) setStatus(savedStatus as Status);
      if (savedClockIn) setClockInTime(new Date(savedClockIn));
      if (savedBreaks) setCurrentBreaks(JSON.parse(savedBreaks));
      if (savedRate) setHourlyRate(parseFloat(savedRate));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleClockIn = async () => {
    const now = new Date();
    setClockInTime(now);
    setStatus('clocked-in');
    setCurrentBreaks([]);

    await AsyncStorage.setItem('status', 'clocked-in');
    await AsyncStorage.setItem('currentClockIn', now.toISOString());
    await AsyncStorage.setItem('currentBreaks', JSON.stringify([]));
  };

  const handleStartBreak = async () => {
    const now = new Date();
    setBreakStartTime(now);
    setStatus('on-break');

    const newBreak = { start: now.toISOString(), end: null };
    const updatedBreaks = [...currentBreaks, newBreak];
    setCurrentBreaks(updatedBreaks);

    await AsyncStorage.setItem('status', 'on-break');
    await AsyncStorage.setItem('currentBreaks', JSON.stringify(updatedBreaks));
  };

  const handleEndBreak = async () => {
    const now = new Date();
    
    const updatedBreaks = currentBreaks.map((brk, idx) => 
      idx === currentBreaks.length - 1 ? { ...brk, end: now.toISOString() } : brk
    );
    
    setCurrentBreaks(updatedBreaks);
    setBreakStartTime(null);
    setStatus('clocked-in');

    await AsyncStorage.setItem('status', 'clocked-in');
    await AsyncStorage.setItem('currentBreaks', JSON.stringify(updatedBreaks));
  };

  const calculateHours = (clockIn: Date, clockOut: Date, breaks: { start: string; end: string | null }[]) => {
    const totalMs = clockOut.getTime() - clockIn.getTime();
    
    const breakMs = breaks.reduce((total, brk) => {
      if (brk.end) {
        const breakDuration = new Date(brk.end).getTime() - new Date(brk.start).getTime();
        return total + breakDuration;
      }
      return total;
    }, 0);

    const workMs = totalMs - breakMs;
    return workMs / (1000 * 60 * 60);
  };

  const handleClockOut = async () => {
    if (!clockInTime) return;

    const now = new Date();
    const hours = calculateHours(clockInTime, now, currentBreaks);
    const earnings = hours * hourlyRate;

    const newShift: Shift = {
      id: Date.now().toString(),
      date: now.toISOString().split('T')[0],
      clockIn: clockInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      clockOut: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      breaks: currentBreaks,
      totalHours: parseFloat(hours.toFixed(2)),
      hourlyRate: hourlyRate,
      earnings: parseFloat(earnings.toFixed(2)),
    };

    // Save shift using Context (handles AsyncStorage + Supabase sync)
    await addShift(newShift);

    setClockInTime(null);
    setBreakStartTime(null);
    setCurrentBreaks([]);
    setStatus('idle');

    await AsyncStorage.removeItem('status');
    await AsyncStorage.removeItem('currentClockIn');
    await AsyncStorage.removeItem('currentBreaks');
  };

  const today = new Date().toISOString().split('T')[0];
  const todayEarnings = shifts
    .filter(shift => shift.date === today)
    .reduce((total, shift) => total + shift.earnings, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with custom "tito" logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>t</Text>
          <View style={styles.iContainer}>
            <View style={styles.redDot} />
            <Text style={styles.logoText}>i</Text>
          </View>
          <Text style={styles.logoText}>to</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Details')}>
          <Feather name="bar-chart-2" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Display */}
        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            {status === 'idle' && (
              <>
                <Text style={styles.statusLabel}>Ready to Start</Text>
                <Text style={styles.statusTime}>--:--</Text>
              </>
            )}
            
            {status === 'clocked-in' && clockInTime && (
              <>
                <Text style={styles.statusLabel}>Clocked In</Text>
                <Text style={styles.statusTime}>
                  {clockInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.statusSubtext}>Currently working</Text>
              </>
            )}
            
            {status === 'on-break' && breakStartTime && (
              <>
                <Text style={styles.statusLabel}>On Break</Text>
                <Text style={styles.statusTime}>
                  {breakStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.statusSubtext}>Break started</Text>
              </>
            )}
          </View>

          {/* Today's Earnings */}
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Today's Earnings</Text>
            <Text style={styles.earningsAmount}>${todayEarnings.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons Grid (2x2) */}
        <View style={styles.buttonGrid}>
          <TouchableOpacity 
            style={[
              styles.actionCard,
              styles.redActionCard,
              status !== 'idle' && styles.disabledCard
            ]}
            onPress={handleClockIn}
            disabled={status !== 'idle'}
          >
            <View style={[
              styles.iconCircle,
              status === 'idle' ? styles.redIconCircle : styles.disabledIconCircle
            ]}>
              <Feather 
                name="log-in" 
                size={24} 
                color="#FFFFFF"
              />
            </View>
            <Text style={[
              styles.actionLabel,
              styles.whiteLabel,
              status !== 'idle' && styles.disabledLabel
            ]}>
              Clock In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionCard,
              styles.darkActionCard,
              status === 'idle' && styles.disabledCard
            ]}
            onPress={handleClockOut}
            disabled={status === 'idle'}
          >
            <View style={[
              styles.iconCircle,
              status !== 'idle' ? styles.darkIconCircle : styles.disabledIconCircle
            ]}>
              <Feather 
                name="log-out" 
                size={24} 
                color="#FFFFFF"
              />
            </View>
            <Text style={[
              styles.actionLabel,
              styles.whiteLabel,
              status === 'idle' && styles.disabledLabel
            ]}>
              Clock Out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionCard,
              styles.redActionCard,
              status !== 'clocked-in' && styles.disabledCard
            ]}
            onPress={handleStartBreak}
            disabled={status !== 'clocked-in'}
          >
            <View style={[
              styles.iconCircle,
              status === 'clocked-in' ? styles.redIconCircle : styles.disabledIconCircle
            ]}>
              <Ionicons 
                name="cafe-outline" 
                size={24} 
                color="#FFFFFF"
              />
            </View>
            <Text style={[
              styles.actionLabel,
              styles.whiteLabel,
              status !== 'clocked-in' && styles.disabledLabel
            ]}>
              Start Break
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionCard,
              styles.darkActionCard,
              status !== 'on-break' && styles.disabledCard
            ]}
            onPress={handleEndBreak}
            disabled={status !== 'on-break'}
          >
            <View style={[
              styles.iconCircle,
              status === 'on-break' ? styles.darkIconCircle : styles.disabledIconCircle
            ]}>
              <Ionicons 
                name="play-outline" 
                size={24} 
                color="#FFFFFF"
              />
            </View>
            <Text style={[
              styles.actionLabel,
              styles.whiteLabel,
              status !== 'on-break' && styles.disabledLabel
            ]}>
              End Break
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Shifts */}
        {shifts.length > 0 && (
          <View style={styles.shiftsSection}>
            <View style={styles.shiftsSectionHeader}>
              <Text style={styles.shiftsTitle}>Recent Shifts</Text>
              <TouchableOpacity
                style={styles.shiftsCountBadge}
                onPress={() => setAllShiftsModalVisible(true)}
              >
                <Text style={styles.shiftsCount}>{shifts.length}</Text>
                <Feather name="chevron-right" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {shifts.slice(-3).reverse().map((shift) => (
              <View key={shift.id} style={styles.shiftCard}>
                <View style={styles.shiftHeader}>
                  <View>
                    <Text style={styles.shiftDate}>{shift.date}</Text>
                    <View style={styles.shiftDetails}>
                      <View style={styles.shiftDetailItem}>
                        <Feather name="clock" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.shiftDetailText}>
                          {shift.clockIn} - {shift.clockOut}
                        </Text>
                      </View>

                      <View style={styles.shiftDetailItem}>
                        <Feather name="activity" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.shiftDetailText}>
                          {shift.totalHours}h @ ${shift.hourlyRate}/hr
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.shiftActions}>
                    <View style={styles.earningsBadge}>
                      <Text style={styles.earningsText}>${shift.earnings.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        Alert.alert(
                          'Delete Shift',
                          `Delete shift from ${shift.date}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => deleteShift(shift.id),
                            },
                          ]
                        );
                      }}
                    >
                      <Feather name="trash-2" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* All Shifts Modal */}
      <AllShiftsModal
        visible={allShiftsModalVisible}
        onClose={() => setAllShiftsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  // ✨ Custom "tito" logo styles
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  iContainer: {
    position: 'relative',
  },
  redDot: {
    position: 'absolute',
    top: 4,
    left: 1,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
    zIndex: 1,
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statusCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statusTime: {
    fontSize: 48,
    fontWeight: '300',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  statusSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  earningsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  buttonGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  redActionCard: {
    backgroundColor: COLORS.primary,
  },
  darkActionCard: {
    backgroundColor: COLORS.darkCard,
  },
  disabledCard: {
    backgroundColor: COLORS.cardDisabled,
    shadowOpacity: 0.03,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  redIconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  darkIconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  disabledIconCircle: {
    backgroundColor: 'rgba(184, 184, 184, 0.1)',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  whiteLabel: {
    color: '#FFFFFF',
  },
  disabledLabel: {
    color: COLORS.textDisabled,
  },
  shiftsSection: {
    marginHorizontal: 20,
    marginBottom: 100,
  },
  shiftsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shiftsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  shiftsCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  shiftsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  shiftCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shiftDate: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  shiftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  earningsBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  earningsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftDetails: {
    gap: 8,
  },
  shiftDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shiftDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});





