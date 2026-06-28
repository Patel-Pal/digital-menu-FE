import api from './api';

export const uploadService = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Don't set Content-Type — axios will auto-detect multipart/form-data
    // with the correct boundary from FormData
    const response = await api.post('/upload/image', formData);
    
    return response.data;
  }
};
