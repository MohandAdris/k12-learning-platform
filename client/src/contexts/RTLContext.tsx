import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RTLContextType {
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
}

const RTLContext = createContext<RTLContextType>({
  isRTL: false,
  direction: 'ltr',
});

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const rtlLanguages = ['ar', 'he'];
    const isRTL = rtlLanguages.includes(i18n.language);
    const newDirection = isRTL ? 'rtl' : 'ltr';
    
    setDirection(newDirection);
    document.documentElement.dir = newDirection;
    document.documentElement.lang = i18n.language;
    
    // Add RTL class to body for styling
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  return (
    <RTLContext.Provider value={{ isRTL: direction === 'rtl', direction }}>
      {children}
    </RTLContext.Provider>
  );
}

export function useRTL() {
  return useContext(RTLContext);
}

