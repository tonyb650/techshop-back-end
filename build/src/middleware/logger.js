"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.logEvents = void 0;
const date_fns_1 = require("date-fns");
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Logging_1 = __importDefault(require("../library/Logging"));
const fsPromises = fs_1.default.promises;
/** This is Dave Gray's function to handle logging events. It is used by the middleware below */
const logEvents = (message, logFileName) => __awaiter(void 0, void 0, void 0, function* () {
    const dateTime = `${(0, date_fns_1.format)(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${(0, uuid_1.v4)()}\t${message}\n`;
    try {
        if (!fs_1.default.existsSync(path_1.default.join(__dirname, '..', 'logs'))) { // If the 'logs' folder doesn't exist...
            yield fsPromises.mkdir(path_1.default.join(__dirname, '..', 'logs')); // ... then make the folder
        }
        yield fsPromises.appendFile(path_1.default.join(__dirname, '..', 'logs', logFileName), logItem); // inside of the 'logs' folder, append the 'logFileName' file with the 'message'
    }
    catch (err) {
        Logging_1.default.error(err);
    }
});
exports.logEvents = logEvents;
/** This is Dave Gray's logging middleware. When an request is made, the event is added to reqLog.log file AND logged to the console */
const logger = (req, res, next) => {
    // TODO: filter or somehow manage 'reqLog.log' file so that it doesn't grow huge
    (0, exports.logEvents)(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
    console.log(`${req.method} ${req.path}`); // TODO Integrate this console.log from Dave Gray with Nerdy Canuck logging function
    next();
};
exports.logger = logger;
