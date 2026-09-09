import { Injectable } from '@nestjs/common';


@Injectable()
export class StudentsApi {
  constructor (
    @Inject(STUDENTS_API_CLIENT)
    private readonly apiClient: ApiClient,
  ) {}
  
  getStudent (sid: string){
    return 'panchana';
  }
  
}
