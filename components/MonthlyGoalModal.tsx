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
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import centralized theme
import { COLORS } from '../constants/theme';

interface MonthlyGoalModalProps {
  visible: boolean;
  onClose: () => void;
  currentGoal: number;
  onSave: (goal: number) => void;
}

export default function MonthlyGoalModal({
  visible,
  onClose,
  currentGoal,
  onSave,
}: MonthlyGoalModalProps) {
  const [goal, setGoal] = useState<string>(currentGoal.toString());

  // Update local state when currentGoal changes
  useEffect(() => {
    setGoal(currentGoal.toString());
  }, [currentGoal]);

  const handleSave = () => {
    const numericGoal = parseFloat(goal);
    if (!isNaN(numericGoal) && numericGoal > 0) {
      onSave(numericGoal);
      onClose();
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Monthly Goal" height={380}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Set your monthly earnings target</Text>

          {/* Input container with dollar sign */}
          <View style={styles.inputContainer}>
            <View style={styles.dollarSign}>
              <Text style={styles.dollarText}>$</Text>
            </View>
            <TextInput
              style={styles.input}
              value={goal}
              onChangeText={setGoal}
              keyboardType="decimal-pad"
              placeholder="1000"
              placeholderTextColor={COLORS.textSecondary}
            />
            <Text style={styles.perMonth}>/ month</Text>
          </View>

          {/* Quick presets */}
          <View style={styles.presetsContainer}>
            <Text style={styles.presetsLabel}>Quick select:</Text>
            <View style={styles.presetsRow}>
              {[500, 1000, 1500, 2000].map((presetGoal) => (
                <TouchableOpacity
                  key={presetGoal}
                  style={[
                    styles.presetButton,
                    goal === presetGoal.toString() && styles.presetButtonActive,
                  ]}
                  onPress={() => setGoal(presetGoal.toString())}
                >
                  <Text
                    style={[
                      styles.presetText,
                      goal === presetGoal.toString() && styles.presetTextActive,
                    ]}
                  >
                    ${presetGoal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Goal</Text>
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
  perMonth: {
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




