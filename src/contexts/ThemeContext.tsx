'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'rose' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = {
  cyan: {
    name: 'Ocean Blue',
    primary: 'from-cyan-500 via-teal-500 to-blue-600',
    secondary: 'from-cyan-600 to-teal-600',
    accent: 'cyan',
    text: 'text-cyan-200',
    icon: 'text-cyan-300',
    card: 'bg-white/95 backdrop-blur-md border-white/30',
    cardText: 'text-gray-900',
    cardSubtext: 'text-gray-700',
    placeholder: 'placeholder-cyan-300',
    floating: {
      primary: 'bg-cyan-500/15',
      secondary: 'bg-teal-500/20',
    }
  },
  blue: {
    name: 'Classic Blue',
    primary: 'from-blue-600 via-indigo-600 to-purple-700',
    secondary: 'from-blue-600 to-indigo-600',
    accent: 'blue',
    text: 'text-blue-200',
    icon: 'text-blue-300',
    card: 'bg-white/95 backdrop-blur-md border-white/30',
    cardText: 'text-gray-900',
    cardSubtext: 'text-gray-700',
    placeholder: 'placeholder-blue-300',
    floating: {
      primary: 'bg-blue-500/15',
      secondary: 'bg-indigo-500/20',
    }
  },
  purple: {
    name: 'Royal Purple',
    primary: 'from-purple-600 via-pink-600 to-indigo-700',
    secondary: 'from-purple-600 to-pink-600',
    accent: 'purple',
    text: 'text-purple-200',
    icon: 'text-purple-300',
    card: 'bg-white/95 backdrop-blur-md border-white/30',
    cardText: 'text-gray-900',
    cardSubtext: 'text-gray-700',
    placeholder: 'placeholder-purple-300',
    floating: {
      primary: 'bg-purple-500/15',
      secondary: 'bg-pink-500/20',
    }
  },
  green: {
    name: 'Emerald Green',
    primary: 'from-green-600 via-emerald-600 to-teal-700',
    secondary: 'from-green-600 to-emerald-600',
    accent: 'green',
    text: 'text-green-200',
    icon: 'text-green-300',
    card: 'bg-white/95 backdrop-blur-md border-white/30',
    cardText: 'text-gray-900',
    cardSubtext: 'text-gray-700',
    placeholder: 'placeholder-green-300',
    floating: {
      primary: 'bg-green-500/15',
      secondary: 'bg-emerald-500/20',
    }
  },
  orange: {
    name: 'Sunset Orange',
    primary: 'from-orange-500 via-red-500 to-pink-600',
    secondary: 'from-orange-600 to-red-600',
    accent: 'orange',
    text: 'text-orange-200',
    icon: 'text-orange-300',
    card: 'bg-white/95 backdrop-blur-md border-white/30',
    cardText: 'text-gray-900',
    cardSubtext: 'text-gray-700',
    placeholder: 'placeholder-orange-300',
    floating: {
      primary: 'bg-orange-500/15',
      secondary: 'bg-red-500/20',
    }
  },
  rose: {
    name: 'Rose Pink',
    primary: 'from-rose-500 via-pink-500 to-purple-600',
    secondary: 'from-rose-600 to-pink-600',
    accent: 'rose',
    text: 'text-rose-200',
    icon: 'text-rose-300',
    card: 'bg-white/95 backdrop-blur-md border-white/30',
    cardText: 'text-gray-900',
    cardSubtext: 'text-gray-700',
    placeholder: 'placeholder-rose-300',
    floating: {
      primary: 'bg-rose-500/15',
      secondary: 'bg-pink-500/20',
    }
  },
  dark: {
    name: 'Dark Mode',
    primary: 'from-gray-900 via-gray-800 to-black',
    secondary: 'from-gray-700 to-gray-800',
    accent: 'gray',
    text: 'text-gray-300',
    icon: 'text-gray-400',
    card: 'bg-gray-800/90 border-gray-700/50',
    cardText: 'text-gray-200',
    cardSubtext: 'text-gray-400',
    placeholder: 'placeholder-gray-400',
    floating: {
      primary: 'bg-gray-500/10',
      secondary: 'bg-gray-600/15',
    },
    table: 'bg-gray-800/90 border-gray-700/50',
    tableHeader: 'bg-gray-700/50 text-gray-200',
    tableRow: 'border-gray-700/30 hover:bg-gray-700/30',
    input: 'bg-gray-800/90 border-gray-600/50 text-gray-200 placeholder-gray-500',
    button: 'bg-gray-700 hover:bg-gray-600 text-gray-200'
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('cyan');
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
    setIsDark(theme === 'dark');
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, isMounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return a default theme instead of throwing an error
    return {
      theme: 'cyan' as Theme,
      setTheme: () => {},
      isDark: false
    };
  }
  return context;
}
