import { registerRootComponent } from 'expo';
import { Text } from 'react-native';
import App from './src/App';
import './utils/TextFix';

if (Text) {
  // @ts-ignore - React Native components may have defaultProps
  if (!Text.defaultProps) {
    // @ts-ignore
    Text.defaultProps = {};
  }
  // @ts-ignore
  Text.defaultProps.allowFontScaling = true;
}

// Registra el componente raíz con Expo
registerRootComponent(App);