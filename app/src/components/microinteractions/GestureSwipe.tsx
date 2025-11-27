'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks';

/**
 * V7 Motion Economics: Gesture-Based Swipe Animation (Phase 5)
 *
 * Detects touch swipe gestures and provides visual feedback
 * Duration: Varies by gesture velocity (natural physics)
 * ROI: (9 cognitive + 10 engagement) / (0.5 performance + 0.1 memory) = 38 VERY HIGH
 *
 * Psychology: Natural swiping feels native, increases perceived app quality
 * Used for: Card stacks, carousels, navigation switches, dismissible elements
 */

export interface GestureSwipeProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance (px) to trigger swipe
  className?: string;
}

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500; // px/s

export function GestureSwipe({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = SWIPE_THRESHOLD,
  className = '',
}: GestureSwipeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, timestamp: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  const handleDragStart = (e: React.PointerEvent) => {
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
    };
    setIsDragging(true);
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const offsetX = e.clientX - dragStart.current.x;
    const offsetY = e.clientY - dragStart.current.y;

    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    const offsetX = dragOffset.x;
    const offsetY = dragOffset.y;
    const distance = Math.hypot(offsetX, offsetY);
    const duration = Date.now() - dragStart.current.timestamp;
    const velocity = distance / (duration / 1000);

    // Determine swipe direction
    if (Math.abs(offsetX) > Math.abs(offsetY)) {
      if (offsetX > threshold && velocity > SWIPE_VELOCITY_THRESHOLD) {
        onSwipeRight?.();
      } else if (offsetX < -threshold && velocity > SWIPE_VELOCITY_THRESHOLD) {
        onSwipeLeft?.();
      }
    } else {
      if (offsetY > threshold && velocity > SWIPE_VELOCITY_THRESHOLD) {
        onSwipeDown?.();
      } else if (offsetY < -threshold && velocity > SWIPE_VELOCITY_THRESHOLD) {
        onSwipeUp?.();
      }
    }

    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className={className}
      onPointerDown={handleDragStart}
      onPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onPointerCancel={handleDragEnd}
      animate={
        prefersReducedMotion
          ? { x: 0, y: 0 }
          : { x: dragOffset.x, y: dragOffset.y }
      }
      transition={{
        type: isDragging ? 'inertia' : 'spring',
        damping: 20,
        mass: 1,
        stiffness: 300,
      }}
      whileTap={{ cursor: 'grabbing' }}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Enhanced swipe feedback with visual cues
 * Shows direction indicators during swipe
 */
export function GestureSwipeWithFeedback({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  showDirections = true,
  className = '',
}: GestureSwipeProps & { showDirections?: boolean }) {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!prefersReducedMotion) {
      setSwipeDirection(direction);
      setTimeout(() => setSwipeDirection(null), 300);
    }

    switch (direction) {
      case 'left': onSwipeLeft?.(); break;
      case 'right': onSwipeRight?.(); break;
      case 'up': onSwipeUp?.(); break;
      case 'down': onSwipeDown?.(); break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <GestureSwipe
        onSwipeLeft={() => handleSwipe('left')}
        onSwipeRight={() => handleSwipe('right')}
        onSwipeUp={() => handleSwipe('up')}
        onSwipeDown={() => handleSwipe('down')}
      >
        {children}
      </GestureSwipe>

      {/* Direction feedback indicators */}
      {showDirections && swipeDirection && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="text-4xl"
          >
            {swipeDirection === 'left' && '←'}
            {swipeDirection === 'right' && '→'}
            {swipeDirection === 'up' && '↑'}
            {swipeDirection === 'down' && '↓'}
          </motion.div>
        </div>
      )}
    </div>
  );
}
