// Font loader utility for loading Titillium Web TTF fonts into jsPDF
export const loadTitilliumWebFonts = async (): Promise<{ regular: string; bold: string }> => {
  const regularFontUrl = '/TitilliumWeb-Regular.ttf';
  const boldFontUrl = '/TitilliumWeb-Bold.ttf';
  
  try {
    console.log('Fetching Titillium Web fonts...');
    
    // Load regular font
    const regularResponse = await fetch(regularFontUrl);
    const boldResponse = await fetch(boldFontUrl);
    
    if (!regularResponse.ok || !boldResponse.ok) {
      console.warn(`Font fetch failed, falling back to helvetica`);
      return { regular: '', bold: '' };
    }
    
    const regularArrayBuffer = await regularResponse.arrayBuffer();
    const boldArrayBuffer = await boldResponse.arrayBuffer();
    
    console.log('Regular font arrayBuffer size:', regularArrayBuffer.byteLength);
    console.log('Bold font arrayBuffer size:', boldArrayBuffer.byteLength);
    
    if (regularArrayBuffer.byteLength === 0 || boldArrayBuffer.byteLength === 0) {
      console.warn('Empty font file received, falling back to helvetica');
      return { regular: '', bold: '' };
    }
    
    // Convert ArrayBuffers to base64
    const regularBase64 = arrayBufferToBase64(regularArrayBuffer);
    const boldBase64 = arrayBufferToBase64(boldArrayBuffer);
    
    console.log('Titillium Web fonts converted to base64');
    console.log('Regular font base64 length:', regularBase64.length);
    console.log('Bold font base64 length:', boldBase64.length);
    
    return { regular: regularBase64, bold: boldBase64 };
  } catch (error) {
    console.warn('Error loading Titillium Web fonts, falling back to helvetica:', error);
    return { regular: '', bold: '' };
  }
};

const arrayBufferToBase64 = (arrayBuffer: ArrayBuffer): string => {
  const uint8Array = new Uint8Array(arrayBuffer);
  let binaryString = '';
  
  // Process in chunks to avoid call stack overflow
  const chunkSize = 8192;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binaryString);
};

// Keep the old function for backward compatibility but mark as deprecated
export const loadTitilliumWebFont = async (): Promise<string> => {
  console.warn('loadTitilliumWebFont is deprecated, use loadTitilliumWebFonts instead');
  const fonts = await loadTitilliumWebFonts();
  return fonts.regular;
};
