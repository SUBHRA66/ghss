import { Module } from '@nestjs/common';
import { ApiClient } from './api-client.js';
import { AdminApi } from './admin.api.js';
import { StudentsApi } from './student.api.js';
import { ADMIN_API_CLIENT, STUDENT_API_CLIENT } from './token.js';

@Module({
  providers: [
    {
      provide: ADMIN_API_CLIENT,
      useFactory: () => {
        return new ApiClient({
          baseURL: 'http://localhost:9001',
        });
      },
    },
    {
      provide: STUDENT_API_CLIENT,
      useFactory: () => {
        return new ApiClient({
          baseURL: 'http://localhost:9002',
        });
      },
    },
    AdminApi,
    StudentsApi,
  ],
  exports: [AdminApi, StudentsApi, ADMIN_API_CLIENT, STUDENT_API_CLIENT],
})
export class ApiClientModule { }
