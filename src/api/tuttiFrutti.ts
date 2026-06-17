import axios from 'axios';

export async function sendRoundResults(payload: any) {
  // Envío directo al backend local de NestJS
  const url = 'http://localhost:3000/tutti-frutti';
  return axios.post(url, payload, { timeout: 15000 });
}

export default sendRoundResults;
