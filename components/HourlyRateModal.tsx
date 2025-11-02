import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#E8E5E0',
  cardBg: '#FFFFFF',
  darkCard: '#1A1A1A',
  primary: '#FF5555',
  textPrimary: '#1A1A1A',
  textSecondary: '#8E8E93',
  grayCard: '#D4D1CC',
} as const;

interface HourlyRateModalProps {
  visible: boolean;
  onClose: () => void;
  currentRate: number;
  onSave: (rate: number) => void;
}

export default function HourlyRateModal({
  visible,
  onClose,
  currentRate,
  onSave,
}: HourlyRateModalProps) {
  const [rate, setRate] = useState<string>(currentRate.toString());

  // Update local state when currentRate changes
  useEffect(() => {
    setRate(currentRate.toString());
  }, [currentRate]);

  const handleSave = () => {
    const numericRate = parseFloat(rate);
    if (!isNaN(numericRate) && numericRate > 0) {
      onSave(numericRate);
      onClose();
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Hourly Rate" height={380}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Enter your hourly rate</Text>

          {/* Input container with dollar sign */}
          <View style={styles.inputContainer}>
            <View style={styles.dollarSign}>
              <Text style={styles.dollarText}>$</Text>
            </View>
            <TextInput
              style={styles.input}
              value={rate}
              onChangeText={setRate}
              keyboardType="decimal-pad"
              placeholder="15.00"
              placeholderTextColor={COLORS.textSecondary}
            />
            <Text style={styles.perHour}>/ hour</Text>
          </View>

          {/* Quick presets */}
          <View style={styles.presetsContainer}>
            <Text style={styles.presetsLabel}>Quick select:</Text>
            <View style={styles.presetsRow}>
              {[10, 15, 20, 25].map((presetRate) => (
                <TouchableOpacity
                  key={presetRate}
                  style={[
                    styles.presetButton,
                    rate === presetRate.toString() && styles.presetButtonActive,
                  ]}
                  onPress={() => setRate(presetRate.toString())}
                >
                  <Text
                    style={[
                      styles.presetText,
                      rate === presetRate.toString() && styles.presetTextActive,
                    ]}
                  >
                    ${presetRate}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Rate</Text>
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
  label: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  dollarSign: {
    marginRight: 8,
  },
  dollarText: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.textPrimary,
    padding: 0,
  },
  perHour: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  presetsContainer: {
    marginBottom: 24,
  },
  presetsLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  presetTextActive: {
    color: '#FFFFFF',
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