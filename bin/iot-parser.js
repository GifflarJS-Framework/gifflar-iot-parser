"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IotParser = /** @class */ (function () {
    function IotParser() {
        this.definitions = [];
        this.deviceMeasures = [];
    }
    /**
     * @description This method is responsible for parsing the Json, which contains
     * information about iot sensors, to the Json that the Gifflar framework
     * understand.
     * @param {Object[]} sensors - The list of sensores which contains all the sensors.
     * @param {Object} manager - The Gifflar Manager object to construct the contracts.
     * individual Jsons.
     * @returns {Object} ContractManager
     */
    IotParser.prototype.parse = function (sensors, manager) {
        var _this = this;
        var gContract;
        var gContractController;
        sensors.map(function (sensor) {
            _this.deviceMeasures = [];
            // Creating the Sensor Contract
            gContract = manager.newContract(sensor.data.name);
            _this._setupVariables(gContract, sensor.data.values);
            _this._setupEvents(gContract);
            _this._setupConstructor(gContract);
            _this._setupFunctions(gContract, sensor.data.values);
            _this._setupGetValues(gContract, sensor.data.values);
            _this._setupSetMeasures(gContract);
            // Creating the Controller Sensor Contract
            gContractController = manager.newContract(sensor.data.name + "Controller");
            _this._setupController(gContractController, sensor.data.name);
        });
        return manager;
    };
    IotParser.prototype._capitalize = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    IotParser.prototype._setupVariables = function (contract, variables) {
        var _this = this;
        // Setting default variables
        contract.createVariable("address", "manager", "public");
        // Setting json variables
        variables.map(function (v) {
            // Saving the sensor measures to be organized lately
            if (v.max || v.min) {
                _this.deviceMeasures.push(v);
                contract.createVariable(v.type, v.idv, "public");
            }
            else {
                contract.createVariable(v.type, v.idv, "public");
            }
            // Setting up the definitions to be made lately
            v.default
                ? _this.definitions.push({
                    variable: v.idv,
                    value: v.default,
                })
                : null;
            //Setting max and min variables
            if (v.max) {
                var maxname = "max" + _this._capitalize(v.idv);
                contract.createVariable(v.type, maxname, "public");
                _this.definitions.push({
                    variable: maxname,
                    value: v.max,
                });
            }
            if (v.min) {
                var minname = "min" + _this._capitalize(v.idv);
                contract.createVariable(v.type, minname, "public");
                _this.definitions.push({
                    variable: minname,
                    value: v.min,
                });
            }
        });
    };
    IotParser.prototype._setupEvents = function (contract) {
        this.deviceMeasures.map(function (v) {
            if (v.max) {
                contract.createEvent("".concat(v.idv, "Overflow"), [
                    { name: "".concat(v.idv), type: v.type },
                ]);
            }
            if (v.min) {
                contract.createEvent("".concat(v.idv, "Underflow"), [
                    { name: "".concat(v.idv), type: v.type },
                ]);
            }
        });
    };
    IotParser.prototype._setupConstructor = function (contract) {
        // Starting the constructor
        var constructor = contract
            .createConstructor("public")
            .setInput("address", "_owner")
            .setAssignment("manager", "_owner");
        // Setting up all definitions
        this.definitions.map(function (def) {
            constructor.setAssignment(def.variable, def.value);
        });
        // Reseting the definitions (needed for when creating controller contract)
        this.definitions = [];
    };
    IotParser.prototype._setupFunctions = function (contract, variables) {
        var _this = this;
        // Setting json variables
        variables.map(function (v) {
            // Saving the sensor measures to be organized lately
            if (!v.max && !v.min) {
                contract
                    .createFunction("set" + _this._capitalize(v.idv), "public")
                    .setInput(v.type, "_" + v.idv)
                    .setAssignment(v.idv, "_" + v.idv);
            }
            //Setting max and min variables
            if (v.max) {
                var maxname = "max" + _this._capitalize(v.idv);
                // Set function
                contract
                    .createFunction("set" + _this._capitalize(maxname), "public")
                    .setInput(v.type, "_" + maxname)
                    .setAssignment(maxname, "_" + maxname);
            }
            if (v.min) {
                var minname = "min" + _this._capitalize(v.idv);
                // Set function
                contract
                    .createFunction("set" + _this._capitalize(minname), "public")
                    .setInput(v.type, "_" + minname)
                    .setAssignment(minname, "_" + minname);
            }
        });
    };
    IotParser.prototype._setupGetValues = function (contract, variables) {
        var getValues = contract.createFunction("getValues", "public");
        variables.map(function (v) {
            getValues.setOutput(v.idv);
        });
    };
    IotParser.prototype._setupSetMeasures = function (contract) {
        var _this = this;
        this.deviceMeasures.map(function (v) {
            var setMeasure = contract
                .createFunction("set" + _this._capitalize(v.idv), "public")
                .setInput(v.type, "_" + v.idv)
                .setAssignment(v.idv, "_" + v.idv);
            if (v.max) {
                setMeasure
                    .beginIf(v.idv + " <= max" + _this._capitalize(v.idv))
                    .setEventCall(v.idv + "Overflow", [v.idv])
                    .endIf();
            }
            if (v.min) {
                setMeasure
                    .beginIf(v.idv + " >= min" + _this._capitalize(v.idv))
                    .setEventCall(v.idv + "Underflow", [v.idv])
                    .endIf();
            }
        });
    };
    IotParser.prototype._setupController = function (contract, controlledName) {
        contract.createVariable(controlledName + "[]", "contracts", "public");
        contract.createVariable("uint", "counter", "private", "0");
        contract
            .createFunction("createContract", "public")
            .setInput("address", "_owner")
            .setVariable(controlledName, "newContract", "new " + controlledName + "(_owner)")
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
    };
    return IotParser;
}());
exports.default = IotParser;
