import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { CreateWhatsappDto } from './whatsapp/dto/create-whatsapp.dto';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';

@Injectable()
export class AppService {
  private readonly twilioClient: Twilio;
  private readonly serviceId: string;
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const phoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    this.serviceId = this.configService.get<string>('TWILIO_SERVICE_SID');

    if (!accountSid || !authToken || !phoneNumber) {
      this.logger.error(
        'Credenciales de Twilio o Número de teléfono de WhatsApp no configuradas correctamente',
      );
      throw new Error(
        'Configuración de Twilio o Número de teléfono de WhatsApp incompleta',
      );
    }

    this.twilioClient = new Twilio(accountSid, authToken);
    this.logger.log('Servicio de WhatsApp inicializado');
  }

  getHello(): string {
    return 'Hello World!';
  }

  async sendWhatsAppMessage(body: CreateWhatsappDto): Promise<any> {
    const { to, vehicle, currentTime, location } = body;
    this.logger.log(`Intentando enviar mensaje WhatsApp a: ${to}`);

    try {
      // Validar número de teléfono
      if (!this.isValidPhoneNumber(to)) {
        this.logger.warn(`Número de teléfono inválido: ${to}`);
        return {
          success: false,
          error: 'Número de teléfono inválido',
        };
      }

      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:+${to}`;
      const from = `whatsapp:${this.configService.get<string>(
        'TWILIO_PHONE_NUMBER',
      )}`;

      const locationDefault =
        location?.trim() || 'https://hosting.wialon.us/?lang=es';

      const params: MessageListInstanceCreateOptions = {
        messagingServiceSid: this.serviceId,
        contentSid: 'HX71df37a69d102827ed673fe7167fe1a6',
        from,
        to: formattedTo,
        contentVariables: `{"1":"${vehicle.trim()}","2":"${currentTime.trim()}","3":"${locationDefault}"}`,
      };

      // Registrar datos antes de enviar
      this.logger.debug('Enviando mensaje con los siguientes datos.', params);

      // Enviar el mensaje
      const result = await this.twilioClient.messages.create(params);

      this.logger.log(`Mensaje enviado exitosamente, SID: ${result.sid}`);

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        details: {
          to: formattedTo,
          from: from.replace(/^\+/, ''), // Ocultar el número completo por seguridad
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error al enviar mensaje de WhatsApp: ${error.message}`,
        {
          stack: error.stack,
          errorCode: error.code,
          to,
        },
      );

      return {
        success: false,
        error: error.message,
        errorCode: error.code || 'UNKNOWN_ERROR',
      };
    }
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Eliminar el prefijo whatsapp: si existe
    const normalizedNumber = phoneNumber.replace('whatsapp:', '');

    // Validación básica: al menos 10 dígitos después de quitar caracteres no numéricos
    const digitsOnly = normalizedNumber.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  }
}
