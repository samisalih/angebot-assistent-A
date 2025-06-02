
import { createContext, useContext, useState, ReactNode } from 'react';

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
  const [hasGeneratedOffer, setHasGeneratedOffer] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);

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
