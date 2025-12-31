// PDF parsing utilities - compatible with pdfjs-dist v3.x
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js v3
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface ParsedPDF {
  text: string;
  pageCount: number;
  title?: string;
}

export const parsePDF = async (file: File): Promise<ParsedPDF> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return {
      text: fullText.trim(),
      pageCount: pdf.numPages,
      title: file.name.replace('.pdf', ''),
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
};

// Extract text from URL (simple fetch for text-based content)
export const fetchUrlContent = async (url: string): Promise<string> => {
  try {
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Failed to fetch URL');
    
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    doc.querySelectorAll('script, style, nav, footer, header').forEach(el => el.remove());
    
    const text = doc.body?.textContent || '';
    
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  } catch (error) {
    console.error('URL fetch error:', error);
    throw new Error('Failed to fetch content from URL');
  }
};

// Extract YouTube video info from URL
export interface YouTubeInfo {
  videoId: string;
  title: string;
  description: string;
  channelTitle?: string;
}

export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

export const fetchYouTubeInfo = async (url: string): Promise<YouTubeInfo> => {
  const videoId = extractYouTubeId(url);
  if (!videoId) throw new Error('Invalid YouTube URL');
  
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) throw new Error('Failed to fetch YouTube info');
    
    const data = await response.json();
    
    return {
      videoId,
      title: data.title || 'YouTube Video',
      description: `Video by ${data.author_name || 'Unknown'}. Watch on YouTube for full content.`,
      channelTitle: data.author_name,
    };
  } catch (error) {
    return {
      videoId,
      title: 'YouTube Video',
      description: 'YouTube video content. Watch on YouTube for full details.',
    };
  }
};

export const youtubeToStudyText = (info: YouTubeInfo): string => {
  return `
Video: ${info.title}
${info.channelTitle ? `Channel: ${info.channelTitle}` : ''}

${info.description}

Key points to study from this video:
- Watch the full video on YouTube
- Take notes on main concepts
- Pause and review difficult sections
- Practice any examples shown
  `.trim();
};
