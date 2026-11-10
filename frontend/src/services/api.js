import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60s timeout for large multimodal processing
});

const getApiErrorMessage = (error, fallback) => {
  const payload = error?.response?.data;
  if (payload?.error?.message) return payload.error.message;
  if (payload?.detail) return payload.detail;
  if (payload?.message) return payload.message;
  return fallback;
};

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const uploadMaterial = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/study/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

export const getMaterials = async () => {
  const response = await api.get('/study/materials');
  return response.data;
};

export const deleteMaterial = async (materialId) => {
  const response = await api.delete(`/study/materials/${materialId}`);
  return response.data;
};

export const chatWithMaterial = async (materialId, question, history = []) => {
  const response = await api.post('/study/chat', {
    material_id: materialId,
    question,
    history,
  });
  return response.data;
};

export const generateSummary = async (materialId, focusArea = null) => {
  const response = await api.post('/study/summary', {
    material_id: materialId,
    focus_area: focusArea,
  });
  return response.data;
};

export const explainTopic = async (materialId, topic = null) => {
  const response = await api.post('/study/explain', {
    material_id: materialId,
    topic,
  });
  return response.data;
};

export const generateQuiz = async (materialId, difficulty = 'medium') => {
  const response = await api.post('/study/quiz', {
    material_id: materialId,
    difficulty,
  });
  return response.data;
};

export { getApiErrorMessage };
export default api;

