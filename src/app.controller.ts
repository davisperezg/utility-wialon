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
    const { to } = body;
    const recipients = Array.isArray(to) ? to : [to]; // Convertir en array si es solo un número
    const phones = recipients.filter(Boolean);
    const results = [];

    for (const phone of phones) {
      try {
        const EASY = await this.appService.easyNotification({
          ...body,
          to: phone,
        });
        results.push({
          to: phone,
          status: 'Sent',
          response: EASY,
        });
      } catch (error) {
        results.push({
          to: phone,
          status: 'Failed',
          error: error.message,
        });
      }
    }

    return results;
  }

  @Post('call-notification')
  async sendCallMessage(@Body() body: CreateCallDto) {
    const { to } = body;
    const recipients = Array.isArray(to) ? to : [to]; // Convertir en array si es solo un número
    const phones = recipients.filter(Boolean);
    const results = [];

    for (const phone of phones) {
      try {
        const CALL = await this.appService.makeVoiceCall({
          ...body,
          to: phone,
        });
        results.push({
          to: phone,
          status: 'Sent',
          response: CALL,
        });
      } catch (error) {
        results.push({
          to: phone,
          status: 'Failed',
          error: error.message,
        });
      }
    }

    return results;
  }

  @Post('wsp-notification')
  async sendWhatsAppMessage(@Body() body: CreateWhatsappDto) {
    const { to } = body;
    const recipients = Array.isArray(to) ? to : [to]; // Convertir en array si es solo un número
    const phones = recipients.filter(Boolean);
    const results = [];

    for (const phone of phones) {
      try {
        const WSP = await this.appService.sendWhatsAppMessage({
          ...body,
          to: phone,
        });
        results.push({
          to: phone,
          status: 'Sent',
          response: WSP,
        });
      } catch (error) {
        results.push({
          to: phone,
          status: 'Failed',
          error: error.message,
        });
      }
    }

    return results;
  }
}
