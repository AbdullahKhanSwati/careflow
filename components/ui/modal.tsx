'use client';

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
};

/**
 * Centered modal portal-mounted at the document body. Rendering at the body
 * sidesteps any ancestor transform / filter that would otherwise turn
 * `position: fixed` into "positioned relative to that ancestor". The modal
 * itself caps its height at the viewport so long forms scroll inside the
 * modal instead of pushing the dialog off-screen.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: ModalProps) {
  // SSR-safe portal target — `document` only exists after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // Lock body scroll while open so the page never moves underneath.
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !mounted) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal — flex column so internal sections share the height budget. */}
      <div
        className={cn(
          'relative w-full flex flex-col',
          'rounded-lg border border-border bg-card shadow-xl',
          'animate-in zoom-in-95 fade-in duration-200',
          // Cap to viewport so the modal is fully visible regardless of
          // page scroll. The inner content area takes any leftover height.
          'max-h-[calc(100vh-2rem)]',
          sizeClasses[size],
          className
        )}
      >
        {/* Header — fixed height */}
        <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-foreground"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 -mt-1 -mr-2"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content — fills remaining height, scrolls internally */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>

        {/* Footer — fixed height */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
