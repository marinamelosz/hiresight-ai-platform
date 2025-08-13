import axios from 'axios';

// Configuração base da API
const API_BASE_URL = 'http://localhost:5000/api';

// Instância do axios com configurações padrão
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funções de autenticação
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

// Funções para usuários
export const usersAPI = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
};

// Funções para candidatos
export const candidatesAPI = {
  getCandidates: async (params = {}) => {
    const response = await api.get('/candidates', { params });
    return response.data;
  },
  
  createCandidate: async (candidateData) => {
    const response = await api.post('/candidates', candidateData);
    return response.data;
  },
  
  getCandidate: async (candidateId) => {
    const response = await api.get(`/candidates/${candidateId}`);
    return response.data;
  },
  
  updateCandidate: async (candidateId, candidateData) => {
    const response = await api.put(`/candidates/${candidateId}`, candidateData);
    return response.data;
  },
  
  deleteCandidate: async (candidateId) => {
    const response = await api.delete(`/candidates/${candidateId}`);
    return response.data;
  },
  
  addCandidateTag: async (candidateId, tagId) => {
    const response = await api.post(`/candidates/${candidateId}/tags`, { tag_id: tagId });
    return response.data;
  },
  
  removeCandidateTag: async (candidateId, tagId) => {
    const response = await api.delete(`/candidates/${candidateId}/tags/${tagId}`);
    return response.data;
  }
};

// Funções para vagas
export const jobPostingsAPI = {
  getJobPostings: async (params = {}) => {
    const response = await api.get('/job-postings', { params });
    return response.data;
  },
  
  createJobPosting: async (jobData) => {
    const response = await api.post('/job-postings', jobData);
    return response.data;
  },
  
  getJobPosting: async (jobId) => {
    const response = await api.get(`/job-postings/${jobId}`);
    return response.data;
  },
  
  updateJobPosting: async (jobId, jobData) => {
    const response = await api.put(`/job-postings/${jobId}`, jobData);
    return response.data;
  },
  
  deleteJobPosting: async (jobId) => {
    const response = await api.delete(`/job-postings/${jobId}`);
    return response.data;
  }
};

// Funções para notas
export const notesAPI = {
  getNotesForCandidate: async (candidateId) => {
    const response = await api.get(`/candidates/${candidateId}/notes`);
    return response.data;
  },
  
  createNoteForCandidate: async (candidateId, noteData) => {
    const response = await api.post(`/candidates/${candidateId}/notes`, noteData);
    return response.data;
  },
  
  updateNote: async (noteId, noteData) => {
    const response = await api.put(`/notes/${noteId}`, noteData);
    return response.data;
  },
  
  deleteNote: async (noteId) => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  }
};

// Funções para tags
export const tagsAPI = {
  getTags: async () => {
    const response = await api.get('/tags');
    return response.data;
  },
  
  createTag: async (tagData) => {
    const response = await api.post('/tags', tagData);
    return response.data;
  },
  
  updateTag: async (tagId, tagData) => {
    const response = await api.put(`/tags/${tagId}`, tagData);
    return response.data;
  },
  
  deleteTag: async (tagId) => {
    const response = await api.delete(`/tags/${tagId}`);
    return response.data;
  }
};

export default api;

