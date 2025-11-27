'use client';

import { forwardRef, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

export interface PhotoUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'> {
  accept?: string;
  maxSize?: number; // bytes
  multiple?: boolean;
  disabled?: boolean;
  onUpload?: (files: File[]) => Promise<void>;
  onError?: (error: Error) => void;
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

export const PhotoUpload = forwardRef<HTMLDivElement, PhotoUploadProps>(
  (
    {
      className,
      accept = 'image/jpeg,image/png,image/webp',
      maxSize = 10 * 1024 * 1024, // 10MB
      multiple = false,
      disabled = false,
      onUpload,
      onError,
      ...props
    },
    ref
  ) => {
    const [state, setState] = useState<UploadState>('idle');
    const [preview, setPreview] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setState('dragging');
    }, [disabled]);

    const handleDragLeave = useCallback(() => {
      setState('idle');
    }, []);

    // Phase 1.3: processFiles를 useCallback 내부로 인라인화하여 의존성 문제 해결
    const handleDrop = useCallback(
      async (e: React.DragEvent) => {
        e.preventDefault();
        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);

        // 인라인 처리 (의존성 문제 해결)
        const validFiles = files.filter((file) =>
          accept.split(',').some((type) => file.type.match(type.trim()))
        );

        if (validFiles.length === 0) {
          setState('error');
          onError?.(new Error('Invalid file type'));
          return;
        }

        const oversizedFiles = validFiles.filter((file) => file.size > maxSize);
        if (oversizedFiles.length > 0) {
          setState('error');
          onError?.(new Error(`File too large. Max size: ${maxSize / 1024 / 1024}MB`));
          return;
        }

        const filesToUpload = multiple ? validFiles : [validFiles[0]];

        if (filesToUpload[0]) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setPreview(event.target?.result as string);
          };
          reader.readAsDataURL(filesToUpload[0]);
        }

        if (onUpload) {
          setState('uploading');
          try {
            await onUpload(filesToUpload);
            setState('success');
          } catch (error) {
            setState('error');
            onError?.(error instanceof Error ? error : new Error('Upload failed'));
          }
        }
      },
      [disabled, accept, maxSize, multiple, onUpload, onError]
    );

    const handleFileSelect = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled || !e.target.files) return;

        const files = Array.from(e.target.files);

        // 인라인 처리
        const validFiles = files.filter((file) =>
          accept.split(',').some((type) => file.type.match(type.trim()))
        );

        if (validFiles.length === 0) {
          setState('error');
          onError?.(new Error('Invalid file type'));
          return;
        }

        const oversizedFiles = validFiles.filter((file) => file.size > maxSize);
        if (oversizedFiles.length > 0) {
          setState('error');
          onError?.(new Error(`File too large. Max size: ${maxSize / 1024 / 1024}MB`));
          return;
        }

        const filesToUpload = multiple ? validFiles : [validFiles[0]];

        if (filesToUpload[0]) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setPreview(event.target?.result as string);
          };
          reader.readAsDataURL(filesToUpload[0]);
        }

        if (onUpload) {
          setState('uploading');
          try {
            await onUpload(filesToUpload);
            setState('success');
          } catch (error) {
            setState('error');
            onError?.(error instanceof Error ? error : new Error('Upload failed'));
          }
        }
      },
      [disabled, accept, maxSize, multiple, onUpload, onError]
    );

    const stateClasses = {
      idle: '',
      dragging: 'is-dragging',
      uploading: '',
      success: 'is-success',
      error: 'has-error',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'photo-upload-zone',
          stateClasses[state],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        {...props}
      >
        {preview && state === 'success' ? (
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <>
            <svg
              className="photo-upload-zone-icon"
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

            <p className="photo-upload-zone-text">
              {state === 'dragging'
                ? 'Drop your photo here'
                : state === 'uploading'
                ? 'Uploading...'
                : state === 'error'
                ? 'Upload failed. Try again.'
                : 'Drag photos here or click to upload'}
            </p>

            <p className="photo-upload-zone-hint">
              JPG, PNG, WebP up to {maxSize / 1024 / 1024}MB
            </p>
          </>
        )}

        <input
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileSelect}
          aria-label="Upload photo"
        />
      </div>
    );
  }
);

PhotoUpload.displayName = 'PhotoUpload';
