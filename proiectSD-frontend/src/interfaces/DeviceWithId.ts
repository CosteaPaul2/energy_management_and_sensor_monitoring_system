export interface DeviceDetails {
    name: string;
    userId: string;
    description: string;
    hourlyConsumption: number;
}
export interface DeviceWithId extends DeviceDetails {
  id: string
}
