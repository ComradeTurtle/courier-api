declare module "courier" {
    interface CourierClass<T> {
        get(tracking: string, lang?: string): Promise<T | T[]>;
    }

    interface CourierData {
        status?: string;
        place?: string;
        date?: string;
        time?: string;
    }

    interface TrackingData {
        [key: number]: CourierData;
    }

    namespace Responses {
        interface Elta {
            status: number;
            result: Utils.Elta.Result;
        }

        interface ACS {
            count: number;
            items: Utils.ACS.Items[];
        }

        interface DHL {
            shipments: Utils.DHL.Shipments[];
        }

        interface SpeedPack {
            hasBusinessException: boolean;
            result: Utils.SpeedPack.Result;
            success: boolean;
        }
    }

    namespace Utils {
        namespace Elta {
            interface Result {
                [key: string]: {
                    status: string;
                    result: string | CourierData[];
                }
            }
        }

        namespace ACS {
            interface Status {
                controlPoint: string;
                description: string;
                controlPointDate: string;
            }

            interface Items {
                statusHistory: Utils.ACS.Status[];
                isDelivered: boolean;
                isReturned: boolean;
                pickupDate: string;
                deliveryDate: string;
            }
        }

        namespace DHL {
            interface Shipments {
                id: string;
                service: string;
                destination: Utils.DHL.Address;
                status: Utils.DHL.Status;
                events: Utils.DHL.Events[];
            }

            interface Status {
                timestamp: string;
                statusCode: string;
                status: string;
            }

            type Events = Status & {
                description: string;
                location: Utils.DHL.Address;
            }

            interface Address {
                address: {
                    addressLocality: string;
                }
            }
        }

        namespace SpeedPack {
            interface Result {
                notExistsTrackingNumbers: any[];
                waybills: Utils.SpeedPack.Waybills[];
            }

            interface Waybills {
                traces: Utils.SpeedPack.Traces[];
            }

            interface Traces {
                eventDesc: string;
                oprCity?: string;
                oprTimestamp: string;
                oprCountry?: string;
            }
        }

        namespace SendX {
            interface trackingDetails {
                description: string;
                updatedAt: string;
                description_gr: string;
            }
        }
    }
}