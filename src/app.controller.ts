import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JsonInterceptor } from './interceptors/json.interceptor';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseInterceptors(JsonInterceptor)
  @Post('post')
  async demo(@Req() req, @Body() body) {
    console.log(body);
    return body;
  }

  @UseInterceptors(JsonInterceptor)
  @Post('whatsapp')
  async sendWhatsAppMessage(@Body() body: { param1: string; param2?: string }) {
    const to = body.param1;
    const message = body.param2;
    console.log(body);
    if (!to) {
      throw new HttpException(
        'El número de teléfono de destino es requerido',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.appService.sendWhatsAppMessage(to, message);

    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result;
  }
}
