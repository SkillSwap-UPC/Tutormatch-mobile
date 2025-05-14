import { Text } from 'react-native';

// Esta es la forma correcta de configurar defaultProps
if (Text) {
  if (!Text.defaultProps) {
    Text.defaultProps = {};
  }
  if (Text.defaultProps) {
    Text.defaultProps.allowFontScaling = true;
  }
}

// Exporta un componente Text mejorado
const SafeText = (props) => <Text allowFontScaling={true} {...props} />;

export default SafeText;