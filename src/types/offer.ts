
export interface OfferItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  items: OfferItem[];
  totalPrice: number;
  validUntil: Date | string;
}

export interface SavedOffer {
  id: string;
  user_id: string;
  offer_data: Offer; // This will be properly typed now
  title: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}
