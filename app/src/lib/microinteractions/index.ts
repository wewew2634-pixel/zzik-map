/**
 * Unified Microinteraction System (Phase 6)
 *
 * Consolidated, motion-economics optimized feedback patterns
 * All patterns respect prefers-reduced-motion for accessibility
 *
 * Motion Economics ROI Rankings:
 * 1. GestureSwipe - ROI: 38 VERY HIGH
 * 2. FormValidation - ROI: 16.0 VERY HIGH
 * 3. ButtonFeedback - ROI: 14.2 HIGH
 * 4. SuccessCelebration - ROI: 6.0 MEDIUM-HIGH
 * 5. LoadingShimmer - ROI: 6.0 MEDIUM
 * 6. PageTransition - ROI: 5.2 MEDIUM
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type AnimationVariant = 'fade' | 'slide' | 'scale' | 'bounce' | 'shimmer';
export type AnimationDirection = 'up' | 'down' | 'left' | 'right';
export type MotionIntensity = 'reduced' | 'normal' | 'energetic';

/**
 * Motion Economics Scoring Model
 * ROI = (Cognitive Impact + Engagement Impact) / (Performance Cost + Memory Cost)
 *
 * Guidelines:
 * - ROI > 20: VERY HIGH (always use, minimal cost)
 * - ROI 10-20: HIGH (highly recommended)
 * - ROI 5-10: MEDIUM (use strategically)
 * - ROI < 5: LOW (use sparingly)
 */
export interface MotionEconomicsScore {
  cognitiveImpact: number; // 0-10: How much feedback helps understanding
  engagementImpact: number; // 0-10: How much feedback increases engagement
  performanceCost: number; // 0-10: Animation overhead
  memoryCost: number; // 0-10: Memory usage increase
  roi: number; // Calculated: (cognitive + engagement) / (performance + memory)
  intensity: MotionIntensity;
}

/**
 * Core Microinteraction Configuration
 */
export interface MicrointeractionConfig {
  type: FeedbackType;
  duration: number; // ms
  easing: number[] | string; // Cubic bezier or preset
  delay?: number; // ms
  variant?: AnimationVariant;
  direction?: AnimationDirection;
  respuesReducedMotion?: boolean; // default: true
  economics: MotionEconomicsScore;
}

/**
 * Feedback Message with Optional Actions
 */
export interface FeedbackMessage {
  type: FeedbackType;
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    callback: () => void;
  };
  autoDismiss?: number; // ms, 0 = no auto dismiss
  position?: 'top' | 'bottom' | 'center' | 'inline';
}

/**
 * Button Feedback Configuration
 */
export interface ButtonFeedbackConfig extends Omit<MicrointeractionConfig, 'easing'> {
  scaleHover?: number; // Default: 1.02
  scaleTap?: number; // Default: 0.95
  easing?: [number, number, number, number];
}

/**
 * Form Validation Feedback
 */
export interface ValidationFeedback {
  isValid: boolean;
  touched: boolean;
  error?: string | null;
  warning?: string | null;
  success?: boolean;
  showIcon?: boolean; // Show animated icon
  animateBorder?: boolean; // Animate border color
}

/**
 * Loading State Configuration
 */
export interface LoadingConfig extends Omit<MicrointeractionConfig, 'variant'> {
  variant: 'shimmer' | 'spinner' | 'skeleton' | 'pulse';
  intensity?: 'light' | 'normal' | 'intense';
  text?: string;
}

/**
 * Page Transition Configuration
 */
export interface PageTransitionConfig extends MicrointeractionConfig {
  variant: AnimationVariant;
  mode?: 'wait' | 'sync' | 'popLayout';
}

/**
 * Gesture Swipe Configuration
 */
export interface GestureSwipeConfig extends MicrointeractionConfig {
  threshold?: number; // Minimum distance in px
  velocityThreshold?: number; // Minimum px/s
  directions?: ('up' | 'down' | 'left' | 'right')[];
  showFeedback?: boolean;
}

/**
 * Success Celebration Configuration
 */
export interface SuccessConfig extends Omit<MicrointeractionConfig, 'type'> {
  type?: FeedbackType;
  celebrationType: 'modal' | 'toast' | 'inline' | 'confetti';
  bounceIntensity?: number; // Scale multiplier
  soundFeedback?: boolean;
}

// ============================================================================
// MOTION TOKENS - DURATION & EASING
// ============================================================================

export const MOTION_TOKENS = {
  duration: {
    instant: 0,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 500,
    slowest: 700,
  },
  easing: {
    linear: 'linear' as const,
    easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
    easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
    easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
    bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    smooth: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    spring: [0.5, 1.5, 0.5, 1] as [number, number, number, number],
    snap: [0.17, 0.67, 0.83, 0.67] as [number, number, number, number],
  },
};

// ============================================================================
// MICROINTERACTION PRESETS - Motion Economics Optimized
// ============================================================================

