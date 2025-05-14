import { Text, TextInput } from 'react-native';

// Simple polyfill for Text component
if (Text.defaultProps === undefined) {
  Text.defaultProps = {};
}
Text.defaultProps.allowFontScaling = false;

// Also fix TextInput if needed
if (TextInput.defaultProps === undefined) {
  TextInput.defaultProps = {};
}
TextInput.defaultProps.allowFontScaling = false;