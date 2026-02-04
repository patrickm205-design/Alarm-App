import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

import { Colors, Font, Radius, Spacing } from '../theme';

interface Props {
  /** Fires once the user completes the OTP step (or taps a social sign-in). */
  onComplete: () => void;
}

type Step = 'welcome' | 'phone' | 'otp';

// ─── sub-screens ────────────────────────────────────────────────

/**
 * Welcome splash – big logo, tagline, CTA.
 * The two buttons collapse the sign-up to 1 tap (social) or 2 more
 * taps (phone → OTP).  Total: ≤ 3 taps to Home.
 */
function WelcomeStep({
  onGetStarted,
  onSocialLogin,
}: {
  onGetStarted: () => void;
  onSocialLogin: () => void;
}) {
  // Stagger-in the content on mount
  const titleY = useSharedValue(40);
  const titleOp = useSharedValue(0);
  const subY = useSharedValue(60);
  const subOp = useSharedValue(0);
  const btnOp = useSharedValue(0);

  useEffect(() => {
    titleY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
    titleOp.value = withTiming(1, { duration: 700 });

    // slight stagger
    setTimeout(() => {
      subY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      subOp.value = withTiming(1, { duration: 600 });
    }, 200);

    setTimeout(() => {
      btnOp.value = withTiming(1, { duration: 500 });
    }, 420);
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOp.value,
  }));
  const subStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: subY.value }],
    opacity: subOp.value,
  }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOp.value }));

  return (
    <View style={styles.welcomeRoot}>
      {/* background gradient */}
      <LinearGradient
        colors={['#0A0A0F', '#12101A']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* decorative blobs */}
      <View style={[styles.blob, styles.blobTL]} />
      <View style={[styles.blob, styles.blobBR]} />

      <View style={styles.welcomeCenter}>
        {/* icon */}
        <Animated.View style={[styles.iconRing, titleStyle]}>
          <LinearGradient
            colors={Colors.gradientPrimary}
            style={styles.iconGradient}
          >
            <Ionicons name="alarm-outline" size={42} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        {/* title */}
        <Animated.Text style={[styles.welcomeTitle, titleStyle]}>
          Social Alarm
        </Animated.Text>

        {/* tagline */}
        <Animated.Text style={[styles.welcomeTagline, subStyle]}>
          Wake up. Together.
        </Animated.Text>
      </View>

      {/* buttons */}
      <Animated.View style={[styles.welcomeButtons, btnStyle]}>
        {/* primary CTA */}
        <TouchableOpacity onPress={onGetStarted} style={styles.btnPrimary}>
          <LinearGradient
            colors={Colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradientInner}
          >
            <Text style={styles.btnPrimaryText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* social row */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            onPress={onSocialLogin}
            style={styles.socialBtn}
          >
            <Ionicons name="logo-google" size={22} color="#FFFFFF" />
            <Text style={styles.socialBtnText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSocialLogin}
            style={styles.socialBtn}
          >
            <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
            <Text style={styles.socialBtnText}>Apple</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * Phone-number entry step.  "Get Started" → here → OTP.
 */
function PhoneStep({
  onNext,
  onBack,
}: {
  onNext: (phone: string) => void;
  onBack: () => void;
}) {
  const [phone, setPhone] = useState('');
  const [useEmail, setUseEmail] = useState(false);

  // slide-in animation
  const slideX = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    slideX.value = withSpring(0, { damping: 25, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 380 });
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: opacity.value,
  }));

  return (
    <KeyboardAvoidingView
      style={styles.stepRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* back */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={26} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Animated.View style={[styles.stepContent, contentStyle]}>
        {/* progress dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.stepTitle}>
          {useEmail ? "What's your email?" : "What's your number?"}
        </Text>
        <Text style={styles.stepSub}>
          We'll send a quick code to verify your identity. No password needed.
        </Text>

        {/* input */}
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder={useEmail ? 'you@example.com' : '+1 (555) 000-0000'}
          placeholderTextColor={Colors.textTertiary}
          keyboardType={useEmail ? 'email-address' : 'phone-pad'}
          autoCapitalize="none"
          autoComplete={useEmail ? 'email' : 'tel'}
          maxLength={useEmail ? 60 : 20}
        />

        {/* toggle email ↔ phone */}
        <TouchableOpacity
          onPress={() => setUseEmail((v) => !v)}
          style={styles.toggleLink}
        >
          <Text style={styles.toggleLinkText}>
            {useEmail ? 'Use phone number instead' : 'Use email instead'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* CTA (pinned to bottom) */}
      <TouchableOpacity
        onPress={() => onNext(phone)}
        disabled={phone.length < 4}
        style={[styles.btnPrimary, phone.length < 4 && styles.btnDisabled]}
      >
        <LinearGradient
          colors={Colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btnGradientInner}
        >
          <Text style={styles.btnPrimaryText}>Send Code</Text>
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

/**
 * OTP entry.  Six split boxes; auto-submits the moment the 6th
 * digit is typed.  This is tap #3 → Home.
 */
function OTPStep({
  onVerified,
  onBack,
}: {
  onVerified: () => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  const slideX = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    slideX.value = withSpring(0, { damping: 25, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 380 });
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: opacity.value,
  }));

  const handleOtpChange = (value: string) => {
    // allow only digits
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);

    if (cleaned.length === 6) {
      setVerifying(true);
      // Simulate network round-trip, then call back
      setTimeout(() => onVerified(), 800);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.stepRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* back */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={26} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Animated.View style={[styles.stepContent, contentStyle]}>
        {/* progress dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        <Text style={styles.stepTitle}>Enter your code</Text>
        <Text style={styles.stepSub}>
          We sent a 6-digit code to your number. It expires in 10 min.
        </Text>

        {/* hidden input that captures keystrokes */}
        <TextInput
          style={styles.otpHiddenInput}
          value={otp}
          onChangeText={handleOtpChange}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          editable={!verifying}
        />

        {/* visible digit boxes */}
        <View style={styles.otpBoxRow}>
          {Array.from({ length: 6 }, (_, i) => {
            const filled = i < otp.length;
            const active = i === otp.length && !verifying;
            return (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  filled && styles.otpBoxFilled,
                  active && styles.otpBoxActive,
                ]}
              >
                <Text style={styles.otpDigit}>
                  {filled ? otp[i] : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* verifying indicator */}
        {verifying && (
          <Text style={styles.verifyingText}>Verifying…</Text>
        )}

        {/* resend link */}
        {!verifying && (
          <TouchableOpacity style={styles.resendBtn}>
            <Text style={styles.resendText}>Resend code</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// ─── main exported screen ───────────────────────────────────────

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [phone, setPhone] = useState('');

  switch (step) {
    case 'welcome':
      return (
        <WelcomeStep
          onGetStarted={() => setStep('phone')}
          onSocialLogin={onComplete} // social = 1-tap sign-in
        />
      );
    case 'phone':
      return (
        <PhoneStep
          onNext={(p) => {
            setPhone(p);
            setStep('otp');
          }}
          onBack={() => setStep('welcome')}
        />
      );
    case 'otp':
      return (
        <OTPStep
          onVerified={onComplete}
          onBack={() => setStep('phone')}
        />
      );
  }
}

// ─── shared styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── welcome ──
  welcomeRoot: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 60,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTL: {
    width: 260,
    height: 260,
    top: -80,
    left: -80,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
  },
  blobBR: {
    width: 200,
    height: 200,
    bottom: -60,
    right: -60,
    backgroundColor: 'rgba(99, 102, 241, 0.10)',
  },

  welcomeCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    marginBottom: Spacing.lg,
  },
  iconGradient: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: Font.xxxl,
    fontWeight: Font.heavy,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  welcomeTagline: {
    fontSize: Font.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },

  welcomeButtons: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },

  // ── step screens ──
  stepRoot: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  stepContent: {
    flex: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.xxl,
  },
  dot: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.glassBorder,
  },
  dotActive: {
    backgroundColor: Colors.gradientPrimary[0],
  },
  stepTitle: {
    fontSize: Font.xxl,
    fontWeight: Font.heavy,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  stepSub: {
    fontSize: Font.md,
    color: Colors.textSecondary,
    lineHeight: Font.md * 1.5,
    marginBottom: Spacing.xxl,
  },

  // ── input ──
  input: {
    height: 56,
    borderRadius: Radius.card,
    backgroundColor: Colors.glassBg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: Spacing.lg,
    fontSize: Font.lg,
    fontWeight: Font.semibold,
    color: Colors.textPrimary,
  },
  toggleLink: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  toggleLinkText: {
    fontSize: Font.sm,
    color: Colors.gradientPrimary[0],
    fontWeight: Font.semibold,
  },

  // ── OTP boxes ──
  otpHiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  otpBoxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  otpBox: {
    width: 44,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.glassBg,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: Colors.gradientPrimary[0],
    backgroundColor: 'rgba(124, 58, 237, 0.10)',
  },
  otpBoxActive: {
    borderColor: Colors.gradientPrimary[0],
  },
  otpDigit: {
    fontSize: Font.xl,
    fontWeight: Font.bold,
    color: Colors.textPrimary,
  },
  verifyingText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Font.sm,
    marginTop: Spacing.lg,
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  resendText: {
    fontSize: Font.sm,
    color: Colors.gradientPrimary[0],
    fontWeight: Font.semibold,
  },

  // ── shared buttons ──
  btnPrimary: {
    width: '100%',
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  btnGradientInner: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: Font.lg,
    fontWeight: Font.bold,
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.4,
  },

  // ── divider ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.glassBorder,
  },
  dividerText: {
    fontSize: Font.xs,
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── social ──
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 50,
    borderRadius: Radius.card,
    backgroundColor: Colors.glassBg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  socialBtnText: {
    fontSize: Font.md,
    fontWeight: Font.semibold,
    color: Colors.textPrimary,
  },
});
