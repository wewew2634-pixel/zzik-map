'use client';

/**
 * ZZIK MAP - Explore Page V2
 * Design: Neo-Korean Modernism - Grid-based discovery
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLocations, useFilteredLocations } from '@/hooks/useLocations';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const categories = [
  { id: 'all', name: 'All', nameKo: '전체', icon: '✦' },
  { id: 'landmark', name: 'Landmarks', nameKo: '명소', icon: '🏛' },
  { id: 'cafe', name: 'Cafes', nameKo: '카페', icon: '☕' },
  { id: 'shopping', name: 'Shopping', nameKo: '쇼핑', icon: '🛍' },
  { id: 'entertainment', name: 'Entertainment', nameKo: '놀거리', icon: '🎭' },
  { id: 'nature', name: 'Nature', nameKo: '자연', icon: '🌿' },
];

const categoryColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  landmark: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    gradient: 'from-purple-500/20 to-transparent'
  },
  cafe: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500/20 to-transparent'
  },
  shopping: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
    gradient: 'from-pink-500/20 to-transparent'
  },
  entertainment: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    gradient: 'from-blue-500/20 to-transparent'
  },
  nature: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    gradient: 'from-green-500/20 to-transparent'
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // SWR data fetching
  const { locations, isLoading, meta } = useLocations({ limit: 50 });

  // Memoized filtering
  const filteredLocations = useFilteredLocations(locations, {
    category: selectedCategory,
    searchQuery,
  });

  const getColors = useCallback((category: string) => {
    return categoryColors[category] || {
      bg: 'bg-zinc-500/10',
      text: 'text-zinc-400',
      border: 'border-zinc-500/30',
      gradient: 'from-zinc-500/20 to-transparent'
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen py-12 md:py-20 relative">
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[var(--electric-cyan)]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--zzik-coral)]/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--electric-cyan)]/10 border border-[var(--electric-cyan)]/20 rounded-full text-sm text-[var(--electric-cyan)] mb-6"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Discover Korea
            </motion.span>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Explore
              <span className="text-[var(--electric-cyan)]"> Korea</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              Discover popular destinations and see where travelers go next
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10 space-y-6"
          >
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 pl-12 bg-zinc-800/50 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--zzik-coral)] focus:ring-1 focus:ring-[var(--zzik-coral)]/50 transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--zzik-coral)] text-white shadow-lg shadow-[var(--zzik-coral)]/25'
                      : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  {cat.nameKo}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Results count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <p className="text-zinc-500 text-sm">
              {filteredLocations.length} locations found
            </p>
            {meta && (
              <p className="text-zinc-600 text-xs">
                Total: {meta.total}
              </p>
            )}
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-48 bg-zinc-800/50 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Location Grid */}
          {!isLoading && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory + searchQuery}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredLocations.map((location) => {
                  const colors = getColors(location.category);

                  return (
                    <motion.div
                      key={location.id}
                      variants={itemVariants}
                      layout
                    >
                      <Link
                        href={`/journey?location=${location.id}`}
                        className={`group block p-6 rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.gradient} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 h-full`}
                      >
                        {/* Category badge */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text} border ${colors.border} mb-4`}>
                          {categories.find(c => c.id === location.category)?.icon}
                          {location.category}
                        </span>

                        {/* Name */}
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[var(--zzik-coral)] transition-colors">
                          {location.name_ko}
                        </h3>
                        <p className="text-zinc-400 text-sm mb-4">
                          {location.name}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            <span className="tabular-nums">{location.visit_count?.toLocaleString() || 0}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span className="tabular-nums">{location.photo_count || 0}</span>
                          </div>

                          {location.avg_rating && (
                            <div className="flex items-center gap-1.5 text-amber-400">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="tabular-nums">{location.avg_rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Arrow indicator */}
                        <div className="mt-4 flex items-center gap-2 text-[var(--zzik-coral)] opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm font-medium">See journey data</span>
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Empty state */}
          {!isLoading && filteredLocations.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-zinc-400 text-lg mb-2">No locations found</p>
              <p className="text-zinc-600 text-sm mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-[var(--zzik-coral)] hover:bg-[var(--zzik-coral)]/90 text-white font-medium rounded-xl transition-colors"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
