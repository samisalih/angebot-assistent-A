
import { supabase } from '@/integrations/supabase/client';

export interface SavedOffer {
  id: string;
  user_id: string;
  offer_data: any;
  title: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}

// Function to clean up expired offers
const cleanupExpiredOffers = async () => {
  try {
    // Delete offers where validUntil date has passed
    const { error } = await supabase
      .from('saved_offers')
      .delete()
      .lt('offer_data->validUntil', new Date().toISOString());

    if (error) {
      console.error('Error cleaning up expired offers:', error);
    }
  } catch (error) {
    console.error('Error in cleanup function:', error);
  }
};

export const saveOffer = async (offer: any) => {
  const { data, error } = await supabase
    .from('saved_offers')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      offer_data: offer,
      title: offer.title,
      total_price: offer.totalPrice,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getSavedOffers = async () => {
  // Clean up expired offers before fetching
  await cleanupExpiredOffers();

  const { data, error } = await supabase
    .from('saved_offers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const deleteSavedOffer = async (offerId: string) => {
  const { error } = await supabase
    .from('saved_offers')
    .delete()
    .eq('id', offerId);

  if (error) {
    throw error;
  }
};
