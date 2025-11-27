'use client';

import { forwardRef, useCallback, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { extractGPSFromExif, type GPSResult } from '@/lib/gps';

export interface UploadedPhoto {
  file: File;
  preview: string;
  gps: GPSResult;
}

export interface SmartPhotoUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'> {
  accept?: string;
  maxSize?: number;
  onPhotoReady?: (photo: UploadedPhoto) => void;
  onError?: (error: Error) => void;
}

type UploadState = 'idle' | 'dragging' | 'processing' | 'ready' | 'error';

export const SmartPhotoUpload = forwardRef<HTMLDivElement, SmartPhotoUploadProps>(
  (
    {
      className,
      accept = 'image/jpeg,image/png,image/webp',
      maxSize = 10 * 1024 * 1024,
      onPhotoReady,
      onError,
      ...props
    },
    ref
  ) => {
    const [state, setState] = useState<UploadState>('idle');
    const [uploadedPhoto, setUploadedPhoto] = useState<UploadedPhoto | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setState('dragging');
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setState('idle');
    }, []);

    // Phase 1.3: processFile 로직 인라인화하여 의존성 문제 해결
    const handleDrop = useCallback(async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];

        // 인라인 검증 처리
        const validTypes = accept.split(',').map(t => t.trim());
        if (!validTypes.some(type => file.type.match(type))) {
          setErrorMessage('Invalid file type. Please upload JPG, PNG, or WebP.');
          setState('error');
          onError?.(new Error('Invalid file type'));
          return;
        }

        if (file.size > maxSize) {
          setErrorMessage(`File too large. Max size: ${maxSize / 1024 / 1024}MB`);
          setState('error');
          onError?.(new Error('File too large'));
          return;
        }

        setState('processing');
        setErrorMessage('');

        try {
          const gps = await extractGPSFromExif(file);
          const preview = URL.createObjectURL(file);
          const photo: UploadedPhoto = { file, preview, gps };

          setUploadedPhoto(photo);
          setState('ready');
          onPhotoReady?.(photo);
        } catch (error) {
          setErrorMessage('Failed to process photo. Please try again.');
          setState('error');
          onError?.(error instanceof Error ? error : new Error('Processing failed'));
        }
      }
    }, [accept, maxSize, onError, onPhotoReady]);

    const handleClick = () => {
      inputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await processFile(files[0]);
      }
    };

    const processFile = async (file: File) => {
      // Validate type
      const validTypes = accept.split(',').map(t => t.trim());
      if (!validTypes.some(type => file.type.match(type))) {
        setErrorMessage('Invalid file type. Please upload JPG, PNG, or WebP.');
        setState('error');
        onError?.(new Error('Invalid file type'));
        return;
      }

      // Validate size
      if (file.size > maxSize) {
        setErrorMessage(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
        setState('error');
        onError?.(new Error('File too large'));
        return;
      }

      setState('processing');
      setErrorMessage('');

      try {
        // Create preview
        const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Extract GPS from EXIF
        const gps = await extractGPSFromExif(file);

        const photo: UploadedPhoto = {
          file,
          preview,
          gps
        };

        setUploadedPhoto(photo);
        setState('ready');
        onPhotoReady?.(photo);
      } catch (error) {
        setErrorMessage('Failed to process photo. Please try again.');
        setState('error');
        onError?.(error as Error);
      }
    };

    const handleReset = () => {
      setUploadedPhoto(null);
      setState('idle');
      setErrorMessage('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all duration-300',
          state === 'idle' && 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900/70',
          state === 'dragging' && 'border-[var(--zzik-coral)] bg-[var(--zzik-coral)]/10 scale-[1.02]',
          state === 'processing' && 'border-[var(--electric-cyan)] bg-[var(--electric-cyan)]/10',
          state === 'ready' && 'border-green-500 bg-green-500/10',
          state === 'error' && 'border-red-500 bg-red-500/10',
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={state === 'idle' || state === 'error' ? handleClick : undefined}
        role="button"
        tabIndex={0}
        {...props}
      >
        {/* Ready state with preview */}
        {state === 'ready' && uploadedPhoto && (
          <div className="relative aspect-[4/3] w-full">
            <img
              src={uploadedPhoto.preview}
              alt="Uploaded photo"
              className="w-full h-full object-cover rounded-xl"
            />

            {/* GPS badge */}
            <div className="absolute top-3 left-3">
              {uploadedPhoto.gps.source === 'exif' ? (
                <div className="flex items-center gap-1.5 bg-green-500/90 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  GPS Found
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-amber-500/90 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  No GPS - Select Location
                </div>
              )}
            </div>

            {/* Camera info */}
            {uploadedPhoto.gps.metadata?.make && (
              <div className="absolute bottom-3 left-3 bg-black/70 text-white/80 text-xs px-2 py-1 rounded">
                {uploadedPhoto.gps.metadata.make} {uploadedPhoto.gps.metadata.model}
              </div>
            )}

            {/* Reset button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black/90 rounded-full transition-colors"
              aria-label="Remove photo"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Processing state */}
        {state === 'processing' && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-12 h-12 border-3 border-[var(--electric-cyan)] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-medium">Processing your photo...</p>
            <p className="text-zinc-400 text-sm mt-1">Extracting GPS data</p>
          </div>
        )}

        {/* Idle/Dragging/Error state */}
        {(state === 'idle' || state === 'dragging' || state === 'error') && (
          <div className="flex flex-col items-center justify-center py-16 px-6 cursor-pointer">
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors',
              state === 'dragging' ? 'bg-[var(--zzik-coral)]/20' : 'bg-zinc-800'
            )}>
              <svg
                className={cn(
                  'w-8 h-8 transition-colors',
                  state === 'dragging' ? 'text-[var(--zzik-coral)]' : 'text-zinc-400'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                />
              </svg>
            </div>

            <p className={cn(
              'font-medium mb-1',
              state === 'error' ? 'text-red-400' : 'text-white'
            )}>
              {state === 'dragging'
                ? 'Drop your photo here'
                : state === 'error'
                ? errorMessage
                : 'Upload your travel photo'}
            </p>

            <p className="text-zinc-400 text-sm text-center">
              {state === 'error'
                ? 'Click to try again'
                : 'Drag & drop or click to select'}
            </p>

            <p className="text-zinc-500 text-xs mt-3">
              JPG, PNG, WebP up to {maxSize / 1024 / 1024}MB
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileSelect}
          aria-label="Upload photo"
        />
      </div>
    );
  }
);

SmartPhotoUpload.displayName = 'SmartPhotoUpload';
