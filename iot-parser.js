/**
 * @author Levy Santiago
 * @module
 * @category Management
 * @name createIoTJsonParser
 * @description This Factory will create an iotJsonParser object. The object is responsible for
 * knowing how to translate an specific IoT sensors JSON to the JSON the framework
 * understand. When executing the function "parse", the IoTJsonParser returns a
 * ContractManager already setted up with all contract JSONs created.
 * @returns {Object} The jsonParser object.
 * @requires createContractManager
 * @example
 * Usage
 * const jsonParser = createIoTJsonParser()
 *
 * Return
 * {
 *   parse: [Function]
 * }
 */
function createIoTParser() {
  let definitions = [];
  //const sensorMeasures = [];
  const deviceMeasures = [];

  function _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function _setupVariables(contract, variables) {
    // Setting default variables
    contract.createVariable("address", "manager", "public", true);

    // Setting json variables
    variables.map((v) => {
      // Saving the sensor measures to be organized lately
      if (v.max || v.min) {
        deviceMeasures.push(v);
        contract.createVariable(v.type, v.idv, "public", false);
      } else {
        contract.createVariable(v.type, v.idv, "public", true);
      }

      // Setting up the definitions to be made lately
      v.default
        ? definitions.push({
            variable: v.idv,
            value: v.default,
          })
        : null;

      //Setting max and min variables
      if (v.max) {
        const maxname = "max" + _capitalize(v.idv);
        contract.createVariable(v.type, maxname, "public", true);
        definitions.push({
          variable: maxname,
          value: v.max,
        });
      }
      if (v.min) {
        const minname = "min" + _capitalize(v.idv);
        contract.createVariable(v.type, minname, "public", true);
        definitions.push({
          variable: minname,
          value: v.min,
        });
      }
    });
  }

  function _setupConstructor(contract) {
    // Starting the constructor
    const constructor = contract
      .createConstructor("public")
      .setInput("address", "_owner")
      .setAssignment("manager", "_owner");

    // Setting up all definitions
    definitions.map((def) => {
      constructor.setAssignment(def.variable, def.value);
    });

    // Reseting the definitions (needed for when creating controller contract)
    definitions = [];
  }

  function _setupGetValues(contract, variables) {
    const getValues = contract.createFunction("getValues", "public");

    variables.map((v) => {
      getValues.setOutput(v.idv);
    });
  }

  function _setupGetValues(contract, variables) {
    const getValues = contract.createFunction("getValues", "public");

    variables.map((v) => {
      getValues.setOutput(v.idv);
    });
  }

  function _setupSetMeasures(contract) {
    deviceMeasures.map((v) => {
      const setMeasure = contract
        .createFunction("set" + _capitalize(v.idv), "public")
        .setInput(v.type, "_" + v.idv)
        .setAssignment(v.idv, "_" + v.idv);
      if (v.max) {
        setMeasure
          .beginIf(v.idv + " <= max" + _capitalize(v.idv))
          .setCallEvent(v.idv + "Overflow", [v.idv])
          .endIf();
      }
      if (v.min) {
        setMeasure
          .beginIf(v.idv + " >= min" + _capitalize(v.idv))
          .setCallEvent(v.idv + "Underflow", [v.idv])
          .endIf();
      }
    });
  }

  function _setupController(contract, controlledName) {
    contract.createVariable("address[]", "contracts", "public");
    contract.createVariable("uint", "counter", "private", false, 0);

    contract
      .createFunction("createContract", "public")
      .setInput("address", "_owner")
      .setVariable(
        "address",
        "newContract",
        "new " + controlledName + "(_owner)"
      )
      .setCallMethod("contracts", "push", "newContract")
      .setAssignment("counter", "counter + 1");

    contract
      .createFunction("getLastContract", "public")
      .setOutput("lastContract")
      .setVariable("address", "lastContract", "address(0)")
      .beginIf("counter > 0")
      .setAssignment("lastContract", "contracts[counter - 1]")
      .endIf()
      .beginElse()
      .setAssignment("lastContract", "contracts[0]")
      .endElse();
  }

  /**
   * @author Levy Santiago
   * @name parse
   * @method
   * @public
   * @description This method is responsible for parsing the Json, which contains
   * information about iot sensors, to the Json that the Gifflar framework
   * understand.
   * @param {Object[]} sensors - The list of sensores which contains all the sensors.
   * @param {Object} manager - The Gifflar Manager object to construct the contracts.
   * individual Jsons.
   * @returns {Object} ContractManager
   */
  function parse(sensors, manager) {
    let gContract = null;
    let gContractController = null;

    sensors.map((sensor) => {
      // Creating the Sensor Contract
      gContract = manager.newContract(sensor.data.name);
      _setupVariables(gContract, sensor.data.values);
      _setupConstructor(gContract);
      _setupGetValues(gContract, sensor.data.values);
      _setupSetMeasures(gContract);

      // Creating the Controller Sensor Contract
      gContractController = manager.newContract(
        sensor.data.name + "Controller"
      );
      _setupController(gContractController, sensor.data.name);
    });

    return manager;
  }

  return { parse };
}

module.exports = createIoTParser;