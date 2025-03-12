"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = require("twilio");
let AppService = AppService_1 = class AppService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AppService_1.name);
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        if (!accountSid || !authToken) {
            this.logger.error('Credenciales de Twilio no configuradas correctamente');
            throw new Error('Configuración de Twilio incompleta');
        }
        this.twilioClient = new twilio_1.Twilio(accountSid, authToken);
        this.logger.log('Servicio de WhatsApp inicializado');
    }
    getHello() {
        return 'Hello World!';
    }
    async sendWhatsAppMessage(to, message) {
        this.logger.log(`Intentando enviar mensaje WhatsApp a: ${to}`);
        try {
            if (!this.isValidPhoneNumber(to)) {
                this.logger.warn(`Número de teléfono inválido: ${to}`);
                return {
                    success: false,
                    error: 'Número de teléfono inválido',
                };
            }
            const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
            const from = `whatsapp:${this.configService.get('TWILIO_PHONE_NUMBER')}`;
            if (!from) {
                this.logger.error('Número de teléfono de WhatsApp de Twilio no configurado');
                return {
                    success: false,
                    error: 'Configuración incompleta',
                };
            }
            this.logger.debug('Enviando mensaje con los siguientes datos.', {
                to: formattedTo,
                from,
                messageLength: message.length,
            });
            console.log({ to: formattedTo, from, message: message });
            const result = await this.twilioClient.messages.create({
                messagingServiceSid: this.configService.get('TWILIO_SERVICE_SID'),
                body: message,
                contentSid: 'HX9cccd0f9216a9e0056a775e346133f0d',
                from,
                to: 'whatsapp:+51931858465',
            });
            this.logger.log(`Mensaje enviado exitosamente, SID: ${result.sid}`);
            return {
                success: true,
                messageId: result.sid,
                status: result.status,
                details: {
                    to: formattedTo,
                    from: from.replace(/^\+/, ''),
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Error al enviar mensaje de WhatsApp: ${error.message}`, {
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
    isValidPhoneNumber(phoneNumber) {
        const normalizedNumber = phoneNumber.replace('whatsapp:', '');
        const digitsOnly = normalizedNumber.replace(/\D/g, '');
        return digitsOnly.length >= 10;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = AppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppService);
//# sourceMappingURL=app.service.js.map