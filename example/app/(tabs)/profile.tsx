import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSettings } from '@app/context/SettingsContext';

export default function ProfileScreen() {
  const { colors, fontSizes } = useSettings();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.heading, { color: colors.text, fontSize: fontSizes.heading }]}>Profile</Text>

      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={[styles.avatarText, { color: colors.primaryText }]}>U</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.body }]}>User Info</Text>
        <Text style={[styles.cardBody, { color: colors.textSecondary, fontSize: fontSizes.caption }]}>
          Name: Demo User
        </Text>
        <Text style={[styles.cardBody, { color: colors.textSecondary, fontSize: fontSizes.caption }]}>
          Email: demo@example.com
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.body }]}>Preferences</Text>
        <Text style={[styles.cardBody, { color: colors.textSecondary, fontSize: fontSizes.caption }]}>
          This is a placeholder profile screen. In a real app, this would display user account
          details and preferences.
        </Text>
      </View>

      <Text style={[styles.hint, { color: colors.textSecondary, fontSize: fontSizes.caption }]}>
        Try saying "go to settings" or "turn on dark mode"
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 120, alignItems: 'center' },
  heading: { fontWeight: '700', marginBottom: 20, alignSelf: 'flex-start' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarText: { fontSize: 32, fontWeight: '700' },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  cardTitle: { fontWeight: '600', marginBottom: 8 },
  cardBody: { marginBottom: 4 },
  hint: { marginTop: 20, fontStyle: 'italic', textAlign: 'center' },
});
