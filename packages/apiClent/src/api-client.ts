import { Injectable } from '@nestjs/common';
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable()
export class ApiClient {
  protected client: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.client = axios.create(config);
  }

  get(url: string, config?: AxiosRequestConfig) {
    return this.client.get(url, config);
  }

  post(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post(url, data, config);
  }

  put(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.put(url, data, config);
  }

  patch(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.patch(url, data, config);
  }

  delete(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config);
  }
}

export default ApiClient;
