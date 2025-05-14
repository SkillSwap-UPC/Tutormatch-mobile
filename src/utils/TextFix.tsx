// src/utils/TextFix.tsx
import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

// Create a safe wrapper for Text component
export const Text: React.FC<TextProps> = (props) => {
  // Destructure props with fallbacks for everything that might be undefined
  const { 
    style, 
    children, 
    onPress,
    // Explicitly ignore allowFontScaling that's causing problems
    allowFontScaling: _,
    ...restProps 
  } = props || {};

  // Always return the text with explicit allowFontScaling=false
  return (
    <RNText
      {...restProps}
      style={style}
      onPress={onPress}
      allowFontScaling={false}
    >
      {children}
    </RNText>
  );
};

// For convenience, also re-export as default
export default Text;