
import { Offer } from '@/types/offer';

export interface IOfferRepository {
  save(offer: Offer): Promise<any>;
  getAll(): Promise<any[]>;
  delete(offerId: string): Promise<void>;
}

export class OfferDomain {
  constructor(private offerRepository: IOfferRepository) {}

  async saveOffer(offer: Offer) {
    const validatedOffer = this.validateAndSanitizeOffer(offer);
    return this.offerRepository.save(validatedOffer);
  }

  async getSavedOffers() {
    return this.offerRepository.getAll();
  }

  async deleteSavedOffer(offerId: string) {
    if (!offerId || typeof offerId !== 'string') {
      throw new Error('Invalid offer ID');
    }
    return this.offerRepository.delete(offerId);
  }

  private validateAndSanitizeOffer(offer: Offer): Offer {
    if (!offer.title?.trim()) {
      throw new Error('Angebot muss einen Titel haben');
    }

    if (!offer.description?.trim()) {
      throw new Error('Angebot muss eine Beschreibung haben');
    }

    if (!offer.items || offer.items.length === 0) {
      throw new Error('Angebot muss mindestens eine Leistung enthalten');
    }

    if (offer.totalPrice <= 0) {
      throw new Error('Gesamtpreis muss größer als 0 sein');
    }

    // Ensure valid until date
    if (!offer.validUntil || new Date(offer.validUntil) < new Date()) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      offer.validUntil = futureDate.toISOString();
    }

    return offer;
  }
}
