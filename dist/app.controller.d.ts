import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    demo(body: any): Promise<any>;
    sendWhatsAppMessage(body: any): Promise<any>;
}
