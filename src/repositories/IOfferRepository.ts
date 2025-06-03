
import { Offer, SavedOffer } from '@/types/offer';

export interface IOfferRepository {
  save(offer: Offer): Promise<SavedOffer>;
  getAll(): Promise<SavedOffer[]>;
  delete(offerId: string): Promise<void>;
}
