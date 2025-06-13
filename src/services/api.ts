// src/services/api.ts
import {axios} from "@/plugins/axios";
import  type { AxiosResponse} from "axios";

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

interface EncodePasswordResData {
  password: string;
  publicKey: string;
}

interface LoginResData {
  accessToken: string
  refreshToken: string
}

export interface EncodePasswordResponse {
  code: number;
  message: string;
  requestId: string;
  data: EncodePasswordResData
}

export interface AuthRequest {
  username: string;
  password: string;
  messagecode?: string;
  clientUid?: string
}

export interface AuthResponse {
  code: number;
  message: string;
  requestId: string;
  data: LoginResData;
}

export interface OcrRequest {
  structure_type: string;
  image: string
}

export interface OcrResponse {
  code: number
  message: string
  requestId: string
  data: any // You can define a more specific type based on your OCR response structure
}

class ApiService {
  static async encodePassword(): Promise<EncodePasswordResponse> {
    const response: AxiosResponse<EncodePasswordResponse> = await axios.get(`feel_apis/auth/getEncodedPassword?originalPassword=GRGgrg0629`);
    return response.data
  }

  static async login(authRequest: AuthRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await axios.post(`feel_apis/auth/login`, authRequest);
    return response.data
  }

  static async ocrDocumentProcess(ocrRequest: OcrRequest): Promise<OcrResponse> {
    const response: AxiosResponse<OcrResponse> = await axios.post(`feel_apis/ocr/structure`, ocrRequest);
    return response.data;
  }

  static async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await axios.delete(url)
    return response.data
  }

  static setAuthToken(token: string, refresh?: string): void {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token);
      if (refresh) {
        localStorage.setItem('refreshToken', refresh);
      }
    } else {
      axios.defaults.headers.common['Authorization'] = ''
      localStorage.removeItem('token');
    }
  }

  static clearAuthToken(): void {
    axios.defaults.headers.common['Authorization'] = ''
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  static getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

export default ApiService;
