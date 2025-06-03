
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface OfferContextType {
  hasGeneratedOffer: boolean;
  setHasGeneratedOffer: (value: boolean) => void;
  currentOffer: any;
  setCurrentOffer: (offer: any) => void;
}

const OfferContext = createContext<OfferContextType | undefined>(undefined);

export const useOffer = () => {
  const context = useContext(OfferContext);
  if (context === undefined) {
    throw new Error('useOffer must be used within an OfferProvider');
  }
  return context;
};

interface OfferProviderProps {
  children: ReactNode;
}

export const OfferProvider = ({ children }: OfferProviderProps) => {
  const [hasGeneratedOffer, setHasGeneratedOffer] = useState(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('hasGeneratedOffer');
    return stored ? JSON.parse(stored) : false;
  });
  
  const [currentOffer, setCurrentOffer] = useState(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('currentOffer');
    return stored ? JSON.parse(stored) : null;
  });

  // Persist hasGeneratedOffer to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hasGeneratedOffer', JSON.stringify(hasGeneratedOffer));
  }, [hasGeneratedOffer]);

  // Persist currentOffer to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentOffer', JSON.stringify(currentOffer));
  }, [currentOffer]);

  const value = {
    hasGeneratedOffer,
    setHasGeneratedOffer,
    currentOffer,
    setCurrentOffer,
  };

  return (
    <OfferContext.Provider value={value}>
      {children}
    </OfferContext.Provider>
  );
};
