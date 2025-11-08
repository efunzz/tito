import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomSheetModal from './BottomSheetModal';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useShifts } from '../contexts/ShiftsContext';
import { useSettings } from '../contexts/SettingsContext';

interface AddShiftModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddShiftModal({ visible, onClose }: AddShiftModalProps) {
  const { addShift, shifts } = useShifts();
  const { hourlyRate } = useSettings();

  // State
  const [date, setDate] = useState<Date>(new Date());
  const [clockInTime, setClockInTime] = useState<Date>(new Date());
  const [clockOutTime, setClockOutTime] = useState<Date>(new Date());
  const [breakDuration, setBreakDuration] = useState<number>(0); // in minutes

  // Date/time picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showClockInPicker, setShowClockInPicker] = useState(false);
  const [showClockOutPicker, setShowClockOutPicker] = useState(false);

  const breakOptions = [
    { label: 'None', value: 0 },
    { label: '30 min', value: 30 },
    { label: '1 hr', value: 60 },
    { label: '1.5 hr', value: 90 },
    { label: '2 hr', value: 120 },
  ];

  // Format date for display
  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate total hours and earnings
  const calculateShift = () => {
    // Combine date with times
    const clockIn = new Date(date);
    clockIn.setHours(clockInTime.getHours(), clockInTime.getMinutes(), 0);

    const clockOut = new Date(date);
    clockOut.setHours(clockOutTime.getHours(), clockOutTime.getMinutes(), 0);

    // If clock out is before clock in, assume next day
    if (clockOut < clockIn) {
      clockOut.setDate(clockOut.getDate() + 1);
    }

    const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
    const workMinutes = totalMinutes - breakDuration;
    const totalHours = workMinutes / 60;
    const earnings = totalHours * hourlyRate;

    return { totalHours, earnings, clockIn, clockOut };
  };

  const handleSave = async () => {
    const { totalHours, earnings, clockIn, clockOut } = calculateShift();

    // Validation
    if (clockOut <= clockIn && clockOut.getDate() === clockIn.getDate()) {
      Alert.alert('Invalid Times', 'Clock out time must be after clock in time');
      return;
    }

    if (date > new Date()) {
      Alert.alert('Invalid Date', 'Cannot add shifts for future dates');
      return;
    }

    if (totalHours <= 0) {
      Alert.alert('Invalid Shift', 'Shift duration must be positive');
      return;
    }

    // Check for duplicate date
    const dateString = date.toISOString().split('T')[0];
    const existingShift = shifts.find(s => s.date === dateString);
    if (existingShift) {
      Alert.alert(
        'Duplicate Shift',
        `You already have a shift for ${formatDate(date)}. Delete it first or choose a different date.`
      );
      return;
    }

    // Create shift object
    const newShift = {
      id: `shift-${Date.now()}`,
      date: dateString,
      clockIn: clockIn.toISOString(),
      clockOut: clockOut.toISOString(),
      breaks: breakDuration > 0 ? [{
        start: clockIn.toISOString(),
        end: new Date(clockIn.getTime() + breakDuration * 60000).toISOString()
      }] : [],
      totalHours: parseFloat(totalHours.toFixed(2)),
      hourlyRate,
      earnings: parseFloat(earnings.toFixed(2)),
    };

    try {
      await addShift(newShift);
      Alert.alert('Success', 'Shift successfully added!');
      onClose();

      // Reset form
      setDate(new Date());
      setClockInTime(new Date());
      setClockOutTime(new Date());
      setBreakDuration(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to add shift. Please try again.');
    }
  };

  const { totalHours, earnings } = calculateShift();

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Add Shift Manually" height={600}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>For shifts you forgot to clock in/out</Text>

        {/* Date Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Date</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather name="calendar" size={20} color={COLORS.textPrimary} />
            <Text style={styles.pickerButtonText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setDate(selectedDate);
              }}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Clock In Time */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Clock In Time</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowClockInPicker(true)}
          >
            <Feather name="clock" size={20} color={COLORS.textPrimary} />
            <Text style={styles.pickerButtonText}>{formatTime(clockInTime)}</Text>
          </TouchableOpacity>
          {showClockInPicker && (
            <DateTimePicker
              value={clockInTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                setShowClockInPicker(Platform.OS === 'ios');
                if (selectedTime) setClockInTime(selectedTime);
              }}
            />
          )}
        </View>

        {/* Clock Out Time */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Clock Out Time</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowClockOutPicker(true)}
          >
            <Feather name="clock" size={20} color={COLORS.textPrimary} />
            <Text style={styles.pickerButtonText}>{formatTime(clockOutTime)}</Text>
          </TouchableOpacity>
          {showClockOutPicker && (
            <DateTimePicker
              value={clockOutTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                setShowClockOutPicker(Platform.OS === 'ios');
                if (selectedTime) setClockOutTime(selectedTime);
              }}
            />
          )}
        </View>

        {/* Break Duration */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Break Duration (Optional)</Text>
          <View style={styles.breakOptionsRow}>
            {breakOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.breakOption,
                  breakDuration === option.value && styles.breakOptionActive,
                ]}
                onPress={() => setBreakDuration(option.value)}
              >
                <Text
                  style={[
                    styles.breakOptionText,
                    breakDuration === option.value && styles.breakOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Hours:</Text>
            <Text style={styles.summaryValue}>{totalHours.toFixed(2)} hrs</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hourly Rate:</Text>
            <Text style={styles.summaryValue}>${hourlyRate.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryLabelTotal}>Earnings:</Text>
            <Text style={styles.summaryValueTotal}>${earnings.toFixed(2)}</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Add Shift</Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  breakOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  breakOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  breakOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  breakOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  breakOptionTextActive: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryRowTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayCard,
    marginBottom: 0,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
