import api from '../axios';

export const createSample = ({
  id,
  isDark,
  start,
  end,
  questionnaire,
  data,
}) => {
  const sessionId = localStorage.getItem('session_id');
  return api.post(`/user_sessions/${sessionId}/websites/${id}/samples/new`, {
    dark: isDark,
    start,
    end,
    questionnaire,
    sample_data: data,
  });
};

export const createUserSession = (userInfo) =>
  api.post('/user_sessions/new', userInfo);

export const getWebsitesStatus = (session_id) =>
  api
    .get(`/user_sessions/${session_id}/websites/status`)
    .then((response) => response.data);
