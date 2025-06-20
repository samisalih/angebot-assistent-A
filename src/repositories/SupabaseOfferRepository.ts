
import { supabase } from '@/integrations/supabase/client';
import { IOfferRepository } from './IOfferRepository';
import { Offer, SavedOffer } from '@/types/offer';

export class SupabaseOfferRepository implements IOfferRepository {
  async save(offer: Offer): Promise<SavedOffer> {
    const { data, error } = await supabase
      .from('saved_offers')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        offer_data: offer as any, // Cast to any for JSON storage
        title: offer.title,
        total_price: offer.totalPrice,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Cast the response data to our SavedOffer type
    return {
      ...data,
      offer_data: data.offer_data as unknown as Offer
    } as SavedOffer;
  }

  async getAll(): Promise<SavedOffer[]> {
    // Clean up expired offers before fetching
    await this.cleanupExpiredOffers();

    const { data, error } = await supabase
      .from('saved_offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Cast the response data to our SavedOffer type
    return (data || []).map(item => ({
      ...item,
      offer_data: item.offer_data as unknown as Offer
    })) as SavedOffer[];
  }

  async delete(offerId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_offers')
      .delete()
      .eq('id', offerId);

    if (error) {
      throw error;
    }
  }

  private async cleanupExpiredOffers(): Promise<void> {
    try {
      const { error } = await supabase
        .from('saved_offers')
        .delete()
        .lt('offer_data->>validUntil', new Date().toISOString());

      if (error) {
        console.error('Error cleaning up expired offers:', error);
      }
    } catch (error) {
      console.error('Error in cleanup function:', error);
    }
  }
}
