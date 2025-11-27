'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * V7 Motion Economics: Page Transition
 * Duration: 400ms (fast, doesn't feel sluggish)
 * Easing: easeInOut for fade, easeOut for slide
 * ROI: (7 cognitive + 6 engagement) / (2 performance + 0.5 memory) = 5.2 MEDIUM
 *
 * Psychology: Visual continuity, reduces disorientation during navigation
 * Used when: Route changes, tab switches, modal opens/closes
 *
 * Note: Uses AnimatePresence to manage enter/exit animations for unmounting components
 * GPU acceleration: Uses opacity and transform (translateX) only
 */

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'slideRight' | 'slideLeft' | 'slideUp' | 'slideDown' | 'scale';
  duration?: number;
  className?: string;
  reduceMotion?: boolean;
}

export function PageTransition({
  children,
  variant = 'fade',
  duration = 0.4,
  className = '',
  reduceMotion = false,
}: PageTransitionProps) {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideRight: {
      initial: { opacity: 0, x: -40 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 40 },
    },
    slideLeft: {
      initial: { opacity: 0, x: 40 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -40 },
    },
    slideUp: {
      initial: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -40 },
    },
    slideDown: {
      initial: { opacity: 0, y: -40 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 40 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
    },
  };

  const selectedVariant = variants[variant];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={!reduceMotion ? selectedVariant.initial : undefined}
        animate={!reduceMotion ? selectedVariant.animate : undefined}
        exit={!reduceMotion ? selectedVariant.exit : undefined}
        transition={!reduceMotion ? {
          duration,
          ease: variant.includes('slide') ? [0, 0, 0.2, 1] : [0.3, 0, 0.3, 1],
        } : undefined}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Layout-level Page Transition
 * Wraps entire page/route content for consistent transitions
 */
interface LayoutTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'slideRight' | 'slideLeft';
}

export function LayoutTransition({
  children,
  variant = 'fade',
}: LayoutTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={variant} // Force re-mount for variant changes
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.3, 0, 0.3, 1],
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Modal/Dialog Transition
 * Specialized for overlay components
 */
interface ModalTransitionProps {
  isOpen: boolean;
  children: ReactNode;
  onClose?: () => void;
  backdrop?: boolean;
  backdropClassName?: string;
}

export function ModalTransition({
  isOpen,
  children,
  onClose,
  backdrop = true,
  backdropClassName = 'bg-black/50',
}: ModalTransitionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {backdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`fixed inset-0 z-40 ${backdropClassName}`}
              onClick={onClose}
              aria-hidden="true"
            />
          )}

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0, 0, 0.2, 1], // easeOut
            }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="pointer-events-auto max-w-lg mx-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Staggered List Transition
 * Animates list items sequentially for entrance effect
 */
interface StaggeredListTransitionProps {
  children: ReactNode[];
  variant?: 'fade' | 'slideRight' | 'slideUp';
  staggerDelay?: number;
  containerClassName?: string;
}

export function StaggeredListTransition({
  children,
  variant = 'slideUp',
  staggerDelay = 0.1,
  containerClassName = '',
}: StaggeredListTransitionProps) {
  const itemVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
  };

  const selectedVariant = itemVariants[variant];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className={containerClassName}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={selectedVariant}
          transition={{
            duration: 0.3,
            ease: [0, 0, 0.2, 1], // easeOut
            delay: index * staggerDelay,
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Tab Panel Transition
 * Specialized for tab/accordion panel switching
 */
interface TabPanelTransitionProps {
  isActive: boolean;
  children: ReactNode;
  index?: number;
}

export function TabPanelTransition({
  isActive,
  children,
  index = 0,
}: TabPanelTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={`tab-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.25,
            ease: [0, 0, 0.2, 1], // easeOut
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Scroll-triggered Fade In
 * Elements fade in as they scroll into view
 */
interface ScrollFadeInProps {
  children: ReactNode;
  threshold?: number;
  delay?: number;
}

export function ScrollFadeIn({
  children,
  threshold = 0.1,
  delay = 0,
}: ScrollFadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0, 0, 0.2, 1], // easeOut
        delay,
      }}
      viewport={{ once: true, amount: threshold }}
    >
      {children}
    </motion.div>
  );
}
