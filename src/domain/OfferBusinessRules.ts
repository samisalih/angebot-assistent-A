
import { Offer, OfferItem } from '@/types/offer';

export class OfferBusinessRules {
  private static readonly MIN_OFFER_VALUE = 100;
  private static readonly MAX_OFFER_VALUE = 50000;
  private static readonly MAX_ITEMS_PER_OFFER = 10;
  private static readonly MIN_HOURLY_RATE = 50;
  private static readonly MAX_HOURLY_RATE = 500;

  static validateBusinessRules(offer: Offer): string[] {
    const errors: string[] = [];

    // Basic structure validation
    if (!offer) {
      errors.push('Angebot ist nicht definiert');
      return errors;
    }

    if (!offer.items || !Array.isArray(offer.items)) {
      errors.push('Angebot muss Leistungen enthalten');
      return errors;
    }

    // Total price validation
    if (!offer.totalPrice || typeof offer.totalPrice !== 'number') {
      errors.push('Gesamtpreis ist nicht definiert');
      return errors;
    }

    if (offer.totalPrice < this.MIN_OFFER_VALUE) {
      errors.push(`Angebotswert muss mindestens ${this.MIN_OFFER_VALUE}€ betragen`);
    }

    if (offer.totalPrice > this.MAX_OFFER_VALUE) {
      errors.push(`Angebotswert darf nicht mehr als ${this.MAX_OFFER_VALUE}€ betragen`);
    }

    // Items count validation
    if (offer.items.length > this.MAX_ITEMS_PER_OFFER) {
      errors.push(`Maximal ${this.MAX_ITEMS_PER_OFFER} Leistungen pro Angebot erlaubt`);
    }

    // Item-level validations
    offer.items.forEach((item, index) => {
      const itemErrors = this.validateOfferItem(item, index + 1);
      errors.push(...itemErrors);
    });

    // Price consistency check
    const calculatedTotal = offer.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(calculatedTotal - offer.totalPrice) > 0.01) {
      errors.push('Gesamtpreis stimmt nicht mit der Summe der Einzelleistungen überein');
    }

    return errors;
  }

  private static validateOfferItem(item: OfferItem, itemNumber: number): string[] {
    const errors: string[] = [];

    if (!item) {
      errors.push(`Leistung ${itemNumber} ist nicht definiert`);
      return errors;
    }

    // Hourly rate validation
    if (typeof item.price !== 'number' || item.price < this.MIN_HOURLY_RATE) {
      errors.push(`Stundensatz für Leistung ${itemNumber} zu niedrig (min. ${this.MIN_HOURLY_RATE}€)`);
    }

    if (item.price > this.MAX_HOURLY_RATE) {
      errors.push(`Stundensatz für Leistung ${itemNumber} zu hoch (max. ${this.MAX_HOURLY_RATE}€)`);
    }

    // Quantity validation
    if (typeof item.quantity !== 'number' || item.quantity < 1) {
      errors.push(`Stundenaufwand für Leistung ${itemNumber} muss mindestens 1 Stunde betragen`);
    }

    if (item.quantity > 200) {
      errors.push(`Stundenaufwand für Leistung ${itemNumber} unrealistisch hoch (max. 200h)`);
    }

    // Description length validation
    if (!item.description || typeof item.description !== 'string') {
      errors.push(`Beschreibung für Leistung ${itemNumber} fehlt`);
    } else {
      if (item.description.length < 10) {
        errors.push(`Beschreibung für Leistung ${itemNumber} zu kurz (min. 10 Zeichen)`);
      }

      if (item.description.length > 500) {
        errors.push(`Beschreibung für Leistung ${itemNumber} zu lang (max. 500 Zeichen)`);
      }
    }

    return errors;
  }

  static generateOfferSummary(offer: Offer): string {
    if (!offer || !offer.items || !Array.isArray(offer.items) || offer.items.length === 0) {
      return 'Angebot enthält keine Leistungen';
    }

    const totalHours = offer.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const avgHourlyRate = totalHours > 0 ? offer.totalPrice / totalHours : 0;

    return `${offer.items.length} Leistung(en), ${totalHours}h Gesamtaufwand, ⌀${avgHourlyRate.toFixed(0)}€/h`;
  }
}
