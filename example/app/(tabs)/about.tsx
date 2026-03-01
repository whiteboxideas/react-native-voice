import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSettings } from '@app/context/SettingsContext';

export default function AboutScreen() {
  const { colors, fontSizes } = useSettings();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.heading, { color: colors.text, fontSize: fontSizes.heading }]}>About</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.body }]}>
          Voice Command UX Library
        </Text>
        <Text style={[styles.cardBody, { color: colors.textSecondary, fontSize: fontSizes.caption }]}>
          Version 1.0.0
        </Text>
        <Text style={[styles.cardBody, { color: colors.textSecondary, fontSize: fontSizes.body, marginTop: 8 }]}>
          A modular voice command library for React Native apps. This demo showcases voice-controlled
          navigation, theme switching, and font size adjustment.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.body }]}>Architecture</Text>
        {[
          ['STT', 'OpenAI Whisper API'],
          ['LLM', 'OpenAI GPT-4o-mini or Anthropic Claude'],
          ['TTS', 'Expo Speech (on-device)'],
          ['State', 'React Context + AsyncStorage'],
          ['Routing', 'Expo Router (file-based)'],
          ['Security', 'API keys in expo-secure-store'],
        ].map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.primary, fontSize: fontSizes.caption }]}>
              {label}
            </Text>
            <Text style={[styles.rowValue, { color: colors.text, fontSize: fontSizes.caption }]}>
              {value}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.body }]}>
          Library Module
        </Text>
        <Text style={[styles.cardBody, { color: colors.textSecondary, fontSize: fontSizes.body }]}>
          The voice-ux module (src/voice-ux/) is designed for extraction as a standalone library.
          It has zero dependencies on app-specific code — all dependency flows one way.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  heading: { fontWeight: '700', marginBottom: 16 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontWeight: '600', marginBottom: 8 },
  cardBody: { marginBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 6 },
  rowLabel: { fontWeight: '600', width: 80 },
  rowValue: { flex: 1 },
});
