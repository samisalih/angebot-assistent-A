
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
  
  // Logo area (top-left corner) - reserve space for logo
  // Draw a placeholder rectangle for logo (50x30mm area)
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(20, 15, 50, 30);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Logo', 42, 32);
  
  // Header - moved to the right to accommodate logo
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Angebot', 80, 30);
  
  // Offer details - start below logo area
  let currentY = 60;
  doc.setFontSize(16);
  // Wrap title text to prevent overflow
  const titleLines = doc.splitTextToSize(offer.title, 170);
  doc.text(titleLines, 20, currentY);
  
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  // Wrap description text to prevent overflow
  const descriptionLines = doc.splitTextToSize(offer.description, 170);
  currentY = 60 + (titleLines.length * 6) + 5;
  doc.text(descriptionLines, 20, currentY);
  
  // Valid until date
  const validUntilDate = typeof offer.validUntil === 'string' 
    ? new Date(offer.validUntil) 
    : offer.validUntil;
  currentY += (descriptionLines.length * 5) + 10;
  doc.text(`Gültig bis: ${validUntilDate.toLocaleDateString('de-DE')}`, 20, currentY);
  
  // Items header
  currentY += 20;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Leistungen:', 20, currentY);
  
  // Items table
  currentY += 15;
  doc.setFontSize(10);
  
  // Table headers
  doc.setTextColor(60, 60, 60);
  doc.text('Leistung', 20, currentY);
  doc.text('Beschreibung', 70, currentY);
  doc.text('Menge', 140, currentY);
  doc.text('Preis', 160, currentY);
  
  currentY += 5;
  
  // Draw line under headers
  doc.line(20, currentY, 190, currentY);
  
  currentY += 10;
  
  // Items
  doc.setTextColor(40, 40, 40);
  offer.items.forEach((item) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 30;
    }
    
    const itemTotal = item.price * item.quantity;
    
    // Wrap text for long descriptions with proper width limits
    const splitDescription = doc.splitTextToSize(item.description, 65);
    const splitName = doc.splitTextToSize(item.name, 45);
    
    doc.text(splitName, 20, currentY);
    doc.text(splitDescription, 70, currentY);
    doc.text(item.quantity.toString(), 140, currentY);
    doc.text(`${itemTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`, 160, currentY);
    
    // Calculate height needed for this row
    const maxLines = Math.max(splitName.length, splitDescription.length);
    currentY += maxLines * 5 + 5;
  });
  
  // Total section
  currentY += 10;
  doc.line(20, currentY, 190, currentY);
  currentY += 10;
  
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Gesamtpreis:', 120, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(
    offer.totalPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
    160,
    currentY
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
