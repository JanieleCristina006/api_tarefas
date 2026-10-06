import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { ExternalExceptionFilter } from "@nestjs/core/exceptions/external-exception-filter";
import path from "path";
import { timestamp } from "rxjs";


@Catch(HttpException)
export class ApiExceptionFilter implements ExternalExceptionFilter{
      catch(exception: HttpException, host: ArgumentsHost) {
          const ctx = host.switchToHttp();
          const response = ctx.getResponse();
          const request = ctx.getRequest();
          const status = exception.getStatus();
          const errorResponse = exception.getResponse();

          response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            message: errorResponse !== "" ? errorResponse : "Erro ao realizar operação",
            path: request.url
          })
      }
}
