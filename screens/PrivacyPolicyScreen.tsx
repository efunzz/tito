import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import centralized theme and types
import { COLORS } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Privacy Policy</Text>

        {/* Spacer to keep title centered */}
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: January 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            Tito is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our time tracking application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect the following information to provide you with our service:
          </Text>
          <Text style={styles.bulletPoint}>• Email address (for account authentication)</Text>
          <Text style={styles.bulletPoint}>• Full name (optional, for personalization)</Text>
          <Text style={styles.bulletPoint}>• Work shift data (clock-in/out times, breaks, hourly rate)</Text>
          <Text style={styles.bulletPoint}>• Earnings calculations and goal settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            Your information is used solely to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide and maintain the Tito service</Text>
          <Text style={styles.bulletPoint}>• Track your work hours and calculate earnings</Text>
          <Text style={styles.bulletPoint}>• Sync your data across your devices</Text>
          <Text style={styles.bulletPoint}>• Send important service notifications</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            Your data is securely stored using Supabase, a trusted cloud database service. We implement industry-standard security measures to protect your information from unauthorized access, alteration, or disclosure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or share your personal information with third parties. Your data is private and belongs to you.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• Access your data at any time</Text>
          <Text style={styles.bulletPoint}>• Export your data (via Profile → Export Data)</Text>
          <Text style={styles.bulletPoint}>• Delete your account and all associated data</Text>
          <Text style={styles.bulletPoint}>• Request corrections to your information</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Deletion</Text>
          <Text style={styles.paragraph}>
            To delete your account and all associated data, please contact us at privacy@titoapp.com. We will process your request within 30 days.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Tito is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contactEmail}>privacy@titoapp.com</Text>
        </View>

        <View style={{ height: 40 }} />
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
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    paddingLeft: 8,
  },
  contactEmail: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 8,
  },
});
