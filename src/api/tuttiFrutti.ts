import axios from 'axios';

export interface CategoryAnswer {
  category: string;
  answer: string | null;
}

export interface ValidateRoundPayload {
  roundLetter: string;
  answers: CategoryAnswer[];
}

export async function sendRoundResults(payload: ValidateRoundPayload) {
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/tutti-frutti/validate-round`;
  return axios.post(url, payload, { timeout: 15000 });
}

export default sendRoundResults;