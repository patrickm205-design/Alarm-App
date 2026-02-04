// ============================================================
// SOCIAL ALARM – Database Schema
// ============================================================
//
//   Entity Relationships
//   ────────────────────
//   User  ──1:N──  Alarm        (a user creates many alarms)
//   User  ──N:M──  Group        (users belong to groups)
//   Group ──1:N──  Alarm        (a group owns many alarms)
//   Alarm ──N:M──  User         (Safety-Net buddies)
//
// ============================================================

// ─── Enumerations ─────────────────────────────────────────────

export type AuthProvider = 'phone' | 'email' | 'google' | 'apple';

/** 0 = Sunday … 6 = Saturday  –  matches JS Date.getDay() */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ─── Core Entities ────────────────────────────────────────────

export interface User {
  id: string;
  phone?: string; // E.164, e.g. "+15551234567"
  email?: string;
  displayName: string;
  avatarColor: string; // hex – rendered when no photo
  avatarUrl?: string; // CDN image URL
  authProvider: AuthProvider;
  createdAt: string; // ISO 8601
}

export interface Alarm {
  id: string;
  creatorId: string; // → User.id
  label: string; // "Morning Grind", "Lunch", …

  hour: number; // 0–23
  minute: number; // 0–59
  scheduledDate: string; // "YYYY-MM-DD"
  isActive: boolean;
  repeatDays: Weekday[]; // [] = one-shot

  // ── Safety Net ──
  safetyNet: boolean;
  safetyNetDelaySec: number; // seconds after alarm fires before pinging buddies
  buddyIds: string[]; // → User.id[]   (meaningful only when safetyNet = true)

  // ── Group link ──
  groupId?: string; // → Group.id  (optional)

  // ── Timestamps ──
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  emoji: string; // single emoji used as the group avatar
  creatorId: string; // → User.id
  memberIds: string[]; // → User.id[]
  alarmIds: string[]; // → Alarm.id[]
  createdAt: string;
}

// ─── JSON payload examples (Supabase REST response shape) ─────
//
// ── User ──
// {
//   "id":             "usr_9f2a1b3c",
//   "phone":          "+15558001234",
//   "email":          null,
//   "displayName":    "Alex",
//   "avatarColor":    "#7C3AED",
//   "avatarUrl":      null,
//   "authProvider":   "phone",
//   "createdAt":      "2025-01-10T08:30:00Z"
// }
//
// ── Alarm ──
// {
//   "id":                 "alm_a1b2c3d4",
//   "creatorId":          "usr_9f2a1b3c",
//   "label":              "Morning Grind",
//   "hour":               6,
//   "minute":             30,
//   "scheduledDate":      "2025-01-15",
//   "isActive":           true,
//   "repeatDays":         [1, 2, 3, 4, 5],
//   "safetyNet":          true,
//   "safetyNetDelaySec":  300,
//   "buddyIds":           ["usr_1a2b3c4d", "usr_5e6f7g8h"],
//   "groupId":            null,
//   "createdAt":          "2025-01-10T08:30:00Z",
//   "updatedAt":          "2025-01-14T21:00:00Z"
// }
//
// ── Group ──
// {
//   "id":          "grp_x1y2z3w4",
//   "name":        "Weekend Hikers",
//   "emoji":       "🏔",
//   "creatorId":   "usr_9f2a1b3c",
//   "memberIds":   ["usr_9f2a1b3c", "usr_1a2b3c4d", "usr_5e6f7g8h"],
//   "alarmIds":    ["alm_e5f6g7h8"],
//   "createdAt":   "2025-01-10T09:00:00Z"
// }
// ──────────────────────────────────────────────────────────────

// ─── Derived / View Types  (assembled client-side for the UI) ──

/** Alarm with every FK resolved to the full object. */
export interface ResolvedAlarm extends Alarm {
  creator: User;
  buddies: User[];
  group?: Group;
  formattedTime: string; // "6:30 AM"
  secondsUntil: number; // live countdown – recomputed every render tick
}

export interface ResolvedGroup extends Group {
  creator: User;
  members: User[];
  nextAlarm?: ResolvedAlarm;
}
