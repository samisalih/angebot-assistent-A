
// Font loader utility for loading Titillium Web into jsPDF
export const loadTitilliumWebFont = async (): Promise<string> => {
  // This is a base64 encoded version of Titillium Web Regular
  // In a production environment, you would fetch this from Google Fonts API
  // For now, we'll return the font URL to be loaded dynamically
  
  const fontUrl = 'https://fonts.gstatic.com/s/titilliumweb/v17/NaPecZTIAOhVxoMyOr9n_E7fdM3mDbRS.woff2';
  
  try {
    const response = await fetch(fontUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64;
  } catch (error) {
    console.warn('Could not load Titillium Web font, falling back to default');
    return '';
  }
};
