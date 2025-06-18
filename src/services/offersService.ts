
import { SupabaseOfferRepository } from '@/repositories/SupabaseOfferRepository';
import { OfferDomain } from '@/domain/OfferDomain';
import { Offer, SavedOffer } from '@/types/offer';

// Dependency injection
const offerRepository = new SupabaseOfferRepository();
const offerDomain = new OfferDomain(offerRepository);

// Export individual functions for backward compatibility
export const saveOffer = (offer: Offer): Promise<SavedOffer> => 
  offerDomain.saveOffer(offer);

export const getSavedOffers = (): Promise<SavedOffer[]> => 
  offerDomain.getSavedOffers();

export const deleteSavedOffer = (offerId: string): Promise<void> => 
  offerDomain.deleteSavedOffer(offerId);

// Export types for external use
export type { SavedOffer };
