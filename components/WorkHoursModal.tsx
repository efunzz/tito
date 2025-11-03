import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const COLORS = {
  background: '#E8E5E0',
  cardBg: '#FFFFFF',
  darkCard: '#1A1A1A',
  primary: '#FF5555',
  textPrimary: '#1A1A1A',
  textSecondary: '#8E8E93',
  grayCard: '#D4D1CC',
} as const;

interface WorkHoursModalProps {
  visible: boolean;
  onClose: () => void;
  currentStartTime: string; // "09:00"
  currentEndTime: string;   // "17:00"
  onSave: (startTime: string, endTime: string) => void;
}

const formatTime12Hour = (time24: string): string => {
  const [hour, minute] = time24.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

const timeStringToDate = (timeString: string): Date => {
  const [hour, minute] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};

const dateToTimeString = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function WorkHoursModal({
  visible,
  onClose,
  currentStartTime,
  currentEndTime,
  onSave,
}: WorkHoursModalProps) {
  const [startTime, setStartTime] = useState<Date>(timeStringToDate(currentStartTime));
  const [endTime, setEndTime] = useState<Date>(timeStringToDate(currentEndTime));
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Start Time, Step 2: End Time

  useEffect(() => {
    setStartTime(timeStringToDate(currentStartTime));
    setEndTime(timeStringToDate(currentEndTime));
    setStep(1); // Reset to step 1 when modal opens
  }, [currentStartTime, currentEndTime, visible]);

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSave = () => {
    onSave(dateToTimeString(startTime), dateToTimeString(endTime));
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Work Hours" height={520}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>
          {step === 1 ? 'Select your start time' : 'Select your end time'}
        </Text>

        {/* Step 1: Start Time */}
        {step === 1 && (
          <View style={styles.timeSection}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setStartTime(selectedDate);
                  }
                }}
                style={styles.picker}
                textColor={COLORS.textPrimary}
              />
            </View>
          </View>
        )}

        {/* Step 2: End Time */}
        {step === 2 && (
          <View style={styles.timeSection}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setEndTime(selectedDate);
                  }
                }}
                style={styles.picker}
                textColor={COLORS.textPrimary}
              />
            </View>
          </View>
        )}

        {/* Step Indicators */}
        <View style={styles.stepIndicators}>
          <View style={[styles.stepDot, step === 1 && styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {step === 1 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Feather name="check" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
}


const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  timeSection: {
    marginBottom: 24,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 140,
    width: '100%',
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.grayCard,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveButton: {
    flex: 1,
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