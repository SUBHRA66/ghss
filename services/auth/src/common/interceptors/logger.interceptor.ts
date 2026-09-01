import { CallHandler, ExecutionContext, Logger, NestInterceptor, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs';

@Injectable()
export class LoggerInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name);
  
  intercept (context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const reqObject = context.switchToHttp().getRequest();
    this.logger.log(`${reqObject.method} ${reqObject.url}`);
    return next.handle();
  }
}
