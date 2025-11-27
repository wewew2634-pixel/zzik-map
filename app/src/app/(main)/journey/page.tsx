'use client';

/**
 * ZZIK MAP - Journey Intelligence Page V3
 * Design: Neo-Korean Modernism with fluid animations
 * i18n: Full internationalization support
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartPhotoUpload, type UploadedPhoto } from '@/components/zzik/journey/SmartPhotoUpload';
import { useLocations, useNearestLocation } from '@/hooks/useLocations';
import { useJourneyRecommendations } from '@/hooks/useJourneys';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useTranslation } from '@/hooks/useTranslation';
import { logger } from '@/lib/logger';

type Step = 'upload' | 'location' | 'results';

const categoryColors: Record<string, { bg: string; text: string; glow: string }> = {
  landmark: { bg: 'bg-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  cafe: { bg: 'bg-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
  shopping: { bg: 'bg-pink-500/20', text: 'text-pink-400', glow: 'shadow-pink-500/20' },
  entertainment: { bg: 'bg-blue-500/20', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  nature: { bg: 'bg-green-500/20', text: 'text-green-400', glow: 'shadow-green-500/20' },
  other: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', glow: 'shadow-zinc-500/20' },
};

const fadeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export default function JourneyPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('upload');
  const [uploadedPhoto, setUploadedPhoto] = useState<UploadedPhoto | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // SWR data fetching
  const { locations, isLoading: locationsLoading } = useLocations({ limit: 50 });
  const { recommendations, totalTravelers, from, isLoading: journeyLoading } = useJourneyRecommendations(selectedLocationId);

  // GPS coordinates from photo
  const gpsCoords = useMemo(() => {
    if (uploadedPhoto?.gps.source === 'exif' && uploadedPhoto.gps.latitude && uploadedPhoto.gps.longitude) {
      return { lat: uploadedPhoto.gps.latitude, lng: uploadedPhoto.gps.longitude };
    }
    return null;
  }, [uploadedPhoto]);

  // Find nearest location
  const nearestResult = useNearestLocation(locations, gpsCoords, 5);

  // Handle photo ready
  const handlePhotoReady = useCallback((photo: UploadedPhoto) => {
    setUploadedPhoto(photo);

    if (photo.gps.source === 'exif' && photo.gps.latitude && photo.gps.longitude) {
      setTimeout(() => {
        if (nearestResult?.location) {
          setSelectedLocationId(nearestResult.location.id);
          setStep('results');
        } else {
          setStep('location');
        }
      }, 500);
    } else {
      setStep('location');
    }
  }, [nearestResult]);

  const handleLocationSelect = useCallback((locationId: string) => {
    setSelectedLocationId(locationId);
    setStep('results');
  }, []);

  const handleReset = useCallback(() => {
    setStep('upload');
    setUploadedPhoto(null);
    setSelectedLocationId(null);
  }, []);

  // Memoize getColors function for performance
  const getColors = useCallback(
    (category: string) => categoryColors[category] || categoryColors.other,
    []
  );

  const selectedLocation = useMemo(
    () => locations.find(l => l.id === selectedLocationId),
    [locations, selectedLocationId]
  );

  return (
    <ErrorBoundary componentName="JourneyPage">
      <div className="min-h-screen py-12 md:py-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--zzik-coral)]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--electric-cyan)]/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 md:mb-16"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--zzik-coral)]/10 border border-[var(--zzik-coral)]/20 rounded-full text-sm text-[var(--zzik-coral)] mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--zzik-coral)] animate-pulse" />
              {t('landing', 'journeySection', 'label')}
            </motion.span>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              {t('journey', 'title')}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              {t('journey', 'uploadPrompt')}
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-2">
              {(['upload', 'location', 'results'] as Step[]).map((s, idx) => (
                <div key={s} className="flex items-center">
                  <motion.div
                    animate={{
                      scale: step === s ? 1.1 : 1,
                      backgroundColor: step === s ? 'var(--zzik-coral)' :
                        (['upload', 'location', 'results'].indexOf(step) > idx ? 'var(--electric-cyan)' : 'rgba(255,255,255,0.1)')
                    }}
                    className="w-3 h-3 rounded-full transition-colors"
                  />
                  {idx < 2 && (
                    <div className={`w-12 h-0.5 mx-1 transition-colors ${
                      ['upload', 'location', 'results'].indexOf(step) > idx
                        ? 'bg-[var(--electric-cyan)]'
                        : 'bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Upload */}
            {step === 'upload' && (
              <motion.div
                key="upload"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="max-w-xl mx-auto"
              >
                <SmartPhotoUpload
                  onPhotoReady={handlePhotoReady}
                  onError={(error) => logger.error('Photo upload failed', {}, error instanceof Error ? error : new Error(String(error)))}
                  className="w-full"
                />

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center text-zinc-500 text-sm"
                >
                  {t('journey', 'uploadHint')}
                </motion.p>
              </motion.div>
            )}

            {/* Step 2: Location Selection */}
            {step === 'location' && uploadedPhoto && (
              <motion.div
                key="location"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                {/* Photo preview */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-start gap-6 p-6 bg-zinc-800/30 backdrop-blur-sm border border-white/10 rounded-2xl"
                >
                  <img
                    src={uploadedPhoto.preview}
                    alt={t('journey', 'uploadPrompt')}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl shadow-lg"
                  />
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">{t('journey', 'selectLocation')}</h3>
                    <p className="text-zinc-400 text-sm">
                      {t('journey', 'noGps')}
                    </p>
                  </div>
                </motion.div>

                {/* Location grid */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-3 gap-3"
                >
                  {locationsLoading ? (
                    Array.from({ length: 9 }).map((_, idx) => (
                      <div key={idx} className="h-28 bg-zinc-800/50 rounded-xl animate-pulse" />
                    ))
                  ) : (
                    locations.map((location) => {
                      const colors = getColors(location.category);
                      return (
                        <motion.button
                          key={location.id}
                          variants={fadeVariants}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleLocationSelect(location.id)}
                          className="p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-[var(--zzik-coral)] rounded-xl text-left transition-all group"
                        >
                          <p className="text-white font-medium truncate group-hover:text-[var(--zzik-coral)] transition-colors">
                            {location.name_ko}
                          </p>
                          <p className="text-zinc-500 text-sm truncate">{location.name}</p>
                          <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text}`}>
                            {location.category}
                          </span>
                        </motion.button>
                      );
                    })
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Step 3: Results */}
            {step === 'results' && (
              <motion.div
                key="results"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                {/* Photo & Source Location */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-6 p-6 bg-zinc-800/30 backdrop-blur-sm border border-white/10 rounded-2xl"
                >
                  {uploadedPhoto && (
                    <img
                      src={uploadedPhoto.preview}
                      alt={t('journey', 'startingFrom')}
                      className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl shadow-lg"
                    />
                  )}
                  <div>
                    <p className="text-zinc-500 text-sm mb-1">{t('journey', 'startingFrom')}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      {selectedLocation?.name_ko || from?.name_ko}
                    </h3>
                    <p className="text-zinc-400">
                      {selectedLocation?.name || from?.name}
                    </p>
                  </div>
                </motion.div>

                {/* Loading */}
                {journeyLoading && (
                  <div className="flex flex-col items-center py-16">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 border-3 border-[var(--electric-cyan)] border-t-transparent rounded-full mb-4"
                    />
                    <p className="text-white">{t('journey', 'analyzing')}</p>
                  </div>
                )}

                {/* Results */}
                {!journeyLoading && (
                  <>
                    {/* Stats */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center py-8 relative"
                    >
                      <div className="absolute inset-0 flex justify-center">
                        <div className="w-48 h-48 bg-[var(--electric-cyan)]/10 rounded-full blur-[60px]" />
                      </div>

                      <p className="relative text-[var(--electric-cyan)] text-6xl md:text-7xl font-bold mb-2 tabular-nums">
                        {totalTravelers.toLocaleString()}
                      </p>
                      <p className="relative text-zinc-400 text-lg">
                        {t('journey', 'travelers')} {t('journey', 'wentHere')}
                      </p>
                    </motion.div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold text-xl flex items-center gap-2">
                        <span className="w-1 h-6 bg-[var(--zzik-coral)] rounded-full" />
                        {t('journey', 'nextDestinations')}
                      </h3>

                      {recommendations.length > 0 ? (
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="space-y-3"
                        >
                          {recommendations.map((rec, idx) => {
                            const colors = getColors(rec.category);
                            return (
                              <motion.div
                                key={rec.locationId}
                                variants={fadeVariants}
                                whileHover={{ x: 4 }}
                                className={`flex items-center gap-4 p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl transition-all cursor-pointer group shadow-lg ${colors.glow}`}
                              >
                                <div className="w-12 h-12 rounded-xl bg-[var(--zzik-coral)]/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[var(--zzik-coral)] font-bold text-lg">
                                    {idx + 1}
                                  </span>
                                </div>

                                <div className="flex-grow min-w-0">
                                  <p className="text-white font-semibold text-lg truncate group-hover:text-[var(--zzik-coral)] transition-colors">
                                    {rec.nameKo}
                                  </p>
                                  <p className="text-zinc-500 text-sm truncate">
                                    {rec.name}
                                  </p>
                                </div>

                                <div className="text-right flex-shrink-0">
                                  <p className="text-[var(--electric-cyan)] font-bold text-xl">
                                    {rec.travelerCount.toLocaleString()}
                                  </p>
                                  <p className="text-zinc-500 text-sm">
                                    {rec.percentage.toFixed(1)}%
                                  </p>
                                </div>

                                <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${colors.bg} ${colors.text}`}>
                                  {rec.category}
                                </span>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-16"
                        >
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </div>
                          <p className="text-zinc-500 text-lg">
                            {t('journey', 'noRecommendations')}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}

                {/* Reset button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center pt-8"
                >
                  <button
                    onClick={handleReset}
                    aria-label={t('journey', 'uploadAnother')}
                    className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t('journey', 'uploadAnother')}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
}
