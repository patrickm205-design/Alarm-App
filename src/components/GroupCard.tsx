import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Font, Radius, Spacing } from '../theme';
import { BuddyBadge } from './BuddyBadge';
import type { ResolvedGroup } from '../data/schema';

interface Props {
  group: ResolvedGroup;
  /** Gradient pair pulled from the theme palette. */
  gradient: [string, string];
  onPress?: () => void;
}

/**
 * Compact card shown in the horizontal "My Groups" scroll row.
 *
 * Layout
 * ──────
 *  ┌─────────────────┐
 *  │  🏔              │  ← emoji (large)
 *  │  Weekend Hikers  │  ← name
 *  │  ○○○○  4 members │  ← buddy strip + count
 *  │  ─────────────── │
 *  │  Next: 7:00 AM   │  ← soonest group alarm (optional)
 *  └─────────────────┘
 */
export function GroupCard({ group, gradient, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={styles.card}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* decorative circle */}
        <View style={styles.decorCircle} />

        <View style={styles.content}>
          {/* emoji */}
          <Text style={styles.emoji}>{group.emoji}</Text>

          {/* name */}
          <Text style={styles.name}>{group.name}</Text>

          {/* member avatars + count */}
          <View style={styles.memberRow}>
            <View style={styles.avatarCluster}>
              {group.members.slice(0, 3).map((m, i) => (
                <BuddyBadge key={m.id} buddy={m} index={i} size={22} />
              ))}
            </View>
            <Text style={styles.memberCount}>
              {group.members.length} members
            </Text>
          </View>

          {/* next alarm (if present) */}
          {group.nextAlarm && (
            <>
              <View style={styles.divider} />
              <Text style={styles.nextAlarmLabel}>Next alarm</Text>
              <Text style={styles.nextAlarmTime}>
                {group.nextAlarm.formattedTime}
              </Text>
            </>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: Spacing.md,
    borderRadius: Radius.card,
    overflow: 'hidden',
    flexShrink: 0,
  },
  gradient: {
    flex: 1,
    borderRadius: Radius.card,
    position: 'relative',
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -30,
    right: -25,
  },

  content: {
    position: 'relative',
    zIndex: 1,
    padding: Spacing.lg,
  },

  emoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: Font.md,
    fontWeight: Font.bold,
    color: Colors.textPrimary,
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  avatarCluster: {
    flexDirection: 'row',
    marginRight: Spacing.sm,
  },
  memberCount: {
    fontSize: Font.xs,
    color: 'rgba(255,255,255,0.55)',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  nextAlarmLabel: {
    fontSize: Font.xs,
    fontWeight: Font.semibold,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nextAlarmTime: {
    fontSize: Font.sm,
    fontWeight: Font.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
});
