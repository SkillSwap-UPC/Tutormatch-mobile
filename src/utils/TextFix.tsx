// src/utils/TextFix.tsx (Updated version)
import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

// Create a wrapper component instead of modifying the original
const Text = (props: TextProps) => {
  // Pass allowFontScaling as a prop directly rather than modifying defaultProps
  return <RNText {...props} allowFontScaling={props.allowFontScaling ?? false} />;
};

export { Text };

// Export a function that can be called from App.tsx
export default function initializeTextComponent() {
  // No modifications to the original RNText component here
  console.log('Text component initialized');
  return null;
}