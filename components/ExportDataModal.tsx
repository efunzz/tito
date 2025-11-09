import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Import centralized theme and types
import { COLORS } from '../constants/theme';
import type { Shift } from '../constants/types';

interface ExportDataModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ExportDataModal({ visible, onClose }: ExportDataModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    if (selectedPeriod === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      // All time
      startDate = new Date(2000, 0, 1);
    }

    return { startDate, endDate: now };
  };

  const generateHTML = (shifts: Shift[], totalHours: number, totalEarnings: number) => {
    const { startDate, endDate } = getDateRange();
    const periodText = selectedPeriod === 'week' 
      ? 'Last 7 Days' 
      : selectedPeriod === 'month' 
      ? 'Last Month' 
      : 'All Time';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 40px;
              color: #1A1A1A;
            }
            .header {
              margin-bottom: 32px;
              border-bottom: 2px solid #FF5555;
              padding-bottom: 16px;
            }
            h1 {
              font-size: 28px;
              font-weight: 600;
              color: #1A1A1A;
              margin-bottom: 8px;
            }
            .period {
              font-size: 14px;
              color: #8E8E93;
            }
            .info {
              margin-bottom: 32px;
              background: #F5F5F5;
              padding: 16px;
              border-radius: 8px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .info-label {
              color: #8E8E93;
            }
            .info-value {
              font-weight: 600;
              color: #1A1A1A;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            th {
              background: #1A1A1A;
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #E8E5E0;
              font-size: 14px;
            }
            tr:hover {
              background: #F9F9F9;
            }
            .total-row {
              background: #F5F5F5;
              font-weight: 600;
            }
            .total-row td {
              border: none;
              padding: 16px 12px;
            }
            .earnings {
              color: #FF5555;
              font-weight: 700;
            }
            .footer {
              margin-top: 32px;
              text-align: center;
              font-size: 12px;
              color: #8E8E93;
            }
            .no-data {
              text-align: center;
              padding: 40px;
              color: #8E8E93;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Timesheet Report</h1>
            <div class="period">${periodText} • Generated ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="info">
            <div class="info-row">
              <span class="info-label">Employee:</span>
              <span class="info-value">Irfan Sofyan</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Hours:</span>
              <span class="info-value">${totalHours.toFixed(2)} hours</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Earnings:</span>
              <span class="info-value earnings">$${totalEarnings.toFixed(2)}</span>
            </div>
          </div>

          ${shifts.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Hours</th>
                  <th>Rate</th>
                  <th>Earnings</th>
                </tr>
              </thead>
              <tbody>
                ${shifts.map(shift => `
                  <tr>
                    <td>${shift.date}</td>
                    <td>${shift.clockIn}</td>
                    <td>${shift.clockOut || '-'}</td>
                    <td>${shift.totalHours.toFixed(2)}h</td>
                    <td>$${shift.hourlyRate}/hr</td>
                    <td class="earnings">$${shift.earnings.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div class="no-data">No shifts found for this period</div>
          `}

          <div class="footer">
            Generated by Tito • Time Tracking App
          </div>
        </body>
      </html>
    `;
  };

  const handleExport = async () => {
    try {
      setIsGenerating(true);

      // 1. Load shifts from AsyncStorage
      const savedShifts = await AsyncStorage.getItem('shifts');
      if (!savedShifts) {
        Alert.alert('No Data', 'No shifts found to export');
        setIsGenerating(false);
        return;
      }

      const allShifts: Shift[] = JSON.parse(savedShifts);

      // 2. Filter by selected date range
      const { startDate, endDate } = getDateRange();
      const filteredShifts = allShifts.filter(shift => {
        const shiftDate = new Date(shift.date);
        return shiftDate >= startDate && shiftDate <= endDate;
      });

      if (filteredShifts.length === 0) {
        Alert.alert('No Data', 'No shifts found for this period');
        setIsGenerating(false);
        return;
      }

      // 3. Calculate totals
      const totalHours = filteredShifts.reduce((sum, shift) => sum + shift.totalHours, 0);
      const totalEarnings = filteredShifts.reduce((sum, shift) => sum + shift.earnings, 0);

      // 4. Generate HTML
      const html = generateHTML(filteredShifts, totalHours, totalEarnings);

      // 5. Create PDF
      const { uri } = await Print.printToFileAsync({ html });

      // 6. Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device');
        setIsGenerating(false);
        return;
      }

      // 7. Share the PDF
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Timesheet',
        UTI: 'com.adobe.pdf',
      });

      setIsGenerating(false);
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Export Timesheet" height={380}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Select time period to export</Text>

        {/* Period Options */}
        <View style={styles.periodOptions}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'week' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Feather 
              name="calendar" 
              size={20} 
              color={selectedPeriod === 'week' ? '#FFFFFF' : COLORS.textPrimary} 
            />
            <Text style={[
              styles.periodText,
              selectedPeriod === 'week' && styles.periodTextActive,
            ]}>
              Last 7 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'month' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Feather 
              name="calendar" 
              size={20} 
              color={selectedPeriod === 'month' ? '#FFFFFF' : COLORS.textPrimary} 
            />
            <Text style={[
              styles.periodText,
              selectedPeriod === 'month' && styles.periodTextActive,
            ]}>
              Last Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'all' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('all')}
          >
            <Feather 
              name="clock" 
              size={20} 
              color={selectedPeriod === 'all' ? '#FFFFFF' : COLORS.textPrimary} 
            />
            <Text style={[
              styles.periodText,
              selectedPeriod === 'all' && styles.periodTextActive,
            ]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Feather name="info" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            PDF will include all shifts, hours worked, and earnings for the selected period.
          </Text>
        </View>

        {/* Export Button */}
        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={handleExport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.exportButtonText}>Generating PDF...</Text>
            </>
          ) : (
            <>
              <Feather name="download" size={20} color="#FFFFFF" />
              <Text style={styles.exportButtonText}>Export as PDF</Text>
            </>
          )}
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
  periodOptions: {
    gap: 12,
    marginBottom: 24,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});