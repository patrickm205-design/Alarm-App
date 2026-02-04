import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Font, Radius, Spacing } from '../theme';
import { BuddyBadge } from './BuddyBadge';
import type { ResolvedAlarm } from '../data/schema';

interface Props {
  alarm: ResolvedAlarm;
  onPress?: () => void;
}

/**
 * A single row in the "Today's Alarms" list.
 *
 * Uses the glassmorphism colour-card treatment:
 *   • semi-transparent white background
 *   • a 1 px border at 8 % white opacity
 *   • a thin coloured left-edge accent strip
 */
export function AlarmListItem({ alarm, onPress }: Props) {
  // Pick an accent colour – rotate through the palette so items
  // aren't all the same colour.
  const accentColor =
    alarm.safetyNet ? Colors.warning : Colors.gradientPrimary[0];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.row}
    >
      {/* left accent strip */}
      <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />

      {/* body */}
      <View style={styles.body}>
        {/* top line: time + safety-net indicator */}
        <View style={styles.topLine}>
          <View style={styles.timeGroup}>
            <Ionicons
              name="alarm-outline"
              size={18}
              color={Colors.textTertiary}
              style={styles.icon}
            />
            <Text style={styles.time}>{alarm.formattedTime}</Text>
          </View>

          {alarm.safetyNet && (
            <Text style={styles.safetyTag}>⛑</Text>
          )}
        </View>

        {/* label */}
        <Text style={styles.label}>{alarm.label}</Text>

        {/* meta row: repeat days + buddy badges */}
        <View style={styles.metaRow}>
          {alarm.repeatDays.length > 0 && (
            <Text style={styles.meta}>
              {alarm.repeatDays
                .map((d) => ['Su','Mo','Tu','We','Th','Fr','Sa'][d])
                .join(' · ')}
            </Text>
          )}
          {alarm.repeatDays.length === 0 && (
            <Text style={styles.meta}>One-time</Text>
          )}

          {alarm.buddies.length > 0 && (
            <View style={styles.buddyRow}>
              {alarm.buddies.map((b, i) => (
                <BuddyBadge key={b.id} buddy={b} index={i} size={22} />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* chevron */}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.textTertiary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.glassBg,
    borderColor: Colors.glassBorder,
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingRight: Spacing.md,
    overflow: 'hidden',
  },

  accentStrip: {
    width: 4,
    alignSelf: 'stretch',
  },

  body: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },

  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  time: {
    fontSize: Font.sm,
    fontWeight: Font.semibold,
    color: Colors.textSecondary,
  },
  safetyTag: {
    fontSize: Font.sm,
  },

  label: {
    fontSize: Font.md,
    fontWeight: Font.semibold,
    color: Colors.textPrimary,
    marginTop: 3,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  meta: {
    fontSize: Font.xs,
    color: Colors.textTertiary,
  },
  buddyRow: {
    flexDirection: 'row',
  },
});
