import React, { createContext, useContext, useState } from 'react';

export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  error: '#FF3B30',
  text: {
    primary: '#000000',
    secondary: '#3C3C43',
    disabled: '#C7C7CC',
  },
  border: '#C6C6C8',
};

interface Theme {
  colors: typeof colors;
  dark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const defaultTheme: Theme = {
  colors,
  dark: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const toggleTheme = () => {
    setTheme((currentTheme) => ({
      ...currentTheme,
      dark: !currentTheme.dark,
    }));
  };

  const value = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
