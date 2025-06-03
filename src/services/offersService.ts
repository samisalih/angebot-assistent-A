
import { SupabaseOfferRepository } from '@/repositories/SupabaseOfferRepository';
import { IOfferRepository } from '@/repositories/IOfferRepository';
import { Offer, SavedOffer } from '@/types/offer';

// Use dependency injection pattern
class OffersService {
  constructor(private offerRepository: IOfferRepository) {}

  async saveOffer(offer: Offer): Promise<SavedOffer> {
    return this.offerRepository.save(offer);
  }

  async getSavedOffers(): Promise<SavedOffer[]> {
    return this.offerRepository.getAll();
  }

  async deleteSavedOffer(offerId: string): Promise<void> {
    return this.offerRepository.delete(offerId);
  }
}

// Create singleton instance with Supabase repository
const offersService = new OffersService(new SupabaseOfferRepository());

// Export individual functions for backward compatibility
export const saveOffer = (offer: Offer) => offersService.saveOffer(offer);
export const getSavedOffers = () => offersService.getSavedOffers();
export const deleteSavedOffer = (offerId: string) => offersService.deleteSavedOffer(offerId);

// Export types for external use
export type { SavedOffer };
