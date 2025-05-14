// src/utils/patchText.ts
import { Text, TextInput } from 'react-native';

// A safe function to patch Text component that won't cause TypeScript errors at runtime
export function patchReactNativeText() {
  try {
    // @ts-ignore - Access Text.defaultProps even though TypeScript doesn't recognize it
    if (Text && !Text.defaultProps) {
      // @ts-ignore
      Text.defaultProps = {};
    }
    
    // @ts-ignore - Set allowFontScaling to false
    if (Text && Text.defaultProps) {
      // @ts-ignore
      Text.defaultProps.allowFontScaling = false;
    }
    
    // Also patch TextInput for consistency
    // @ts-ignore
    if (TextInput && !TextInput.defaultProps) {
      // @ts-ignore
      TextInput.defaultProps = {};
    }
    
    // @ts-ignore
    if (TextInput && TextInput.defaultProps) {
      // @ts-ignore
      TextInput.defaultProps.allowFontScaling = false;
    }
    
    console.log('Successfully patched React Native Text components');
  } catch (error) {
    console.warn('Failed to patch React Native Text components:', error);
  }
}