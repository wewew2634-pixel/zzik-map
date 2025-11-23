// ZZIK LIVE - Haptic Feedback Utilities

/**
 * Haptic feedback patterns for mobile devices
 * Uses Vibration API for supported browsers
 */

export type HapticPattern = 
  | 'light'      // 10ms - For subtle feedback (button tap)
  | 'medium'     // 20ms - For standard actions
  | 'heavy'      // 30ms - For important actions
  | 'success'    // [10, 50, 10] - For successful completion
  | 'error'      // [15, 50, 15, 50, 15] - For errors
  | 'warning'    // [20, 100, 20] - For warnings

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  error: [15, 50, 15, 50, 15],
  warning: [20, 100, 20],
};

/**
 * Trigger haptic feedback
 * @param pattern - Haptic pattern to use
 * @returns true if vibration API is supported and feedback was triggered
 */
export function triggerHaptic(pattern: HapticPattern): boolean {
  if (!('vibrate' in navigator)) {
    return false;
  }

  try {
    const vibrationPattern = PATTERNS[pattern];
    return navigator.vibrate(vibrationPattern);
  } catch (error) {
    console.warn('[Haptics] Failed to trigger vibration:', error);
    return false;
  }
}

/**
 * Stop all vibrations
 */
export function stopHaptic(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * React hook for haptic feedback
 * Usage: const haptic = useHaptic(); haptic('success');
 */
export function useHaptic() {
  return (pattern: HapticPattern) => triggerHaptic(pattern);
}
