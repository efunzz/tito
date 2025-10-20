import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Status type
type Status = 'idle' | 'clocked-in' | 'on-break';

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
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null);

  const handleClockIn = (): void => {
    const now = new Date();
    setClockInTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    setStatus('clocked-in');
  };

  const handleStartBreak = (): void => {
    const now = new Date();
    setBreakStartTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    setStatus('on-break');
  };

  const handleEndBreak = (): void => {
    setBreakStartTime(null);
    setStatus('clocked-in');
  };

  const handleClockOut = (): void => {
    setClockInTime(null);
    setBreakStartTime(null);
    setStatus('idle');
  };

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

      {/* Status Display */}
      <View style={styles.statusContainer}>
        <View style={styles.statusCard}>
          {status === 'idle' && (
            <>
              <Text style={styles.statusLabel}>Ready to Start</Text>
              <Text style={styles.statusTime}>--:--</Text>
            </>
          )}
          
          {status === 'clocked-in' && (
            <>
              <Text style={styles.statusLabel}>Clocked In</Text>
              <Text style={styles.statusTime}>{clockInTime}</Text>
              <Text style={styles.statusSubtext}>Currently working</Text>
            </>
          )}
          
          {status === 'on-break' && (
            <>
              <Text style={styles.statusLabel}>On Break</Text>
              <Text style={styles.statusTime}>{breakStartTime}</Text>
              <Text style={styles.statusSubtext}>Break started</Text>
            </>
          )}
        </View>

        {/* Today's Earnings */}
        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Today's Earnings</Text>
          <Text style={styles.earningsAmount}>$0.00</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
  },

  // Header
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

  // Status Container
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

  // Button Grid (2x2)
  buttonGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
});