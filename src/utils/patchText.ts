// src/utils/patchText.ts
import { Text, TextInput } from 'react-native';

export function patchReactNativeText() {
  try {
    if (Text) {
      // @ts-ignore
      if (!Text.defaultProps) {
        // @ts-ignore
        Text.defaultProps = {};
      }
      // @ts-ignore
      Text.defaultProps.allowFontScaling = false;
    }
    
    if (TextInput) {
      // @ts-ignore
      if (!TextInput.defaultProps) {
        // @ts-ignore
        TextInput.defaultProps = {};
      }
      // @ts-ignore
      TextInput.defaultProps.allowFontScaling = false;
    }
    
    console.log('Successfully patched React Native Text components');
  } catch (error) {
    console.warn('Failed to patch React Native Text components:', error);
  }
}