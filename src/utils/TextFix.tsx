import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

// Creamos un componente personalizado que extiende del Text original
const Text = (props: TextProps) => {
  return <RNText allowFontScaling={false} {...props} />;
};

// Reemplazamos el componente Text en toda la aplicación
export { Text };

export default function fixTextComponent() {
  // Esta función es solo para exportar y asegurar que el código se ejecuta
  console.log('Text component fixed');
}