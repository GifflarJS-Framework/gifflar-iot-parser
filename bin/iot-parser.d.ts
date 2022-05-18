import { IGifflarContract } from "gifflar/bin/modules/managing/contract/types/IGifflarContract";
import { IGifflarContractManager } from "gifflar/bin/modules/managing/contractManager/types/IGifflarContractManager";
import { IIoTSensorData } from "./types/IIoTSensorData";
import { IIoTValue } from "./types/IIoTValue";
declare class IotParser {
    definitions: Array<any>;
    deviceMeasures: Array<IIoTValue>;
    /**
     * @description This method is responsible for parsing the Json, which contains
     * information about iot sensors, to the Json that the Gifflar framework
     * understand.
     * @param {Object[]} sensors - The list of sensores which contains all the sensors.
     * @param {Object} manager - The Gifflar Manager object to construct the contracts.
     * individual Jsons.
     * @returns {Object} ContractManager
     */
    parse(sensors: Array<IIoTSensorData>, manager: IGifflarContractManager): IGifflarContractManager;
    _capitalize(str: string): string;
    _setupVariables(contract: IGifflarContract, variables: Array<IIoTValue>): void;
    _setupEvents(contract: IGifflarContract): void;
    _setupConstructor(contract: IGifflarContract): void;
    _setupFunctions(contract: IGifflarContract, variables: Array<IIoTValue>): void;
    _setupGetValues(contract: IGifflarContract, variables: Array<IIoTValue>): void;
    _setupSetMeasures(contract: IGifflarContract): void;
    _setupController(contract: IGifflarContract, controlledName: string): void;
}
export default IotParser;
