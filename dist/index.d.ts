import { CourierClass, CourierData } from "courier";
export declare class Elta implements CourierClass<CourierData> {
    get(tracking: string): Promise<CourierData[]>;
}
export declare class ACS implements CourierClass<CourierData> {
    get(tracking: string): Promise<any[]>;
}
export declare class DHL implements CourierClass<CourierData> {
    get(tracking: string): Promise<CourierData[]>;
}
export declare class SpeedPak implements CourierClass<CourierData> {
    get(tracking: string): Promise<CourierData[]>;
}
export declare class Geniki implements CourierClass<CourierData> {
    get(tracking: string): Promise<CourierData[]>;
}
export declare class Speedex implements CourierClass<CourierData> {
    get(tracking: string): Promise<CourierData[]>;
}
export declare class EasyMail implements CourierClass<CourierData> {
    get(tracking: string): Promise<any>;
}
export declare class SendX implements CourierClass<CourierData> {
    get(tracking: string, lang?: string): Promise<any>;
}
