"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var iot_parser_1 = __importDefault(require("./iot-parser"));
var GifflarIotParser = {
    createIoTParser: function () {
        return new iot_parser_1.default();
    },
};
exports.default = GifflarIotParser;