export const MICROINTERACTION_PRESETS = {
  // Button Press - HIGH ROI (14.2)
  buttonPress: {
    type: 'info' as FeedbackType,
    duration: 100,
    easing: MOTION_TOKENS.easing.easeOut,
    scaleHover: 1.02,
    scaleTap: 0.95,
    economics: {
      cognitiveImpact: 8,
      engagementImpact: 7,
      performanceCost: 1,
      memoryCost: 0.05,
      roi: 14.2,
      intensity: 'normal' as MotionIntensity,
    },
  } as ButtonFeedbackConfig,

  // Form Validation - VERY HIGH ROI (16.0)
  formValidation: {
    type: 'info' as FeedbackType,
    duration: 150,
    easing: MOTION_TOKENS.easing.easeOut,
    economics: {
      cognitiveImpact: 8,
      engagementImpact: 8,
      performanceCost: 1,
      memoryCost: 0,
      roi: 16.0,
      intensity: 'normal' as MotionIntensity,
    },
  } as MicrointeractionConfig,

  // Success Celebration - MEDIUM-HIGH ROI (6.0)
  successCelebration: {
    type: 'success' as FeedbackType,
    duration: 600,
    easing: MOTION_TOKENS.easing.bounce,
    celebrationType: 'modal',
    bounceIntensity: 1.2,
    economics: {
      cognitiveImpact: 9,
      engagementImpact: 9,
      performanceCost: 2,
      memoryCost: 1,
      roi: 6.0,
      intensity: 'energetic' as MotionIntensity,
    },
  } as SuccessConfig,

  // Loading Shimmer - MEDIUM ROI (6.0)
  loadingShimmer: {
    type: 'loading' as FeedbackType,
    duration: 1500,
    easing: MOTION_TOKENS.easing.linear,
    variant: 'shimmer',
    economics: {
      cognitiveImpact: 5,
      engagementImpact: 4,
      performanceCost: 1,
      memoryCost: 0.5,
      roi: 6.0,
      intensity: 'normal' as MotionIntensity,
    },
  } as LoadingConfig,

  // Page Transition - MEDIUM ROI (5.2)
  pageTransition: {
    type: 'info' as FeedbackType,
    duration: 400,
    easing: MOTION_TOKENS.easing.easeInOut,
    variant: 'fade',
    economics: {
      cognitiveImpact: 7,
      engagementImpact: 6,
      performanceCost: 2,
      memoryCost: 0.5,
      roi: 5.2,
      intensity: 'normal' as MotionIntensity,
    },
  } as PageTransitionConfig,

  // Gesture Swipe - VERY HIGH ROI (38)
  gestureSwipe: {
    type: 'info' as FeedbackType,
    duration: 0, // Variable based on gesture
    easing: MOTION_TOKENS.easing.smooth,
    threshold: 50,
    velocityThreshold: 500,
    directions: ['up', 'down', 'left', 'right'] as ('up' | 'down' | 'left' | 'right')[],
    showFeedback: true,
    economics: {
      cognitiveImpact: 9,
      engagementImpact: 10,
      performanceCost: 0.5,
      memoryCost: 0.1,
      roi: 38,
      intensity: 'normal' as MotionIntensity,
    },
  } as GestureSwipeConfig,
} as const;

// ============================================================================
// PRESET HELPER FUNCTIONS
// ============================================================================

/**
 * Get motion configuration based on type and intensity
 */
export function getMotionConfig(
  type: FeedbackType,
  intensity: MotionIntensity = 'normal'
): MicrointeractionConfig {
  const baseConfig = MICROINTERACTION_PRESETS.buttonPress as MicrointeractionConfig;

  if (intensity === 'reduced') {
    return {
      ...baseConfig,
      duration: 0.01,
      easing: 'linear',
      delay: 0,
    } as MicrointeractionConfig;
  }

  if (intensity === 'energetic' && type === 'success') {
    return {
      ...MICROINTERACTION_PRESETS.successCelebration,
      duration: 700,
    } as MicrointeractionConfig;
  }

  return baseConfig;
}

/**
 * Calculate ROI for custom microinteraction
 */
export function calculateROI(
  cognitive: number,
  engagement: number,
  performance: number,
  memory: number
): number {
  const denominator = performance + memory;
  if (denominator === 0) return Infinity;
  return (cognitive + engagement) / denominator;
}

/**
 * Get ROI classification
 */
export function getROIClassification(roi: number): string {
  if (roi > 20) return 'VERY HIGH';
  if (roi >= 10) return 'HIGH';
  if (roi >= 5) return 'MEDIUM';
  return 'LOW';
}

// ============================================================================
// PRESET EXPORTS FOR CONVENIENCE
// ============================================================================

export const {
  buttonPress,
  formValidation,
  successCelebration,
  loadingShimmer,
  pageTransition,
  gestureSwipe,
} = MICROINTERACTION_PRESETS;
