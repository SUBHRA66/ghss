import { Injectable, Inject } from '@nestjs/common';
import { ApiClient } from './api-client'
import { ADMIN_API_CLIENT } from './token';

@Injectable ()
class AdminApi {
  constructor (
    @Inject(ADMIN_API_CLIENT)
    private readonly apiClient: ApiClient,
  ) {}

  getAdmin (adminId: string) {
    return this.apiClient.get (`/admin/${adminId}`);
  }

}

export default AdminApi;

