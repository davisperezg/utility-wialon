import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    sendWhatsAppMessage(body: {
        to: string;
        message?: string;
    }): Promise<any>;
}
