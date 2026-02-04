import type { User, Alarm, Group, ResolvedAlarm, ResolvedGroup } from './schema';

// ─── Seed Users ───────────────────────────────────────────────

export const MOCK_USERS: Record<string, User> = {
  u_self: {
    id: 'u_self',
    phone: '+15550123456',
    displayName: 'Alex',
    avatarColor: '#7C3AED',
    authProvider: 'phone',
    createdAt: '2025-01-01T00:00:00Z',
  },
  u_sarah: {
    id: 'u_sarah',
    phone: '+15551112222',
    displayName: 'Sarah',
    avatarColor: '#EC4899',
    authProvider: 'google',
    createdAt: '2025-01-02T00:00:00Z',
  },
  u_jake: {
    id: 'u_jake',
    displayName: 'Jake',
    avatarColor: '#10B981',
    authProvider: 'apple',
    createdAt: '2025-01-02T00:00:00Z',
  },
  u_mom: {
    id: 'u_mom',
    phone: '+15553334444',
    displayName: 'Mom',
    avatarColor: '#F59E0B',
    authProvider: 'phone',
    createdAt: '2024-12-20T00:00:00Z',
  },
  u_jordan: {
    id: 'u_jordan',
    displayName: 'Jordan',
    avatarColor: '#6366F1',
    authProvider: 'google',
    createdAt: '2025-01-03T00:00:00Z',
  },
};

// ─── Seed Alarms ──────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];

export const MOCK_ALARMS: Alarm[] = [
  {
    id: 'a1',
    creatorId: 'u_self',
    label: 'Morning Grind',
    hour: 6,
    minute: 30,
    scheduledDate: today,
    isActive: true,
    repeatDays: [1, 2, 3, 4, 5],
    safetyNet: true,
    safetyNetDelaySec: 300,
    buddyIds: ['u_sarah', 'u_mom'],
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-14T00:00:00Z',
  },
  {
    id: 'a2',
    creatorId: 'u_self',
    label: 'Team Standup',
    hour: 9,
    minute: 0,
    scheduledDate: today,
    isActive: true,
    repeatDays: [1, 2, 3, 4, 5],
    safetyNet: false,
    safetyNetDelaySec: 0,
    buddyIds: [],
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'a3',
    creatorId: 'u_self',
    label: 'Lunch with Jake',
    hour: 12,
    minute: 30,
    scheduledDate: today,
    isActive: true,
    repeatDays: [],
    safetyNet: false,
    safetyNetDelaySec: 0,
    buddyIds: ['u_jake'],
    createdAt: '2025-01-14T00:00:00Z',
    updatedAt: '2025-01-14T00:00:00Z',
  },
  {
    id: 'a4',
    creatorId: 'u_jake',
    label: 'Hike Kickoff',
    hour: 7,
    minute: 0,
    scheduledDate: '2025-01-20',
    isActive: true,
    repeatDays: [],
    safetyNet: true,
    safetyNetDelaySec: 600,
    buddyIds: ['u_jordan', 'u_sarah'],
    groupId: 'g1',
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
];

// ─── Seed Groups ──────────────────────────────────────────────

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Weekend Hikers',
    emoji: '🏔',
    creatorId: 'u_jake',
    memberIds: ['u_self', 'u_jake', 'u_jordan', 'u_sarah'],
    alarmIds: ['a4'],
    createdAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'g2',
    name: 'Family',
    emoji: '🏡',
    creatorId: 'u_mom',
    memberIds: ['u_self', 'u_mom'],
    alarmIds: [],
    createdAt: '2024-12-15T00:00:00Z',
  },
];

// ─── Helpers ──────────────────────────────────────────────────

function resolveUser(id: string): User {
  return MOCK_USERS[id] ?? MOCK_USERS.u_self;
}

export function formatAlarmTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

export function computeSecondsUntil(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

/** Return every active alarm with FKs resolved, sorted soonest-first. */
export function getResolvedAlarms(): ResolvedAlarm[] {
  return MOCK_ALARMS.filter((a) => a.isActive)
    .map((alarm) => ({
      ...alarm,
      creator: resolveUser(alarm.creatorId),
      buddies: alarm.buddyIds.map(resolveUser),
      group: MOCK_GROUPS.find((g) => g.id === alarm.groupId),
      formattedTime: formatAlarmTime(alarm.hour, alarm.minute),
      secondsUntil: computeSecondsUntil(alarm.hour, alarm.minute),
    }))
    .sort((a, b) => a.secondsUntil - b.secondsUntil);
}

/** Return every group with members + the soonest child alarm resolved. */
export function getResolvedGroups(): ResolvedGroup[] {
  return MOCK_GROUPS.map((group) => {
    const childAlarms = MOCK_ALARMS.filter(
      (a) => a.groupId === group.id && a.isActive
    );

    let nextAlarm: ResolvedAlarm | undefined;
    if (childAlarms.length > 0) {
      const resolved = childAlarms.map((a) => ({
        ...a,
        creator: resolveUser(a.creatorId),
        buddies: a.buddyIds.map(resolveUser),
        group,
        formattedTime: formatAlarmTime(a.hour, a.minute),
        secondsUntil: computeSecondsUntil(a.hour, a.minute),
      }));
      nextAlarm = resolved.sort((a, b) => a.secondsUntil - b.secondsUntil)[0];
    }

    return {
      ...group,
      creator: resolveUser(group.creatorId),
      members: group.memberIds.map(resolveUser),
      nextAlarm,
    };
  });
}
