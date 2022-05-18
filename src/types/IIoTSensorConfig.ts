import { IIoTValue } from "./IIoTValue";

export interface IIoTSensorConfig {
  name: string;
  values: Array<IIoTValue>;
}
