'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme, themes, Theme } from '@/contexts/ThemeContext';
import { ChevronDown, Palette, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
  const { theme, setTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = themes[theme];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all duration-300 flex items-center space-x-2 px-3 py-2 rounded-lg"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">{currentTheme.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl z-50">
          <div className="p-2 space-y-1">
            {Object.entries(themes).map(([key, themeConfig]) => (
              <button
                key={key}
                onClick={() => {
                  setTheme(key as Theme);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  theme === key
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${themeConfig.primary.split(' ').slice(1).join(' ')}`}></div>
                <span className="text-sm font-medium">{themeConfig.name}</span>
                {key === 'dark' && (
                  <div className="ml-auto">
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}






