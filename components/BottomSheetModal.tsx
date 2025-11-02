import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  background: '#E8E5E0',
  cardBg: '#FFFFFF',
  darkCard: '#1A1A1A',
  primary: '#FF5555',
  textPrimary: '#1A1A1A',
  textSecondary: '#8E8E93',
} as const;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: number; // Optional custom height
}

export default function BottomSheetModal({
  visible,
  onClose,
  title,
  children,
  height = SCREEN_HEIGHT * 0.5, // Default to 50% of screen height
}: BottomSheetModalProps) {
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    if (visible) {
      // Slide up
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      // Slide down
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, height, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    height,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {/* Handle bar */}
                <View style={styles.handleBar} />

                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Feather name="x" size={24} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>{children}</View>
              </Animated.View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34, // Safe area bottom padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textSecondary,
    opacity: 0.3,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});


















