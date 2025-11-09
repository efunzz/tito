import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomSheetModal from './BottomSheetModal';

// Import centralized theme and types
import { COLORS } from '../constants/theme';
import type { Shift } from '../constants/types';

// Import Context hooks
import { useShifts } from '../contexts/ShiftsContext';

interface AllShiftsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AllShiftsModal({ visible, onClose }: AllShiftsModalProps) {
  const { shifts, deleteShift } = useShifts();

  const handleDelete = (shiftId: string, shiftDate: string) => {
    Alert.alert(
      'Delete Shift',
      `Delete shift from ${shiftDate}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteShift(shiftId);
          },
        },
      ]
    );
  };

  // Sort shifts by date (newest first)
  const sortedShifts = [...shifts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="All Shifts" height={600}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sortedShifts.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No shifts logged yet</Text>
          </View>
        ) : (
          sortedShifts.map((shift) => (
            <View key={shift.id} style={styles.shiftCard}>
              <View style={styles.shiftHeader}>
                <View>
                  <Text style={styles.shiftDate}>{shift.date}</Text>
                  <Text style={styles.shiftTime}>
                    {shift.clockIn} - {shift.clockOut}
                  </Text>
                </View>

                <View style={styles.shiftRight}>
                  <View style={styles.earningsBadge}>
                    <Text style={styles.earningsText}>${shift.earnings.toFixed(2)}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(shift.id, shift.date)}
                  >
                    <Feather name="trash-2" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.shiftDetails}>
                <View style={styles.shiftDetailItem}>
                  <Feather name="clock" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.shiftDetailText}>
                    {shift.totalHours.toFixed(2)}h
                  </Text>
                </View>

                <View style={styles.shiftDetailItem}>
                  <Feather name="dollar-sign" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.shiftDetailText}>
                    {shift.hourlyRate}/hr
                  </Text>
                </View>

                {shift.breaks && shift.breaks.length > 0 && (
                  <View style={styles.shiftDetailItem}>
                    <Feather name="coffee" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.shiftDetailText}>
                      {shift.breaks.length} break{shift.breaks.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  shiftCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  shiftRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  earningsBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  earningsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  shiftDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shiftDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
