
// Font loader utility for loading Titillium Web into jsPDF
export const loadTitilliumWebFont = async (): Promise<string> => {
  // This loads Titillium Web Regular from Google Fonts
  const fontUrl = 'https://fonts.gstatic.com/s/titilliumweb/v17/NaPecZTIAOhVxoMyOr9n_E7fdM3mDbRS.woff2';
  
  try {
    console.log('Fetching font from:', fontUrl);
    const response = await fetch(fontUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('Font arrayBuffer size:', arrayBuffer.byteLength);
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Empty font file received');
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
    console.log('Font converted to base64, length:', base64.length);
    
    return base64;
  } catch (error) {
    console.error('Error loading Titillium Web font:', error);
    return '';
  }
};
