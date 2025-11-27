/**
 * ZZIK MAP - Global App Store (Zustand)
 * V3: Centralized state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// TOAST STORE
// =============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? `toast_${crypto.randomUUID()}`
      : `toast_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const duration = toast.duration ?? 5000;
    const newToast: Toast = { ...toast, id, duration };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// =============================================================================
// UI STORE
// =============================================================================

type Theme = 'light' | 'dark' | 'system';
type Language = 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW' | 'th';

interface UIState {
  theme: Theme;
  language: Language;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'ko',
      sidebarOpen: true,
      mobileMenuOpen: false,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      closeMobileMenu: () => set({ mobileMenuOpen: false }),
    }),
    {
      name: 'zzik-ui-storage',
      partialize: (state) => ({ theme: state.theme, language: state.language }),
    }
  )
);

// =============================================================================
// JOURNEY STORE (Persistent)
// =============================================================================

interface JourneyHistoryItem {
  id: string;
  fromLocationId: string;
  fromLocationName: string;
  timestamp: number;
  photoCount: number;
}

interface JourneyPersistState {
  recentJourneys: JourneyHistoryItem[];
  favoriteLocations: string[];
  addRecentJourney: (journey: Omit<JourneyHistoryItem, 'id' | 'timestamp'>) => void;
  toggleFavorite: (locationId: string) => void;
  clearHistory: () => void;
}

export const useJourneyPersistStore = create<JourneyPersistState>()(
  persist(
    (set) => ({
      recentJourneys: [],
      favoriteLocations: [],

      addRecentJourney: (journey) => {
        const newJourney: JourneyHistoryItem = {
          ...journey,
          id: `journey_${Date.now()}`,
          timestamp: Date.now(),
        };

        set((state) => ({
          recentJourneys: [newJourney, ...state.recentJourneys].slice(0, 10), // Keep last 10
        }));
      },

      toggleFavorite: (locationId) => {
        set((state) => ({
          favoriteLocations: state.favoriteLocations.includes(locationId)
            ? state.favoriteLocations.filter((id) => id !== locationId)
            : [...state.favoriteLocations, locationId],
        }));
      },

      clearHistory: () => {
        set({ recentJourneys: [] });
      },
    }),
    {
      name: 'zzik-journey-storage',
    }
  )
);

// =============================================================================
// UPLOAD STORE (Session)
// =============================================================================

interface UploadState {
  isUploading: boolean;
  uploadProgress: number;
  currentPhotoId: string | null;
  setUploading: (isUploading: boolean) => void;
  setProgress: (progress: number) => void;
  setCurrentPhotoId: (id: string | null) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  isUploading: false,
  uploadProgress: 0,
  currentPhotoId: null,

  setUploading: (isUploading) => set({ isUploading }),
  setProgress: (uploadProgress) => set({ uploadProgress }),
  setCurrentPhotoId: (currentPhotoId) => set({ currentPhotoId }),
  reset: () => set({ isUploading: false, uploadProgress: 0, currentPhotoId: null }),
}));

// =============================================================================
// HELPER HOOKS
// =============================================================================

// Toast convenience functions
export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'success', title, message }),
  error: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'error', title, message }),
  warning: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'warning', title, message }),
  info: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'info', title, message }),
};
