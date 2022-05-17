const fs = require("fs");
const assert = require("assert");
const { createContractManager } = require("gifflar");
const createIoTJsonParser = require("../../iot-parser");
const expectedModeling = JSON.stringify(require("../examples/contract-1.json"));
const writing_path = __dirname + "/../examples/";
const expectedCode = fs.readFileSync(writing_path + "contract-1.txt", {
  encoding: "utf8",
});

describe("IoT Json Parser", () => {
  //Entry example
  const sensors = [
    {
      data: {
        name: "DHT11",
        values: [
          {
            idv: "temperature",
            type: "uint",
            default: "",
            max: "10",
            min: "0",
          },
          {
            idv: "humidity",
            type: "uint",
            default: "",
            max: "10",
            min: "0",
          },
        ],
      },
    },
    {
      data: {
        name: "Rele",
        values: [
          {
            idv: "status",
            type: "bool",
            default: "false",
          },
        ],
      },
    },
  ];

  let manager = createContractManager();
  let parser = null;

  it("Parser creation shouldn't throw error", () => {
    assert.doesNotThrow(() => {
      parser = createIoTJsonParser();
    }, "parser creation shouldn't throw error.");
  });

  describe("#parse()", () => {
    it("parsing JSON shouldn't throw error", () => {
      assert.doesNotThrow(() => {
        parser.parse(sensors, manager);
      }, "JSON parsing shouldn't throw error.");
    });
  });

  it("should match with the expected JSON", () => {
    manager = parser.parse(sensors, manager);
    const actualModeling = JSON.stringify(manager.contracts);
    console.log(actualModeling);
    // assert.equal(actualModeling, expectedModeling);
  });

  it("should match with the expected code", () => {
    const actualCode = manager.write();
    console.log(actualCode);
    // assert.equal(actualCode, expectedCode);
  });

  it("should match with the expected code", () => {
    assert.doesNotThrow(() => {
      manager.compileAll((errors) => {
        if (Array.isArray(errors)) {
          errors.map((e) => {
            console.log(e.formattedMessage);
          });
        }
      });
    }, "Compilation should run ok.");
  }).timeout(0);
});

[
  {
    name: "DHT11",
    contract: {
      variables: [
        {
          type: "address",
          name: "manager",
          scope: "public",
          value: "",
          setMethod: true,
        },
        {
          type: "uint",
          name: "temperature",
          scope: "public",
          value: "",
          setMethod: false,
        },
        {
          type: "uint",
          name: "maxTemperature",
          scope: "public",
          value: "",
          setMethod: true,
        },
        {
          type: "uint",
          name: "minTemperature",
          scope: "public",
          value: "",
          setMethod: true,
        },
        {
          type: "uint",
          name: "humidity",
          scope: "public",
          value: "",
          setMethod: false,
        },
        {
          type: "uint",
          name: "maxHumidity",
          scope: "public",
          value: "",
          setMethod: true,
        },
        {
          type: "uint",
          name: "minHumidity",
          scope: "public",
          value: "",
          setMethod: true,
        },
      ],
      functions: [
        {
          name: "",
          scope: "public",
          isConstructor: true,
          inputs: [{ name: "_owner", type: "address" }],
          outputs: [],
          content: [
            { statement: "assignment", variable: "manager", value: "_owner" },
            {
              statement: "assignment",
              variable: "maxTemperature",
              value: "10",
            },
            { statement: "assignment", variable: "minTemperature", value: "0" },
            { statement: "assignment", variable: "maxHumidity", value: "10" },
            { statement: "assignment", variable: "minHumidity", value: "0" },
          ],
        },
        {
          name: "getValues",
          scope: "public",
          isConstructor: false,
          inputs: [],
          outputs: ["temperature", "humidity"],
          content: [],
        },
        {
          name: "setTemperature",
          scope: "public",
          isConstructor: false,
          inputs: [{ name: "_temperature", type: "uint" }],
          outputs: [],
          content: [
            {
              statement: "assignment",
              variable: "temperature",
              value: "_temperature",
            },
            {
              statement: "if",
              else: false,
              condition: "temperature <= maxTemperature",
              content: [
                {
                  statement: "callevent",
                  name: "temperatureOverflow",
                  inputs: [{ name: "temperature", type: "uint" }],
                },
              ],
            },
            {
              statement: "if",
              else: false,
              condition: "temperature >= minTemperature",
              content: [
                {
                  statement: "callevent",
                  name: "temperatureUnderflow",
                  inputs: [{ name: "temperature", type: "uint" }],
                },
              ],
            },
          ],
        },
        {
          name: "setHumidity",
          scope: "public",
          isConstructor: false,
          inputs: [{ name: "_humidity", type: "uint" }],
          outputs: [],
          content: [
            {
              statement: "assignment",
              variable: "humidity",
              value: "_humidity",
            },
            {
              statement: "if",
              else: false,
              condition: "humidity <= maxHumidity",
              content: [
                {
                  statement: "callevent",
                  name: "humidityOverflow",
                  inputs: [{ name: "humidity", type: "uint" }],
                },
              ],
            },
            {
              statement: "if",
              else: false,
              condition: "humidity >= minHumidity",
              content: [
                {
                  statement: "callevent",
                  name: "humidityUnderflow",
                  inputs: [{ name: "humidity", type: "uint" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    name: "DHT11Controller",
    contract: {
      variables: [
        {
          type: "DHT11[]",
          name: "contracts",
          scope: "public",
          value: "",
          setMethod: false,
        },
        {
          type: "uint",
          name: "counter",
          scope: "private",
          value: 0,
          setMethod: false,
        },
      ],
      functions: [
        {
          name: "createContract",
          scope: "public",
          isConstructor: false,
          inputs: [{ name: "_owner", type: "address" }],
          outputs: [],
          content: [
            {
              statement: "variable",
              type: "DHT11",
              name: "newContract",
              value: "new DHT11(_owner)",
            },
            {
              statement: "callmethod",
              variable: "contracts",
              method: "push",
              value: "newContract",
            },
            {
              statement: "assignment",
              variable: "counter",
              value: "counter + 1",
            },
          ],
        },
        {
          name: "getLastContract",
          scope: "public",
          isConstructor: false,
          inputs: [],
          outputs: ["lastContract"],
          content: [
            {
              statement: "variable",
              type: "DHT11",
              name: "lastContract",
              value: "",
            },
            {
              statement: "if",
              else: false,
              condition: "counter > 0",
              content: [
                {
                  statement: "assignment",
                  variable: "lastContract",
                  value: "contracts[counter - 1]",
                },
              ],
            },
            {
              statement: "if",
              else: true,
              condition: "",
              content: [
                {
                  statement: "assignment",
                  variable: "lastContract",
                  value: "contracts[0]",
                },
              ],
            },
          ],
        },
      ],
    },
  },
];

contract DHT11{
//VARIABLES
uint public temperature;
uint public maxTemperature;
uint public minTemperature;
uint public humidity;
uint public maxHumidity;
uint public minHumidity;

//EVENTS
event temperatureOverflow(uint temperature);
event temperatureUnderflow(uint temperature);
event humidityOverflow(uint humidity);
event humidityUnderflow(uint humidity);

//FUNCTIONS
constructor(address _owner) public{...}

function getValues() public returns (uint, uint) {...}
function setTemperature(uint _temperature) public{...}
function setHumidity(uint _humidity) public{...}
[...]
}