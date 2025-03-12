import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class JsonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    // Si el request no tiene Content-Type JSON, lo forzamos
    if (req.is('application/x-www-form-urlencoded')) {
      req.headers['content-type'] = 'application/json';
    }

    return next.handle().pipe(map((data) => data));
  }
}
