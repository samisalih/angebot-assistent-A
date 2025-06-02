
import jsPDF from 'jspdf';
import { loadTitilliumWebFont } from '@/utils/fontLoader';

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

export const generateOfferPDF = async (offer: Offer): Promise<void> => {
  const doc = new jsPDF();
  
  // Try to load Titillium Web font
  let fontFamily = 'helvetica'; // Default fallback
  try {
    const fontBase64 = await loadTitilliumWebFont();
    if (fontBase64) {
      // Add the custom font to jsPDF
      doc.addFileToVFS('TitilliumWeb-Regular.ttf', fontBase64);
      doc.addFont('TitilliumWeb-Regular.ttf', 'TitilliumWeb', 'normal');
      doc.addFont('TitilliumWeb-Regular.ttf', 'TitilliumWeb', 'bold'); // Using same for bold for now
      fontFamily = 'TitilliumWeb';
    }
  } catch (error) {
    console.warn('Failed to load custom font, using fallback:', error);
  }
  
  // Set initial font
  doc.setFont(fontFamily, 'normal');
  
  // Define margins (in mm)
  const margins = {
    left: 20,
    right: 20,
    top: 10,
    bottom: 10
  };
  
  // Calculate usable page width
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const usableWidth = pageWidth - margins.left - margins.right;
  
  // Logo area (top-left corner) - reserve space for logo
  // Draw a placeholder rectangle for logo (50x30mm area)
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(margins.left, margins.top + 5, 50, 30);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Logo', margins.left + 22, margins.top + 22);
  
  // Header - moved to the right to accommodate logo
  doc.setFontSize(20);
  doc.setFont(fontFamily, 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Angebot', margins.left + 60, margins.top + 20);
  
  // Offer details - start below logo area
  let currentY = margins.top + 50;
  doc.setFontSize(16);
  doc.setFont(fontFamily, 'bold');
  // Wrap title text to prevent overflow
  const titleLines = doc.splitTextToSize(offer.title, usableWidth);
  doc.text(titleLines, margins.left, currentY);
  
  doc.setFontSize(12);
  doc.setFont(fontFamily, 'normal');
  doc.setTextColor(80, 80, 80);
  // Wrap description text to prevent overflow
  const descriptionLines = doc.splitTextToSize(offer.description, usableWidth);
  currentY = margins.top + 50 + (titleLines.length * 6) + 5;
  doc.text(descriptionLines, margins.left, currentY);
  
  // Valid until date
  const validUntilDate = typeof offer.validUntil === 'string' 
    ? new Date(offer.validUntil) 
    : offer.validUntil;
  currentY += (descriptionLines.length * 5) + 10;
  doc.text(`Gültig bis: ${validUntilDate.toLocaleDateString('de-DE')}`, margins.left, currentY);
  
  // Items header
  currentY += 20;
  doc.setFontSize(14);
  doc.setFont(fontFamily, 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Leistungen:', margins.left, currentY);
  
  // Items table
  currentY += 15;
  doc.setFontSize(10);
  doc.setFont(fontFamily, 'bold');
  
  // Table headers
  doc.setTextColor(60, 60, 60);
  doc.text('Leistung', margins.left, currentY);
  doc.text('Beschreibung', margins.left + 50, currentY);
  doc.text('Menge', margins.left + 120, currentY);
  doc.text('Preis', margins.left + 140, currentY);
  
  currentY += 5;
  
  // Draw line under headers
  doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
  
  currentY += 10;
  
  // Items
  doc.setFont(fontFamily, 'normal');
  doc.setTextColor(40, 40, 40);
  offer.items.forEach((item) => {
    // Check if we need a new page
    if (currentY > pageHeight - margins.bottom - 20) {
      doc.addPage();
      currentY = margins.top + 20;
    }
    
    const itemTotal = item.price * item.quantity;
    
    // Wrap text for long descriptions with proper width limits
    const splitDescription = doc.splitTextToSize(item.description, 65);
    const splitName = doc.splitTextToSize(item.name, 45);
    
    doc.text(splitName, margins.left, currentY);
    doc.text(splitDescription, margins.left + 50, currentY);
    doc.text(item.quantity.toString(), margins.left + 120, currentY);
    doc.text(`${itemTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`, margins.left + 140, currentY);
    
    // Calculate height needed for this row
    const maxLines = Math.max(splitName.length, splitDescription.length);
    currentY += maxLines * 5 + 5;
  });
  
  // Total section
  currentY += 10;
  doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
  currentY += 10;
  
  doc.setFontSize(14);
  doc.setFont(fontFamily, 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text('Gesamtpreis:', margins.left + 100, currentY);
  doc.setFont(fontFamily, 'bold');
  doc.text(
    offer.totalPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
    margins.left + 140,
    currentY
  );
  
  // Footer
  doc.setFontSize(8);
  doc.setFont(fontFamily, 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Erstellt am: ' + new Date().toLocaleDateString('de-DE'), margins.left, pageHeight - margins.bottom);
  doc.text(`Angebots-ID: ${offer.id}`, margins.left + 100, pageHeight - margins.bottom);
  
  // Save the PDF
  const fileName = `Angebot_${offer.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
