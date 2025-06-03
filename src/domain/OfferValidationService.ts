
import { Offer } from '@/types/offer';

export class OfferValidationService {
  static validateOffer(offer: Offer): string[] {
    const errors: string[] = [];

    if (!offer.title?.trim()) {
      errors.push('Angebot muss einen Titel haben');
    }

    if (!offer.description?.trim()) {
      errors.push('Angebot muss eine Beschreibung haben');
    }

    if (!offer.items || offer.items.length === 0) {
      errors.push('Angebot muss mindestens eine Leistung enthalten');
    }

    if (offer.totalPrice <= 0) {
      errors.push('Gesamtpreis muss größer als 0 sein');
    }

    offer.items?.forEach((item, index) => {
      if (!item.name?.trim()) {
        errors.push(`Leistung ${index + 1} muss einen Namen haben`);
      }
      if (item.price <= 0) {
        errors.push(`Leistung ${index + 1} muss einen gültigen Preis haben`);
      }
      if (item.quantity <= 0) {
        errors.push(`Leistung ${index + 1} muss eine gültige Menge haben`);
      }
    });

    return errors;
  }

  static isOfferExpired(offer: Offer): boolean {
    const validUntilDate = typeof offer.validUntil === 'string' 
      ? new Date(offer.validUntil) 
      : offer.validUntil;
    
    return validUntilDate < new Date();
  }

  static ensureValidUntilDate(offer: Offer): Offer {
    let validUntilDate;
    if (offer.validUntil) {
      validUntilDate = new Date(offer.validUntil);
    }

    if (!validUntilDate || isNaN(validUntilDate.getTime()) || validUntilDate < new Date()) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      offer.validUntil = futureDate.toISOString();
    } else {
      offer.validUntil = validUntilDate.toISOString();
    }

    return offer;
  }
}
