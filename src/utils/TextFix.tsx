// src/utils/TextFix.tsx
import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

// Create a safe wrapper for Text component
export const Text: React.FC<TextProps> = (props) => {
  // Use safe props with defaults
  const safeProps = props || {};

  return (
    <RNText
      {...safeProps}
      allowFontScaling={false}
    >
      {safeProps.children}
    </RNText>
  );
};

export default Text;