import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';

/**
 * Root entry-point.
 *
 * State machine
 * ─────────────
 *   isAuthenticated = false  →  OnboardingScreen
 *   isAuthenticated = true   →  HomeScreen (entrance anim handled internally)
 *
 * GestureHandlerRootView is required at the top of the tree when
 * react-native-reanimated is used.
 */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.root}>
        {isAuthenticated ? (
          <HomeScreen />
        ) : (
          <OnboardingScreen onComplete={() => setIsAuthenticated(true)} />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
});
