import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const getCardex = () => api.get("/cardex").then((r) => r.data);
export const uploadCardex = (formData) =>
  api.post("/cardex/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const getLatestAnalysis = () => api.get("/analysis/latest").then((r) => r.data);
export const uploadAnalysis = (formData) =>
  api.post("/analysis/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
export const listAnalyses = () => api.get("/analysis").then((r) => r.data);
export const getAnalysis = (id) => api.get(`/analysis/${id}`).then((r) => r.data);
export const deleteAnalysis = (id) => api.delete(`/analysis/${id}`).then((r) => r.data);
