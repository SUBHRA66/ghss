import { Injectable, Inject } from '@nestjs/common';
import { ApiClient } from './api-client.js';
import { STUDENT_API_CLIENT } from './token.js';

@Injectable()
export class StudentsApi {
  constructor(
    @Inject(STUDENT_API_CLIENT)
    private readonly apiClient: ApiClient,
  ) {}

  getStudent(sid: string) {
    return this.apiClient.get(`/students/${sid}`);
  }
}

export default StudentsApi;
