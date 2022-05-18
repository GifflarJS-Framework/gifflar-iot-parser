import IotParser from "./src/iot-parser";

const GifflarIotParser = {
  createIoTParser: () => {
    return new IotParser();
  },
};

export default GifflarIotParser;
