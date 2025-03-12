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
    console.log('Raw Body:', req); // 🔍 Verifica el contenido original
    console.log('Parsed Body:', body); // 🛠️ Verifica cómo se parsea el JSON
    return body;
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
