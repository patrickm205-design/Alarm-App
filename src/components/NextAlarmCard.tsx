import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { Colors, Font, Radius, Spacing } from '../theme';
import { BuddyBadge } from './BuddyBadge';
import type { ResolvedAlarm } from '../data/schema';

interface Props {
  alarm: ResolvedAlarm;
}

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const pad = (n: number) => n.toString().padStart(2, '0');

/**
 * ─────────────────────────────────────────────────────────────
 *  NEXT ALARM  –  the hero card that lives at the top of the
 *  Home screen.
 *
 *  Design decisions
 *  • Rich purple linear-gradient as the surface.
 *  • Two large, semi-transparent decorative circles give depth
 *    without adding visual noise.
 *  • An ambient glow layer *behind* the card pulses its opacity
 *    via react-native-reanimated – on iOS the shadow turns that
 *    into a proper coloured bloom; on Android the coloured shape
 *    itself provides the effect.
 *  • A live countdown ticks every second using plain React state
 *    (no reanimated needed for a simple number).
 * ─────────────────────────────────────────────────────────────
 */
export function NextAlarmCard({ alarm }: Props) {
  // ── live countdown ──────────────────────────────────────────
  const [seconds, setSeconds] = useState(alarm.secondsUntil);

  useEffect(() => {
    setSeconds(alarm.secondsUntil);
    const id = setInterval(
      () => setSeconds((prev) => Math.max(0, prev - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [alarm.secondsUntil]);

  // ── pulsing glow ────────────────────────────────────────────
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 2200 }),
        withTiming(0.25, { duration: 2200 })
      ),
      -1 // infinite
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // ── derived display values ──────────────────────────────────
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const repeatLabel =
    alarm.repeatDays.length > 0
      ? alarm.repeatDays.map((d) => DAY_NAMES[d]).join(' · ')
      : null;

  // ── render ──────────────────────────────────────────────────
  return (
    <View style={styles.wrapper}>
      {/* coloured glow behind the card */}
      <Animated.View style={[styles.ambientGlow, glowStyle]} />

      <LinearGradient
        colors={Colors.gradientDeep}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* decorative circles */}
        <View style={[styles.decor, styles.decorTR]} />
        <View style={[styles.decor, styles.decorBL]} />

        {/* ── content ── */}
        <View style={styles.content}>
          {/* header row */}
          <View style={styles.headerRow}>
            <Text style={styles.nextLabel}>NEXT ALARM</Text>

            {alarm.safetyNet && (
              <View style={styles.safetyBadge}>
                <Text style={styles.safetyBadgeText}>⛑ Safety Net</Text>
              </View>
            )}
          </View>

          {/* large time */}
          <Text style={styles.time}>{alarm.formattedTime}</Text>
          <Text style={styles.label}>{alarm.label}</Text>

          {/* repeat days (if any) */}
          {repeatLabel && (
            <Text style={styles.repeatLabel}>{repeatLabel}</Text>
          )}

          {/* divider */}
          <View style={styles.divider} />

          {/* footer: countdown left, buddies right */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.countdownCap}>REMAINING</Text>
              <Text style={styles.countdown}>
                {pad(hrs)}h {pad(mins)}m {pad(secs)}s
              </Text>
            </View>

            {alarm.buddies.length > 0 && (
              <View style={styles.buddyRow}>
                {alarm.buddies.map((b, i) => (
                  <BuddyBadge key={b.id} buddy={b} index={i} size={30} />
                ))}
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ─── styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    position: 'relative',
  },

  // ── ambient glow ──
  ambientGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: Radius.xl + 10,
    backgroundColor: '#7C3AED',
    ...Platform.select({
      ios: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 28,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  // ── gradient card ──
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },

  // ── decorative semi-transparent circles ──
  decor: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  decorTR: { width: 160, height: 160, top: -55, right: -45 },
  decorBL: { width: 100, height: 100, bottom: -40, left: -30 },

  // ── content layer (sits above decorations) ──
  content: { position: 'relative', zIndex: 1 },

  // header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  nextLabel: {
    fontSize: Font.xs,
    fontWeight: Font.semibold,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2,
  },
  safetyBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: 'rgba(245, 158, 11, 0.40)',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  safetyBadgeText: {
    fontSize: Font.xs,
    fontWeight: Font.semibold,
    color: Colors.warning,
  },

  // time + label
  time: {
    fontSize: Font.hero,
    fontWeight: Font.heavy,
    color: '#FFFFFF',
    lineHeight: Font.hero * 1.1,
  },
  label: {
    fontSize: Font.md,
    fontWeight: Font.medium,
    color: 'rgba(255,255,255,0.72)',
    marginTop: Spacing.xs,
  },
  repeatLabel: {
    fontSize: Font.sm,
    color: 'rgba(255,255,255,0.40)',
    marginTop: 3,
  },

  // divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: Spacing.lg,
  },

  // footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  countdownCap: {
    fontSize: Font.xs,
    fontWeight: Font.semibold,
    color: 'rgba(255,255,255,0.40)',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  countdown: {
    fontSize: Font.md,
    fontWeight: Font.bold,
    color: 'rgba(255,255,255,0.92)',
  },
  buddyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
