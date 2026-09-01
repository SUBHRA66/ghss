import { Injectable, LoggerService } from '@nestjs/common'

@Injectable ()
export class Logger implements LoggerService {

  log (message: any, context?: string) {
      console.log(`[LOG] ${context ? `[${context}] ` : ''}${message}`);
  }
  
  error (message: any, stack?: string, context?: string) {
      console.error(
        `[ERROR] ${context ? `[${context}] ` : ''}${message}`,
        stack ?? '',
      );
  }
  
  warn (message: any, context?: string) {
      console.warn(`[WARN] ${context ? `[${context}] ` : ''}${message}`);
  }
  
  debug? (message: any, context?: string) {
      console.debug(`[DEBUG] ${context ? `[${context}] ` : ''}${message}`);
  }
  
  verbose? (message: any, context?: string) {
      console.log(`[VERBOSE] ${context ? `[${context}] ` : ''}${message}`);
  }
}
