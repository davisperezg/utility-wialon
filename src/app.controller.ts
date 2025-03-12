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
import { CreateWhatsappDto } from './whatsapp/dto/create-whatsapp.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseInterceptors(JsonInterceptor)
  @Post('post')
  async demo(@Body() body) {
    console.log(body);
    return body;
  }

  @UseInterceptors(JsonInterceptor)
  @Post('whatsapp')
  async sendWhatsAppMessage(@Body() body: CreateWhatsappDto) {
    const result = await this.appService.sendWhatsAppMessage(body);

    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result;
  }
}
