import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('post')
  async demo(@Body() body) {
    JSON.stringify(body, null, 2);
    console.log(body);
    const param3 = body.param3;
    console.log(param3);
    return param3;
  }

  @Post('whatsapp')
  async sendWhatsAppMessage(@Body() body: { to: string; message?: string }) {
    const { to, message = 'Estimado cliente esto es un mensaje de prueba' } =
      body;

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
