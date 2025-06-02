
// Font loader utility for loading Titillium Web TTF into jsPDF
export const loadTitilliumWebFont = async (): Promise<string> => {
  // Using a CDN that provides TTF files instead of WOFF2
  const fontUrl = 'https://github.com/google/fonts/raw/main/ofl/titilliumweb/TitilliumWeb-Regular.ttf';
  
  try {
    console.log('Fetching Titillium Web TTF font from:', fontUrl);
    const response = await fetch(fontUrl);
    
    if (!response.ok) {
      console.warn(`Font fetch failed with status: ${response.status}, falling back to helvetica`);
      return '';
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('Font arrayBuffer size:', arrayBuffer.byteLength);
    
    if (arrayBuffer.byteLength === 0) {
      console.warn('Empty font file received, falling back to helvetica');
      return '';
    }
    
    // Convert ArrayBuffer to base64
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    
    // Process in chunks to avoid call stack overflow
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64 = btoa(binaryString);
    console.log('Titillium Web TTF converted to base64, length:', base64.length);
    
    return base64;
  } catch (error) {
    console.warn('Error loading Titillium Web font, falling back to helvetica:', error);
    return '';
  }
};
