import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable()
class ApiClient {
  protected client:AxiosInstance;

  constructor (config: AxiosRequestConfig) {
    this.client = axios.create (config)
  }

  get (url:string, config?: AxiosRequestConfig) { 
    return this.client.get (url)
  }

  post (url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post (url, data, config);
  }

  put (url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.put (url, data, config);
  }

  patch (url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.patch (url, data, config);
  }

  delete (url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.delete (url, data, config);
  }

}

export default ApiClient;
