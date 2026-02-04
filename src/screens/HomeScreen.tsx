import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Colors, Font, Radius, Spacing } from '../theme';
import { NextAlarmCard } from '../components/NextAlarmCard';
import { AlarmListItem } from '../components/AlarmListItem';
import { GroupCard } from '../components/GroupCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { AlarmCreationScreen } from './AlarmCreationScreen';
import {
  getResolvedAlarms,
  getResolvedGroups,
} from '../data/mockData';
import type { ResolvedAlarm, ResolvedGroup } from '../data/schema';

// ─── gradient palette rotated across group cards ─────────────────
const GROUP_GRADIENTS: [string, string][] = [
  ['#7C3AED', '#6366F1'],
  ['#EC4899', '#A855F7'],
  ['#10B981', '#059669'],
  ['#F59E0B', '#D97706'],
  ['#F97316', '#EC4899'],
];

/**
 * ─────────────────────────────────────────────────────────────
 *  HOME SCREEN  –  the main dashboard.
 *
 *  Layout (top → bottom)
 *  ─────────────────────
 *   1.  Status-bar-safe greeting + avatar
 *   2.  NextAlarmCard   (hero – gradient, glow, live countdown)
 *   3.  "Today" list    (glassmorphism AlarmListItem rows)
 *   4.  "My Groups"     (horizontal scroll of GroupCards)
 *   5.  FloatingActionButton → opens AlarmCreationScreen modal
 *
 *  Entrance animation
 *  ───────────────────
 *  The whole screen fades + slides up once on mount so the
 *  transition from Onboarding feels fluid.
 * ─────────────────────────────────────────────────────────────
 */
export function HomeScreen() {
  // ── data ──────────────────────────────────────────────────
  const [alarms, setAlarms] = useState<ResolvedAlarm[]>([]);
  const [groups, setGroups] = useState<ResolvedGroup[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setAlarms(getResolvedAlarms());
    setGroups(getResolvedGroups());
  }, []);

  // ── entrance animation ────────────────────────────────────
  const enterY = useSharedValue(36);
  const enterOp = useSharedValue(0);

  useEffect(() => {
    enterY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    enterOp.value = withTiming(1, { duration: 600 });
  }, []);

  const enterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: enterY.value }],
    opacity: enterOp.value,
  }));

  // ── derived ───────────────────────────────────────────────
  const nextAlarm = alarms[0] ?? null; // already sorted soonest-first
  const restAlarms = alarms.slice(1);  // everything after the hero

  // ── greeting ──────────────────────────────────────────────
  const greeting = getGreeting();

  // ── render ────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.root, enterStyle]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── top bar ── */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingSmall}>{greeting}</Text>
            <Text style={styles.greetingName}>Alex</Text>
          </View>
          {/* avatar circle */}
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>A</Text>
          </View>
        </View>

        {/* ── hero: next alarm ── */}
        {nextAlarm && <NextAlarmCard alarm={nextAlarm} />}

        {/* ── today's alarms ── */}
        {restAlarms.length > 0 && (
          <>
            <SectionHeader title="Today" />
            {restAlarms.map((a) => (
              <AlarmListItem key={a.id} alarm={a} />
            ))}
          </>
        )}

        {/* ── my groups ── */}
        {groups.length > 0 && (
          <>
            <SectionHeader title="My Groups" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.groupScroll}
              contentContainerStyle={styles.groupScrollContent}
            >
              {groups.map((g, i) => (
                <GroupCard
                  key={g.id}
                  group={g}
                  gradient={GROUP_GRADIENTS[i % GROUP_GRADIENTS.length]}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* bottom padding so FAB doesn't cover content */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── floating action button ── */}
      <FloatingActionButton onPress={() => setModalOpen(true)} />

      {/* ── alarm creation modal ── */}
      <AlarmCreationScreen
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(newAlarm) => {
          // In a real app you'd persist & re-fetch.
          // Here we just close the modal.
          setModalOpen(false);
        }}
      />
    </Animated.View>
  );
}

// ─── small helpers ──────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
  },

  // ── top bar ──
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  greetingSmall: {
    fontSize: Font.sm,
    color: Colors.textTertiary,
    fontWeight: Font.medium,
  },
  greetingName: {
    fontSize: Font.xl,
    fontWeight: Font.heavy,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.gradientPrimary[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: Font.lg,
    fontWeight: Font.bold,
    color: '#FFFFFF',
  },

  // ── section header ──
  sectionHeader: {
    fontSize: Font.sm,
    fontWeight: Font.semibold,
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },

  // ── group horizontal scroll ──
  groupScroll: {
    marginBottom: Spacing.lg,
  },
  groupScrollContent: {
    paddingHorizontal: Spacing.xl,
  },
});
