import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

export interface FetchResult {
  content: string;
  contentHash: string;
  contentLength: number;
}

export class FetcherService {
  private static readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  private static readonly TIMEOUT = 30000;

  static async fetchUrl(url: string): Promise<FetchResult> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: this.TIMEOUT,
        maxRedirects: 5,
      });

      const html = response.data;
      const content = this.extractContent(html);
      const contentHash = this.generateHash(content);

      return {
        content,
        contentHash,
        contentLength: content.length,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error(`Request timeout after ${this.TIMEOUT}ms`);
        }
        if (error.response) {
          throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
        }
        throw new Error(`Network error: ${error.message}`);
      }
      throw error;
    }
  }

  private static extractContent(html: string): string {
    const $ = cheerio.load(html);

    $('script, style, noscript, iframe, nav, footer, header, aside').remove();
    $('[style*="display: none"], [style*="display:none"], .hidden, [hidden]').remove();

    const mainContent = $('main, article, [role="main"], .content, .main-content, #content, #main').first();
    
    let text: string;
    if (mainContent.length > 0) {
      text = mainContent.text();
    } else {
      text = $('body').text();
    }

    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return lines.join('\n');
  }

  private static generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}
