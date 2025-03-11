import { ConfigService } from '@nestjs/config';
export declare class AppService {
    private readonly configService;
    private readonly twilioClient;
    private readonly logger;
    constructor(configService: ConfigService);
    getHello(): string;
    sendWhatsAppMessage(to: string, message: string): Promise<any>;
    private isValidPhoneNumber;
}
