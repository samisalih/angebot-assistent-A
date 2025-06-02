
import jsPDF from 'jspdf';

interface OfferItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  items: OfferItem[];
  totalPrice: number;
  validUntil: Date | string;
}

export const generateOfferPDF = (offer: Offer): void => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Angebot', 20, 30);
  
  // Offer details
  doc.setFontSize(16);
  doc.text(offer.title, 20, 50);
  
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(offer.description, 20, 60);
  
  // Valid until date
  const validUntilDate = typeof offer.validUntil === 'string' 
    ? new Date(offer.validUntil) 
    : offer.validUntil;
  doc.text(`Gültig bis: ${validUntilDate.toLocaleDateString('de-DE')}`, 20, 70);
  
  // Items header
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Leistungen:', 20, 90);
  
  // Items table
  let yPosition = 105;
  doc.setFontSize(10);
  
  // Table headers
  doc.setTextColor(60, 60, 60);
  doc.text('Leistung', 20, yPosition);
  doc.text('Beschreibung', 70, yPosition);
  doc.text('Menge', 140, yPosition);
  doc.text('Preis', 160, yPosition);
  
  yPosition += 10;
  
  // Draw line under headers
  doc.line(20, yPosition - 5, 190, yPosition - 5);
  
  // Items
  doc.setTextColor(40, 40, 40);
  offer.items.forEach((item) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    
    const itemTotal = item.price * item.quantity;
    
    // Wrap text for long descriptions
    const splitDescription = doc.splitTextToSize(item.description, 60);
    const splitName = doc.splitTextToSize(item.name, 45);
    
    doc.text(splitName, 20, yPosition);
    doc.text(splitDescription, 70, yPosition);
    doc.text(item.quantity.toString(), 140, yPosition);
    doc.text(`${itemTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`, 160, yPosition);
    
    // Calculate height needed for this row
    const maxLines = Math.max(splitName.length, splitDescription.length);
    yPosition += maxLines * 5 + 5;
  });
  
  // Total section
  yPosition += 10;
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;
  
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Gesamtpreis:', 120, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.text(
    offer.totalPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
    160,
    yPosition
  );
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Erstellt am: ' + new Date().toLocaleDateString('de-DE'), 20, 280);
  doc.text(`Angebots-ID: ${offer.id}`, 120, 280);
  
  // Save the PDF
  const fileName = `Angebot_${offer.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
