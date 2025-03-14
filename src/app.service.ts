import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { CreateWhatsappDto } from './whatsapp/dto/create-whatsapp.dto';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { CallListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/call';
import { CreateCallDto } from './call/dto/create-call.dto';
import { CreateWspCallDto } from './wsp_call/dto/create-wsp_call.dto';

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
        'Credenciales de Twilio o Número de teléfono no configurados correctamente',
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

  async easyNotification(body: CreateWspCallDto): Promise<any> {
    const { to, vehicle, notify } = body;

    // Voice alert
    switch (notify) {
      case 'DISCONNECT':
        await this.makeVoiceCall({
          to,
          message: `¡ALERTA! dispositivo desconectado! placa ${vehicle}. Atentamente KEMAY GPS SATELITAL cuidando tu seguridad`,
        });
        return await this.sendWhatsAppMessage({
          ...body,
          templateId: 'HX71df37a69d102827ed673fe7167fe1a6',
        });

      case 'PANIC':
        await this.makeVoiceCall({
          to,
          message: `¡EMERGENCIA! Boton de panico activado placa ${vehicle}, comunicarse con el conductor urgente. Atentamente KEMAY GPS SATELITAL cuidando tu seguridad.`,
        });
        return await this.sendWhatsAppMessage({
          ...body,
          templateId: 'HXc1a31cd1b7667ebb986ecb0988d2e72d',
        });

      case 'OUTGEO':
        await this.makeVoiceCall({
          to,
          message: `¡ALERTA! Salida de geocerca detectada placa ${vehicle}. Atentamente KEMAY GPS SATELITAL cuidando tu seguridad`,
        });
        return await this.sendWhatsAppMessage({
          ...body,
          templateId: 'HX50c15c24bb2079ebb003f0aa474c72a8',
        });

      case 'SPEEDING':
        await this.makeVoiceCall({
          to,
          message: `¡ALERTA! Por su seguridad y la de los demás, reduzca la velocidad y conduzca con precaución placa ${vehicle}. Atentamente KEMAY GPS SATELITAL cuidando tu seguridad`,
        });
        return await this.sendWhatsAppMessage({
          ...body,
          templateId: 'HXb56ecfb97f0882ca6378dc39b7535575',
        });
      default:
        return {
          success: false,
          error: 'OTHER_NOTIFY',
          errorCode: 404,
        };
    }
  }

  async sendWhatsAppMessage(body: CreateWhatsappDto): Promise<any> {
    const { to, vehicle, currentTime, location, templateId } = body;
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
        contentSid: templateId,
        from,
        to: formattedTo,
        contentVariables: `{"1":"${vehicle.trim()}","2":"${currentTime.trim()}","3":"${locationDefault}"}`,
      };

      // Registrar datos antes de enviar
      this.logger.debug('Enviando whatsapp con los siguientes datos.', params);

      // Enviar el mensaje
      const result = await this.twilioClient.messages.create(params);

      this.logger.log(`Whatsapp enviado exitosamente, SID: ${result.sid}`);

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

  async makeVoiceCall(body: CreateCallDto): Promise<any> {
    const { to, message } = body;
    this.logger.log(`Intentando realizar llamada a: ${to}`);

    try {
      // Validar número de teléfono
      if (!this.isValidPhoneNumber(to)) {
        this.logger.warn(`Número de teléfono inválido: ${to}`);
        return {
          success: false,
          error: 'Número de teléfono inválido',
        };
      }

      const from = `${this.configService.get<string>('TWILIO_PHONE_NUMBER')}`;

      // Crear TwiML con manejo de posibles errores de caracteres especiales
      const sanitizedMessage = this.sanitizeMessage(message);
      const twiml = `<Response><Say language="es-ES">${sanitizedMessage}</Say><Pause length="1"/><Say language="es-ES">${sanitizedMessage}</Say></Response>`;

      const params: CallListInstanceCreateOptions = {
        to: to,
        from: from,
        twiml: twiml,
        timeout: 15,
      };

      // Registrar datos antes de la llamada
      this.logger.debug('Realizando llamada con los siguientes datos', params);

      // Hacer la llamada con callback de status
      const call = await this.twilioClient.calls.create(params);

      this.logger.log(`Llamada iniciada exitosamente, SID: ${call.sid}`);

      return {
        success: true,
        callId: call.sid,
        status: call.status,
        details: {
          to,
          from: from.replace(/^\+/, ''), // Ocultar el número completo por seguridad
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Error al realizar llamada de voz: ${error.message}`, {
        stack: error.stack,
        errorCode: error.code,
        to,
      });

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

  private sanitizeMessage(message: string): string {
    // Reemplazar caracteres problemáticos para XML
    return message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
