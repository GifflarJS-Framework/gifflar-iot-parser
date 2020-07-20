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
    assert.equal(actualModeling, expectedModeling);
  });

  it("should match with the expected code", () => {
    const actualCode = manager.write();
    assert.equal(actualCode, expectedCode);
  });
});
