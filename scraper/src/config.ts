import dotenv from 'dotenv';
import { ScraperConfig } from './types';

dotenv.config();

export const config: ScraperConfig = {
    maxResults: parseInt(process.env.MAX_RESULTS || '50'),
    delayBetweenRequests: parseInt(process.env.DELAY_BETWEEN_REQUESTS || '2000'),
    region: process.env.REGION || 'Región Metropolitana',
    comuna: process.env.COMUNA || 'Maipú',
    searchQuery: process.env.SEARCH_QUERY || 'autolavado',
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));