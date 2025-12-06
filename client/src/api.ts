import axios from 'axios';
import type { IRFP } from './types'

const API_URL = 'http://localhost:5000/api/rfps';

export const createRFP = async (userPrompt: string): Promise<IRFP> => {
    const response = await axios.post(`${API_URL}/generate`, { userPrompt });
    return response.data;
};

export const getRFPs = async (): Promise<IRFP[]> => {
    const response = await axios.get(API_URL);
    return response.data;
};