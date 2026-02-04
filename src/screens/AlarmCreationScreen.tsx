import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Font, Radius, Spacing } from '../theme';
import { MOCK_USERS } from '../data/mockData';

// ─── public interface ───────────────────────────────────────────

/** Shape handed back to the parent when "Create" is tapped. */
export interface NewAlarmPayload {
  label: string;
  hour: number;
  minute: number;
  safetyNet: boolean;
  buddyIds: string[];
  repeatDays: number[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (payload: NewAlarmPayload) => void;
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * ─────────────────────────────────────────────────────────────
 *  ALARM CREATION  –  bottom-sheet modal.
 *
 *  Design notes
 *  ────────────
 *  • Slides up with a spring curve; backdrop fades in behind it.
 *  • Time is edited via +/− chevron columns (avoids pulling in a
 *    native picker dependency).
 *  • Safety Net toggle conditionally reveals the buddy list.
 *  • Repeat days are pill buttons that toggle on/off.
 *  • The "Create" CTA at the bottom uses the primary gradient.
 * ─────────────────────────────────────────────────────────────
 */
export function AlarmCreationScreen({ visible, onClose, onCreate }: Props) {
  // ── form state ──────────────────────────────────────────────
  const [label, setLabel] = useState('');
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [safetyNet, setSafetyNet] = useState(false);
  const [buddyIds, setBuddyIds] = useState<string[]>([]);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setLabel('');
      setHour(7);
      setMinute(0);
      setSafetyNet(false);
      setBuddyIds([]);
      setRepeatDays([]);
    }
  }, [visible]);

  // ── sheet slide animation ───────────────────────────────────
  const sheetY = useSharedValue(visible ? 0 : 820);
  const backdropOp = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    sheetY.value = withSpring(visible ? 0 : 820, {
      damping: 22,
      stiffness: 140,
    });
    backdropOp.value = withSpring(visible ? 0.55 : 0, {
      damping: 20,
      stiffness: 100,
    });
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOp.value,
  }));

  // ── helpers ─────────────────────────────────────────────────
  const toggleDay = (d: number) =>
    setRepeatDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const toggleBuddy = (id: string) =>
    setBuddyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleCreate = () => {
    onCreate({ label: label || 'My Alarm', hour, minute, safetyNet, buddyIds, repeatDays });
    onClose();
  };

  const buddyList = Object.values(MOCK_USERS).filter((u) => u.id !== 'u_self');

  // ── render ──────────────────────────────────────────────────
  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      {/* backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* sheet */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* drag handle */}
        <View style={styles.handle} />

        {/* header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>New Alarm</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.sheetScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── time picker ── */}
          <View style={styles.timePicker}>
            <TimeColumn value={hour} onChange={setHour} max={23} />
            <Text style={styles.timeColon}>:</Text>
            <TimeColumn value={minute} onChange={setMinute} max={59} />
            <Text style={styles.ampm}>
              {hour >= 12 ? 'PM' : 'AM'}
            </Text>
          </View>

          {/* ── label ── */}
          <Section label="Label">
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Morning Grind"
              placeholderTextColor={Colors.textTertiary}
              maxLength={40}
            />
          </Section>

          {/* ── repeat days ── */}
          <Section label="Repeat">
            <View style={styles.dayRow}>
              {DAY_LABELS.map((name, i) => {
                const on = repeatDays.includes(i);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => toggleDay(i)}
                    style={[styles.dayPill, on && styles.dayPillOn]}
                  >
                    <Text style={[styles.dayText, on && styles.dayTextOn]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          {/* ── safety net toggle ── */}
          <Section label="">
            <TouchableOpacity
              onPress={() => setSafetyNet((v) => !v)}
              style={styles.toggleRow}
            >
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>⛑ Safety Net</Text>
                <Text style={styles.toggleDesc}>
                  Notify buddies if alarm isn't dismissed
                </Text>
              </View>
              <View style={[styles.toggle, safetyNet && styles.toggleOn]}>
                <View
                  style={[styles.toggleThumb, safetyNet && styles.toggleThumbOn]}
                />
              </View>
            </TouchableOpacity>
          </Section>

          {/* ── buddy selector (only when safety net is on) ── */}
          {safetyNet && (
            <Section label="Buddies">
              {buddyList.map((buddy) => {
                const sel = buddyIds.includes(buddy.id);
                return (
                  <TouchableOpacity
                    key={buddy.id}
                    onPress={() => toggleBuddy(buddy.id)}
                    style={[styles.buddyRow, sel && styles.buddyRowSel]}
                  >
                    <View
                      style={[
                        styles.buddyAvatar,
                        { backgroundColor: buddy.avatarColor },
                      ]}
                    >
                      <Text style={styles.buddyAvatarText}>
                        {buddy.displayName.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.buddyName}>{buddy.displayName}</Text>
                    {sel && (
                      <Ionicons name="checkmark" size={18} color={Colors.success} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </Section>
          )}

          {/* bottom spacer */}
          <View style={{ height: 24 }} />
        </ScrollView>

        {/* ── create button (pinned) ── */}
        <View style={styles.createWrapper}>
          <TouchableOpacity onPress={handleCreate} style={styles.createBtn}>
            <LinearGradient
              colors={Colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createGradient}
            >
              <Text style={styles.createText}>Create Alarm</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ─── reusable section wrapper ───────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      {label ? <Text style={styles.sectionLabel}>{label}</Text> : null}
      {children}
    </View>
  );
}

// ─── time column (+/− spinner) ──────────────────────────────────

function TimeColumn({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  const inc = () => onChange((value + 1) % (max + 1));
  const dec = () => onChange((value - 1 + max + 1) % (max + 1));

  return (
    <View style={styles.timeCol}>
      <TouchableOpacity onPress={inc} style={styles.timeArrow} hitSlop={8}>
        <Ionicons name="chevron-up" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.timeValue}>{value.toString().padStart(2, '0')}</Text>

      <TouchableOpacity onPress={dec} style={styles.timeArrow} hitSlop={8}>
        <Ionicons name="chevron-down" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

// ─── styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 1,
  },

  // sheet
  sheet: {
    ...StyleSheet.absoluteFillObject,
    top: '25%',
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    zIndex: 2,
    // subtle top border for definition
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.glassBorder,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: Font.xl,
    fontWeight: Font.heavy,
    color: Colors.textPrimary,
  },
  sheetScroll: {
    flex: 1,
  },

  // ── time picker ──
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  timeCol: {
    alignItems: 'center',
    width: 60,
  },
  timeArrow: {
    paddingVertical: Spacing.sm,
  },
  timeValue: {
    fontSize: Font.xxxl,
    fontWeight: Font.heavy,
    color: Colors.textPrimary,
    width: 56,
    textAlign: 'center',
  },
  timeColon: {
    fontSize: Font.xxxl,
    fontWeight: Font.heavy,
    color: Colors.textSecondary,
    marginHorizontal: 2,
  },
  ampm: {
    fontSize: Font.lg,
    fontWeight: Font.bold,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },

  // ── sections ──
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Font.xs,
    fontWeight: Font.semibold,
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },

  // ── input ──
  input: {
    height: 50,
    borderRadius: Radius.card,
    backgroundColor: Colors.glassBg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: Spacing.lg,
    fontSize: Font.md,
    fontWeight: Font.semibold,
    color: Colors.textPrimary,
  },

  // ── repeat days ──
  dayRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayPill: {
    flex: 1,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.glassBg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillOn: {
    backgroundColor: 'rgba(124, 58, 237, 0.20)',
    borderColor: Colors.gradientPrimary[0],
  },
  dayText: {
    fontSize: Font.sm,
    fontWeight: Font.semibold,
    color: Colors.textSecondary,
  },
  dayTextOn: {
    color: Colors.textPrimary,
  },

  // ── safety net toggle ──
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glassBg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radius.card,
    padding: Spacing.md,
  },
  toggleLeft: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: Font.md,
    fontWeight: Font.semibold,
    color: Colors.textPrimary,
  },
  toggleDesc: {
    fontSize: Font.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.glassBg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: Colors.gradientPrimary[0],
    borderColor: Colors.gradientPrimary[0],
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.textSecondary,
  },
  toggleThumbOn: {
    backgroundColor: '#FFFFFF',
    marginLeft: 'auto',
  },

  // ── buddy list ──
  buddyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: 2,
  },
  buddyRowSel: {
    backgroundColor: 'rgba(124, 58, 237, 0.10)',
  },
  buddyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  buddyAvatarText: {
    fontSize: Font.md,
    fontWeight: Font.bold,
    color: '#FFFFFF',
  },
  buddyName: {
    flex: 1,
    fontSize: Font.md,
    fontWeight: Font.medium,
    color: Colors.textPrimary,
  },

  // ── create button ──
  createWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  createBtn: {
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  createGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  createText: {
    fontSize: Font.lg,
    fontWeight: Font.bold,
    color: '#FFFFFF',
  },
});
