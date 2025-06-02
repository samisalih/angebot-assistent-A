
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
  validUntil: Date;
}

export function parseOfferFromMessage(aiMessage: string): { offer: Offer | null; cleanMessage: string } {
  let offer = null;
  let cleanMessage = aiMessage;

  // Look for the OFFER_START/OFFER_END format
  const offerMatch = aiMessage.match(/OFFER_START([\s\S]*?)OFFER_END/);
  if (offerMatch) {
    console.log('Found offer in response, parsing...');
    const offerContent = offerMatch[1].trim();
    
    try {
      // Parse the offer content
      const titleMatch = offerContent.match(/Titel:\s*(.+)/);
      const descMatch = offerContent.match(/Beschreibung:\s*(.+)/);
      const itemsMatch = offerContent.match(/Items:\s*(.+)/);

      console.log('Title match:', titleMatch);
      console.log('Description match:', descMatch);
      console.log('Items match:', itemsMatch);

      if (titleMatch && descMatch && itemsMatch) {
        const title = titleMatch[1].trim();
        const description = descMatch[1].trim();
        const itemsStr = itemsMatch[1].trim();

        // Parse items
        const items = itemsStr.split(',').map(item => {
          const parts = item.trim().split('|');
          if (parts.length === 4) {
            return {
              name: parts[0].trim(),
              description: parts[1].trim(),
              price: parseFloat(parts[2].trim()),
              quantity: parseInt(parts[3].trim()),
            };
          }
          return null;
        }).filter(item => item !== null);

        console.log('Parsed items:', items);

        if (items.length > 0) {
          const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          offer = {
            id: `offer-${Date.now()}`,
            title,
            description,
            items,
            totalPrice,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          };

          console.log('Generated offer:', offer);
        }
      }
    } catch (error) {
      console.error('Error parsing offer:', error);
    }

    // Remove the offer request from the message
    cleanMessage = aiMessage.replace(/OFFER_START[\s\S]*?OFFER_END/, '').trim();
  }

  return { offer, cleanMessage };
}
