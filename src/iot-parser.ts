import { IGifflarContract } from "gifflar/bin/modules/managing/contract/types/IGifflarContract";
import { IGifflarContractManager } from "gifflar/bin/modules/managing/contractManager/types/IGifflarContractManager";
import { IIoTSensorData } from "./types/IIoTSensorData";
import { IIoTValue } from "./types/IIoTValue";

class IotParser {
  definitions: Array<any> = [];
  deviceMeasures: Array<IIoTValue> = [];

  /**
   * @description This method is responsible for parsing the Json, which contains
   * information about iot sensors, to the Json that the Gifflar framework
   * understand.
   * @param {Object[]} sensors - The list of sensores which contains all the sensors.
   * @param {Object} manager - The Gifflar Manager object to construct the contracts.
   * individual Jsons.
   * @returns {Object} ContractManager
   */
  parse(
    sensors: Array<IIoTSensorData>,
    manager: IGifflarContractManager
  ): IGifflarContractManager {
    let gContract: IGifflarContract;
    let gContractController: IGifflarContract;

    sensors.map((sensor) => {
      this.deviceMeasures = [];

      // Creating the Sensor Contract
      gContract = manager.newContract(sensor.data.name);
      this._setupVariables(gContract, sensor.data.values);
      this._setupEvents(gContract);
      this._setupConstructor(gContract);
      this._setupFunctions(gContract, sensor.data.values);
      this._setupGetValues(gContract, sensor.data.values);
      this._setupSetMeasures(gContract);

      // Creating the Controller Sensor Contract
      gContractController = manager.newContract(
        sensor.data.name + "Controller"
      );
      this._setupController(gContractController, sensor.data.name);
    });

    return manager;
  }

  _capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  _setupVariables(contract: IGifflarContract, variables: Array<IIoTValue>) {
    // Setting default variables
    contract.createVariable("address", "manager", "public");

    // Setting json variables
    variables.map((v: any) => {
      // Saving the sensor measures to be organized lately
      if (v.max || v.min) {
        this.deviceMeasures.push(v);
        contract.createVariable(v.type, v.idv, "public");
      } else {
        contract.createVariable(v.type, v.idv, "public");
      }

      // Setting up the definitions to be made lately
      v.default
        ? this.definitions.push({
            variable: v.idv,
            value: v.default,
          })
        : null;

      //Setting max and min variables
      if (v.max) {
        const maxname = "max" + this._capitalize(v.idv);
        contract.createVariable(v.type, maxname, "public");

        this.definitions.push({
          variable: maxname,
          value: v.max,
        });
      }
      if (v.min) {
        const minname = "min" + this._capitalize(v.idv);
        contract.createVariable(v.type, minname, "public");

        this.definitions.push({
          variable: minname,
          value: v.min,
        });
      }
    });
  }

  _setupEvents(contract: IGifflarContract) {
    this.deviceMeasures.map((v) => {
      if (v.max) {
        contract.createEvent(`${v.idv}Overflow`, [
          { name: `${v.idv}`, type: v.type },
        ]);
      }
      if (v.min) {
        contract.createEvent(`${v.idv}Underflow`, [
          { name: `${v.idv}`, type: v.type },
        ]);
      }
    });
  }

  _setupConstructor(contract: IGifflarContract) {
    // Starting the constructor
    const constructor = contract
      .createConstructor("public")
      .setInput("address", "_owner")
      .setAssignment("manager", "_owner");

    // Setting up all definitions
    this.definitions.map((def) => {
      constructor.setAssignment(def.variable, def.value);
    });

    // Reseting the definitions (needed for when creating controller contract)
    this.definitions = [];
  }

  _setupFunctions(contract: IGifflarContract, variables: Array<IIoTValue>) {
    // Setting json variables
    variables.map((v: any) => {
      // Saving the sensor measures to be organized lately
      if (!v.max && !v.min) {
        contract
          .createFunction("set" + this._capitalize(v.idv), "public")
          .setInput(v.type, "_" + v.idv)
          .setAssignment(v.idv, "_" + v.idv);
      }

      //Setting max and min variables
      if (v.max) {
        const maxname = "max" + this._capitalize(v.idv);
        // Set function
        contract
          .createFunction("set" + this._capitalize(maxname), "public")
          .setInput(v.type, "_" + maxname)
          .setAssignment(maxname, "_" + maxname);
      }
      if (v.min) {
        const minname = "min" + this._capitalize(v.idv);
        // Set function
        contract
          .createFunction("set" + this._capitalize(minname), "public")
          .setInput(v.type, "_" + minname)
          .setAssignment(minname, "_" + minname);
      }
    });
  }

  _setupGetValues(contract: IGifflarContract, variables: Array<IIoTValue>) {
    const getValues = contract.createFunction("getValues", "public");

    variables.map((v) => {
      getValues.setOutput(v.idv);
    });
  }

  _setupSetMeasures(contract: IGifflarContract) {
    this.deviceMeasures.map((v) => {
      const setMeasure = contract
        .createFunction("set" + this._capitalize(v.idv), "public")
        .setInput(v.type, "_" + v.idv)
        .setAssignment(v.idv, "_" + v.idv);
      if (v.max) {
        setMeasure
          .beginIf(v.idv + " <= max" + this._capitalize(v.idv))
          .setEventCall(v.idv + "Overflow", [v.idv])
          .endIf();
      }
      if (v.min) {
        setMeasure
          .beginIf(v.idv + " >= min" + this._capitalize(v.idv))
          .setEventCall(v.idv + "Underflow", [v.idv])
          .endIf();
      }
    });
  }

  _setupController(contract: IGifflarContract, controlledName: string) {
    contract.createVariable(controlledName + "[]", "contracts", "public");
    contract.createVariable("uint", "counter", "private", "0");

    contract
      .createFunction("createContract", "public")
      .setInput("address", "_owner")
      .setVariable(
        controlledName,
        "newContract",
        "new " + controlledName + "(_owner)"
      )
      .setMethodCall("contracts", "push", "newContract")
      .setAssignment("counter", "counter + 1");

    contract
      .createFunction("getLastContract", "public")
      .setOutput("lastContract")
      .setVariable(controlledName, "lastContract", "")
      .beginIf("counter > 0")
      .setAssignment("lastContract", "contracts[counter - 1]")
      .endIf()
      .beginElse()
      .setAssignment("lastContract", "contracts[0]")
      .endElse();
  }
}

export default IotParser;
