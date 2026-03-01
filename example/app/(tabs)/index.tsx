import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSettings } from '@app/context/SettingsContext';

export default function HomeScreen() {
  const { colors, fontSizes, theme, fontSize } = useSettings();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.heading, { color: colors.text, fontSize: fontSizes.heading }]}>
        Voice Command Demo
      </Text>

      <Text style={[styles.body, { color: colors.textSecondary, fontSize: fontSizes.body }]}>
        Tap the mic button to start a voice command. This app demonstrates voice-controlled
        settings and navigation.
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.body }]}>
          Current State
        </Text>
        <Text style={[styles.cardBody, { color: colors.textSecondary, fontSize: fontSizes.caption }]}>
          Theme: {theme}
        </Text>
        <Text style={[styles.cardBody, { color: colors.textSecondary, fontSize: fontSizes.caption }]}>
          Font Size: {fontSize}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.body }]}>
          Try Saying...
        </Text>
        {[
          '"Turn on dark mode"',
          '"Make the text bigger"',
          '"Go to settings"',
          '"What are my current settings?"',
          '"Set font size to large"',
          '"Navigate to profile"',
        ].map((example, i) => (
          <Text
            key={i}
            style={[styles.example, { color: colors.primary, fontSize: fontSizes.caption }]}
          >
            {example}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  heading: { fontWeight: '700', marginBottom: 12 },
  body: { lineHeight: 24, marginBottom: 20 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontWeight: '600', marginBottom: 8 },
  cardBody: { marginBottom: 4 },
  example: { marginBottom: 6, fontStyle: 'italic' },
});
