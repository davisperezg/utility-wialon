import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateWhatsappDto } from './whatsapp/dto/create-whatsapp.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('easy-notification')
  async sendWhatsAppMessage(@Body() body: CreateWhatsappDto) {
    const result = await this.appService.sendWhatsAppMessage(body);
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result;
  }
}
