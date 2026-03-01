import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { useSettings } from '@app/context/SettingsContext';
import { FontSizeOptions, type FontSizeKey } from '@app/theme/typography';

export default function SettingsScreen() {
  const { colors, fontSizes, theme, fontSize, toggleTheme, setFontSize, setApiKey, getApiKey, clearApiKey } =
    useSettings();

  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiSaved, setOpenaiSaved] = useState(false);
  const [anthropicSaved, setAnthropicSaved] = useState(false);

  useEffect(() => {
    getApiKey('openai').then((k) => { if (k) { setOpenaiKey('••••••••'); setOpenaiSaved(true); } });
    getApiKey('anthropic').then((k) => { if (k) { setAnthropicKey('••••••••'); setAnthropicSaved(true); } });
  }, [getApiKey]);

  const handleSaveKey = async (provider: 'openai' | 'anthropic', key: string) => {
    if (!key.trim() || key === '••••••••') return;
    await setApiKey(provider, key.trim());
    if (provider === 'openai') setOpenaiSaved(true);
    else setAnthropicSaved(true);
    Alert.alert('Saved', `${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key saved securely.`);
  };

  const handleClearKey = async (provider: 'openai' | 'anthropic') => {
    await clearApiKey(provider);
    if (provider === 'openai') { setOpenaiKey(''); setOpenaiSaved(false); }
    else { setAnthropicKey(''); setAnthropicSaved(false); }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.heading, { color: colors.text, fontSize: fontSizes.heading }]}>Settings</Text>

      {/* Theme */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.body }]}>Appearance</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.body }]}>Dark Mode</Text>
          <Switch value={theme === 'dark'} onValueChange={toggleTheme} trackColor={{ true: colors.primary }} />
        </View>
      </View>

      {/* Font Size */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.body }]}>Font Size</Text>
        <View style={styles.sizeRow}>
          {FontSizeOptions.map((size) => (
            <Pressable
              key={size}
              onPress={() => setFontSize(size)}
              style={[
                styles.sizeButton,
                {
                  backgroundColor: fontSize === size ? colors.primary : colors.inputBackground,
                  borderColor: fontSize === size ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sizeButtonText,
                  {
                    color: fontSize === size ? colors.primaryText : colors.text,
                    fontSize: fontSizes.caption,
                  },
                ]}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* API Keys */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.body }]}>API Keys</Text>
        <Text style={[styles.caption, { color: colors.textSecondary, fontSize: fontSizes.caption }]}>
          Stored securely on device. Required for voice commands.
        </Text>

        <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.caption, marginTop: 12 }]}>
          OpenAI API Key {openaiSaved && '(saved)'}
        </Text>
        <View style={styles.keyRow}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border, fontSize: fontSizes.caption },
            ]}
            value={openaiKey}
            onChangeText={setOpenaiKey}
            placeholder="sk-..."
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={() => handleSaveKey('openai', openaiKey)}
          >
            <Text style={[styles.saveButtonText, { color: colors.primaryText }]}>Save</Text>
          </Pressable>
          {openaiSaved && (
            <Pressable onPress={() => handleClearKey('openai')} style={styles.clearButton}>
              <Text style={{ color: colors.danger, fontSize: fontSizes.caption }}>Clear</Text>
            </Pressable>
          )}
        </View>

        <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.caption, marginTop: 12 }]}>
          Anthropic API Key {anthropicSaved && '(saved)'}
        </Text>
        <View style={styles.keyRow}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border, fontSize: fontSizes.caption },
            ]}
            value={anthropicKey}
            onChangeText={setAnthropicKey}
            placeholder="sk-ant-..."
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={() => handleSaveKey('anthropic', anthropicKey)}
          >
            <Text style={[styles.saveButtonText, { color: colors.primaryText }]}>Save</Text>
          </Pressable>
          {anthropicSaved && (
            <Pressable onPress={() => handleClearKey('anthropic')} style={styles.clearButton}>
              <Text style={{ color: colors.danger, fontSize: fontSizes.caption }}>Clear</Text>
            </Pressable>
          )}
        </View>
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
  caption: { marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  label: { fontWeight: '500' },
  sizeRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  sizeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  sizeButtonText: { fontWeight: '500' },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  saveButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveButtonText: { fontWeight: '600' },
  clearButton: { paddingHorizontal: 8, paddingVertical: 8 },
});
