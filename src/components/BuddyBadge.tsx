import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { User } from '../data/schema';

interface Props {
  buddy: User;
  /** Render index – drives the horizontal overlap offset & z-order. */
  index: number;
  size?: number;
}

/**
 * Circular avatar that shows the buddy's first initial on their
 * accent colour.  Later badges overlap earlier ones so the stack
 * reads left-to-right.
 */
export function BuddyBadge({ buddy, index, size = 34 }: Props) {
  const initial = buddy.displayName.charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: buddy.avatarColor,
          marginLeft: index > 0 ? -(size * 0.28) : 0,
          zIndex: 10 - index, // first badge on top
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.38 }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#0A0A0F', // matches Colors.bg – keeps the gap crisp
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
});
