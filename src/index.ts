import IotParser from "./iot-parser";

const GifflarIotParser = {
  createIoTParser: () => {
    return new IotParser();
  },
};

export default GifflarIotParser;
