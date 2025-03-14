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
import { CreateCallDto } from './call/dto/create-call.dto';
import { CreateWspCallDto } from './wsp_call/dto/create-wsp_call.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('easy-notification')
  async sendNotificationMessage(@Body() body: CreateWspCallDto) {
    const result = await this.appService.easyNotification(body);
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result;
  }

  @Post('call-notification')
  async sendCallMessage(@Body() body: CreateCallDto) {
    const result = await this.appService.makeVoiceCall(body);
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result;
  }

  @Post('wsp-notification')
  async sendWhatsAppMessage(@Body() body: CreateWhatsappDto) {
    const result = await this.appService.sendWhatsAppMessage(body);
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result;
  }
}
