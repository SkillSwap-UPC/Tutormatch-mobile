import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const Footer = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image 
              source={require('../../assets/imgs/TutorMatch.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
          </View>
          <Text style={styles.logoText}>TutorMatch</Text>
        </View>
        <Text style={styles.copyright}>© 2025 TutorMatch. All rights reserved.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#d93649',
    paddingVertical: 16,
  },
  container: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrapper: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  logo: {
    height: 24,
    width: 24,
  },
  logoText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  copyright: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
});

export default Footer;