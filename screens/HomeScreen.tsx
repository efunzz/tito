import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Status type
type Status = 'idle' | 'clocked-in' | 'on-break';

// Shift type
type Shift = {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  breaks: { start: string; end: string | null }[];
  totalHours: number;
  hourlyRate: number;
  earnings: number;
};

// Match Cardy Pay colors
const COLORS = {
  background: '#E8E5E0',
  cardBg: '#FFFFFF',
  cardDisabled: '#D4D1CC',
  primary: '#FF5555',
  textPrimary: '#1A1A1A',
  textSecondary: '#8E8E93',
  textDisabled: '#B8B8B8',
} as const;

export default function HomeScreen() {
  const navigation = useNavigation();
  const [status, setStatus] = useState<Status>('idle');
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [currentBreaks, setCurrentBreaks] = useState<{ start: string; end: string | null }[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [hourlyRate, setHourlyRate] = useState(15); // Default $15/hour

  // Load saved data when app opens
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedShifts = await AsyncStorage.getItem('shifts');
      const savedStatus = await AsyncStorage.getItem('status');
      const savedClockIn = await AsyncStorage.getItem('currentClockIn');
      const savedBreaks = await AsyncStorage.getItem('currentBreaks');
      const savedRate = await AsyncStorage.getItem('hourlyRate');

      if (savedShifts) setShifts(JSON.parse(savedShifts));
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

    // Save to AsyncStorage
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
    
    // Update the last break's end time
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
    
    // Calculate break time
    const breakMs = breaks.reduce((total, brk) => {
      if (brk.end) {
        const breakDuration = new Date(brk.end).getTime() - new Date(brk.start).getTime();
        return total + breakDuration;
      }
      return total;
    }, 0);

    const workMs = totalMs - breakMs;
    return workMs / (1000 * 60 * 60); // Convert to hours
  };

  const handleClockOut = async () => {
    if (!clockInTime) return;

    const now = new Date();
    const hours = calculateHours(clockInTime, now, currentBreaks);
    const earnings = hours * hourlyRate;

    const newShift: Shift = {
      id: Date.now().toString(),
      date: now.toLocaleDateString(),
      clockIn: clockInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      clockOut: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      breaks: currentBreaks,
      totalHours: parseFloat(hours.toFixed(2)),
      hourlyRate: hourlyRate,
      earnings: parseFloat(earnings.toFixed(2)),
    };

    const updatedShifts = [...shifts, newShift];
    setShifts(updatedShifts);
    setClockInTime(null);
    setBreakStartTime(null);
    setCurrentBreaks([]);
    setStatus('idle');

    // Save to AsyncStorage
    await AsyncStorage.setItem('shifts', JSON.stringify(updatedShifts));
    await AsyncStorage.removeItem('status');
    await AsyncStorage.removeItem('currentClockIn');
    await AsyncStorage.removeItem('currentBreaks');

    console.log('Shift saved:', newShift);
  };

  // Calculate today's earnings
  const todayEarnings = shifts
    .filter(shift => shift.date === new Date().toLocaleDateString())
    .reduce((total, shift) => total + shift.earnings, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tito</Text>
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
          {/* Clock In Button */}
          <TouchableOpacity 
            style={[
              styles.actionCard,
              status !== 'idle' && styles.disabledCard
            ]}
            onPress={handleClockIn}
            disabled={status !== 'idle'}
          >
            <View style={[
              styles.iconCircle,
              status === 'idle' ? styles.activeIconCircle : styles.disabledIconCircle
            ]}>
              <Feather 
                name="log-in" 
                size={24} 
                color={status === 'idle' ? COLORS.primary : COLORS.textDisabled} 
              />
            </View>
            <Text style={[
              styles.actionLabel,
              status !== 'idle' && styles.disabledLabel
            ]}>
              Clock In
            </Text>
          </TouchableOpacity>

          {/* Clock Out Button */}
          <TouchableOpacity 
            style={[
              styles.actionCard,
              status === 'idle' && styles.disabledCard
            ]}
            onPress={handleClockOut}
            disabled={status === 'idle'}
          >
            <View style={[
              styles.iconCircle,
              status !== 'idle' ? styles.activeIconCircle : styles.disabledIconCircle
            ]}>
              <Feather 
                name="log-out" 
                size={24} 
                color={status !== 'idle' ? COLORS.primary : COLORS.textDisabled} 
              />
            </View>
            <Text style={[
              styles.actionLabel,
              status === 'idle' && styles.disabledLabel
            ]}>
              Clock Out
            </Text>
          </TouchableOpacity>

          {/* Start Break Button */}
          <TouchableOpacity 
            style={[
              styles.actionCard,
              status !== 'clocked-in' && styles.disabledCard
            ]}
            onPress={handleStartBreak}
            disabled={status !== 'clocked-in'}
          >
            <View style={[
              styles.iconCircle,
              status === 'clocked-in' ? styles.activeIconCircle : styles.disabledIconCircle
            ]}>
              <Ionicons 
                name="cafe-outline" 
                size={24} 
                color={status === 'clocked-in' ? COLORS.primary : COLORS.textDisabled} 
              />
            </View>
            <Text style={[
              styles.actionLabel,
              status !== 'clocked-in' && styles.disabledLabel
            ]}>
              Start Break
            </Text>
          </TouchableOpacity>

          {/* End Break Button */}
          <TouchableOpacity 
            style={[
              styles.actionCard,
              status !== 'on-break' && styles.disabledCard
            ]}
            onPress={handleEndBreak}
            disabled={status !== 'on-break'}
          >
            <View style={[
              styles.iconCircle,
              status === 'on-break' ? styles.activeIconCircle : styles.disabledIconCircle
            ]}>
              <Ionicons 
                name="play-outline" 
                size={24} 
                color={status === 'on-break' ? COLORS.primary : COLORS.textDisabled} 
              />
            </View>
            <Text style={[
              styles.actionLabel,
              status !== 'on-break' && styles.disabledLabel
            ]}>
              End Break
            </Text>
          </TouchableOpacity>
        </View>

        {/* Debug: Show recent shifts */}
        {shifts.length > 0 && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Recent Shifts (Debug)</Text>
            {shifts.slice(-3).reverse().map(shift => (
              <View key={shift.id} style={styles.debugShift}>
                <Text style={styles.debugText}>{shift.date}</Text>
                <Text style={styles.debugText}>{shift.clockIn} - {shift.clockOut}</Text>
                <Text style={styles.debugText}>{shift.totalHours}h = ${shift.earnings}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.cardBg,
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
  activeIconCircle: {
    backgroundColor: 'rgba(255, 85, 85, 0.1)',
  },
  disabledIconCircle: {
    backgroundColor: 'rgba(184, 184, 184, 0.1)',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  disabledLabel: {
    color: COLORS.textDisabled,
  },
  debugContainer: {
    marginHorizontal: 20,
    marginBottom: 100,
    padding: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  debugShift: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardDisabled,
  },
  debugText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});