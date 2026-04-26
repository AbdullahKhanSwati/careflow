'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { useNodes } from '@/components/providers/node-provider';
import { NodeIcon } from '@/components/features/nodes/node-icon';
import { NODE_TYPE_LABEL, getNodeColor } from '@/lib/constants/node-colors';
import type { Theme } from '@/types';

const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { selectedNode } = useNodes();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun;
  const tokens = selectedNode
    ? getNodeColor(selectedNode.type, selectedNode.level)
    : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>

        {selectedNode && tokens && (
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-lg border px-3 py-1.5',
              'border-border bg-card min-w-0'
            )}
          >
            <NodeIcon
              type={selectedNode.type}
              level={selectedNode.level}
              size="xs"
            />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
                {NODE_TYPE_LABEL[selectedNode.type]}
              </p>
              <p className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                {selectedNode.name}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          aria-label="Notifications"
          className={cn(
            'relative rounded-lg p-2.5',
            'text-muted-foreground hover:text-foreground hover:bg-muted',
            'transition-colors'
          )}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <div ref={themeRef} className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            aria-label="Toggle theme"
            className="rounded-lg p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ThemeIcon className="h-5 w-5" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 top-full mt-2 w-36 rounded-lg border border-border bg-popover p-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTheme(option.value);
                      setShowThemeMenu(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                      theme === option.value
                        ? 'bg-primary/10 text-primary'
                        : 'text-popover-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 sm:pr-3 hover:bg-muted transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@careflow.com</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-popover shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-border">
                <p className="font-medium text-popover-foreground">Admin User</p>
                <p className="text-sm text-muted-foreground">admin@careflow.com</p>
              </div>
              <div className="p-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <Link
                  href="/login"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
