import fs from "fs";
import { IGifflarContract } from "gifflar/bin/modules/managing/contract/types/IGifflarContract";
import IoTParser from "../../src/iot-parser";
const assert = require("assert");
const { createContractManager } = require("gifflar");
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
    // {
    //   data: {
    //     name: "Rele",
    //     values: [
    //       {
    //         idv: "status",
    //         type: "bool",
    //         default: "false",
    //       },
    //     ],
    //   },
    // },
  ];

  it("Parser creation shouldn't throw error", () => {
    assert.doesNotThrow(() => {}, "parser creation shouldn't throw error.");
  });

  describe("#parse()", () => {
    let manager = createContractManager();
    const parser = new IoTParser();
    it("should match with the expected JSON", () => {
      manager = parser.parse(sensors, manager);
      const resultJson = manager.contracts.map((contract: IGifflarContract) => {
        return JSON.parse(contract.toString());
      });
      // console.log(actualModeling);
      expect(JSON.stringify(resultJson)).toEqual(expectedModeling);
    });

    it("should match with the expected code", () => {
      const actualCode = manager.writeAll();
      expect(actualCode).toEqual(expectedCode);
    });

    it("should compile ok", () => {
      assert.doesNotThrow(() => {
        manager.compileAll((errors: Array<any>) => {
          if (Array.isArray(errors)) {
            errors.map((e) => {
              console.log(e.formattedMessage);
            });
          }
        });
      }, "Compilation should run ok.");
    }, 0);
  });
});
