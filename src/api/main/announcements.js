import axios from 'axios';
import api from '@/api/axios';

// Public notices must remain readable even when a saved login token has expired.
const publicApi = axios.create({ baseURL: api.defaults.baseURL });
export const fetchAnnouncementPopups = async (signal) => {
  const response = await publicApi.get('/api/v1/announcements/popup', {
    signal,
  });
  return response.data.data;
};
