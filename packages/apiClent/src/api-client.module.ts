import { Module } from '@nestjs/common';
import { ApiClient } from './api-client';
import { AdminApi } from './admin.api';
import { ADMIN_API_CLIENT } from './token';

@Module({
  providers: [
    { 
      provide: ADMIN_API_CLIENT,
      useFactory: () => {
        return new ApiClient ({
          baseUrl: 'http://localhost:9999',
      }),
    },
    { 
      provide: STUDENT_API_CLIENT,
      useFactory: () => {
        return new ApiClient ({
          baseUrl: 'http://localhost:8888',
      }),
    },
    AdminAPi,
    StudentsApi,
  ],
  exports: [AdminApi]
})
ApiClientModule {};

