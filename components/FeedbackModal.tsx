import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// Import centralized theme
import { COLORS } from '../constants/theme';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

export default function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('feature');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const feedbackTypes: { type: FeedbackType; label: string; icon: string }[] = [
    { type: 'bug', label: 'Bug', icon: 'bug' },
    { type: 'feature', label: 'Feature', icon: 'lightbulb-on-outline' },
    { type: 'improvement', label: 'Improvement', icon: 'chart-line' },
    { type: 'other', label: 'Other', icon: 'comment-text-outline' },
  ];

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Insert feedback
      const { error } = await supabase.from('feedback').insert({
        user_id: user?.id || null,
        user_email: user?.email || null,
        feedback_type: feedbackType,
        message: message.trim(),
      });

      if (error) throw error;

      Alert.alert('Success', 'Thank you for your feedback!');
      setMessage('');
      setFeedbackType('feature');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Send Feedback" height={520}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>What type of feedback?</Text>

        {/* Feedback Type Selection */}
        <View style={styles.typeContainer}>
          {feedbackTypes.map((item) => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.typeButton,
                feedbackType === item.type && styles.typeButtonActive,
              ]}
              onPress={() => setFeedbackType(item.type)}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={20}
                color={feedbackType === item.type ? '#FFFFFF' : COLORS.textPrimary}
              />
              <Text
                style={[
                  styles.typeText,
                  feedbackType === item.type && styles.typeTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Your feedback</Text>

        {/* Message Input */}
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Share your thoughts, report a bug, or request a feature..."
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          editable={!loading}
        />

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
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
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    height: 140,
    marginBottom: 24,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
