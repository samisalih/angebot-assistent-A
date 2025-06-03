
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

        // Parse items - Split by "), " to handle commas in descriptions better
        const items: OfferItem[] = [];
        
        // Split items more carefully by looking for the pattern: name|description|price|quantity
        const itemParts = itemsStr.split(/,\s*(?=[^|]*\|[^|]*\|[\d.,]+\|\d+)/);
        
        console.log('Item parts after split:', itemParts);

        for (const itemPart of itemParts) {
          const parts = itemPart.trim().split('|');
          console.log('Processing item parts:', parts);
          
          if (parts.length === 4) {
            const name = parts[0].trim();
            const description = parts[1].trim();
            const priceStr = parts[2].trim().replace(',', '.'); // Handle German decimal format
            const quantityStr = parts[3].trim();
            
            const price = parseFloat(priceStr);
            const quantity = parseInt(quantityStr);
            
            if (!isNaN(price) && !isNaN(quantity)) {
              items.push({
                name,
                description,
                price,
                quantity,
              });
            } else {
              console.log('Failed to parse price or quantity:', { priceStr, quantityStr, price, quantity });
            }
          } else {
            console.log('Item does not have 4 parts:', parts);
          }
        }

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
        } else {
          console.log('No valid items found in offer');
        }
      } else {
        console.log('Missing required offer fields:', { titleMatch: !!titleMatch, descMatch: !!descMatch, itemsMatch: !!itemsMatch });
      }
    } catch (error) {
      console.error('Error parsing offer:', error);
    }

    // Remove the entire offer content from the message to prevent prices showing in chat
    cleanMessage = aiMessage.replace(/OFFER_START[\s\S]*?OFFER_END/, '').trim();
    
    // Also remove any remaining price mentions that might be in the message
    // Remove patterns like "€X,XXX" or "XXX €" or "EUR XXX" 
    cleanMessage = cleanMessage.replace(/\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s*(?:€|EUR|Euro)\b/gi, '[Preis]');
    cleanMessage = cleanMessage.replace(/\b(?:€|EUR|Euro)\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\b/gi, '[Preis]');
    
    // Remove standalone price patterns
    cleanMessage = cleanMessage.replace(/\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\b(?=\s*(?:für|pro|je|gesamt|insgesamt))/gi, '[Preis]');
  }

  return { offer, cleanMessage };
}
