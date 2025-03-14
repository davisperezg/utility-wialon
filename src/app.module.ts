import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { CallModule } from './call/call.module';
import { WspCallModule } from './wsp_call/wsp_call.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.production.env`,
      isGlobal: true,
      cache: true,
    }),
    WhatsappModule,
    CallModule,
    WspCallModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
