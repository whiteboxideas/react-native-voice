import React from 'react';
import { VoiceButton } from './VoiceButton';
import { VoiceBubble } from './VoiceBubble';

interface VoiceUITheme {
  primary?: string;
  surface?: string;
  text?: string;
  danger?: string;
}

interface VoiceUIProps {
  /** Quick theme — maps to VoiceButton + VoiceBubble color props */
  theme?: VoiceUITheme;
  /** VoiceButton size */
  buttonSize?: number;
  /** VoiceButton bottom offset */
  buttonBottom?: number;
  /** VoiceButton right offset */
  buttonRight?: number;
}

export function VoiceUI({
  theme,
  buttonSize,
  buttonBottom,
  buttonRight,
}: VoiceUIProps) {
  return (
    <>
      <VoiceBubble
        backgroundColor={theme?.surface}
        textColor={theme?.text}
        accentColor={theme?.primary}
      />
      <VoiceButton
        color={theme?.primary}
        activeColor={theme?.danger}
        size={buttonSize}
        bottom={buttonBottom}
        right={buttonRight}
      />
    </>
  );
}
