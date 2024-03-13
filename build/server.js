"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = __importDefault(require("./src/routes/user.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const Logging_1 = __importDefault(require("./src/library/Logging"));
const path_1 = __importDefault(require("path"));
const root_routes_1 = __importDefault(require("./src/routes/root.routes"));
const catchall_routes_1 = __importDefault(require("./src/routes/catchall.routes"));
const logger_1 = require("./src/middleware/logger");
const errorHandler_1 = require("./src/middleware/errorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
const note_routes_1 = __importDefault(require("./src/routes/note.routes"));
dotenv_1.default.config(); // loads environmental variables to whole project
/** Specify allowed origins for CORS options as defined below (Note that Dave Gray put this in a separate file in the config folder)*/
const allowedOrigins = [
    'http://localhost:5173',
    'http://weddingwordsmith.com',
    'https://weddingwordsmith.com',
    'http://api.weddingwordsmith.com',
    'https://api.weddingwordsmith.com',
    'http://www.weddingwordsmith.com',
    'https://www.weddingwordsmith.com'
];
/** Set up cors options object for CORS middleware below (Note that Dave Gray also put this in a separate file in the config folder)*/
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) { //successful
            callback(null, true);
        }
        else { //fails
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // sets 'access-control-allow-credentials' header for you
    optionsSuccessStatus: 200
};
const app = (0, express_1.default)();
const PORT = 8000; // Express port
app.use(logger_1.logger);
/* Middleware for logging request and response - This comes from Nerdy Canuck */
// TODO combine this with Dave Gray logging and move to middleware folder 
app.use((req, res, next) => {
    Logging_1.default.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
    res.on('finish', () => {
        if (res.statusCode > 399) {
            Logging_1.default.warn(`Outgoing -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] -> Status: [${res.statusCode}]`);
        }
        else {
            Logging_1.default.info(`Outgoing -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] -> Status: [${res.statusCode}]`);
        }
    });
    next();
});
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json()); // Middleware will process JSON
app.use(express_1.default.urlencoded({ extended: true })); // Middleware for bodyParser
// review 'API Rules' on Nerdy Canuck ~17:00
// Fetch sends an "OPTIONS" pre-flight request
// app.use(cors({ origin: allowedOrigins, allowedHeaders: ['Content-Type', 'Authorization'], credentials: true }))
app.use((0, cors_1.default)(corsOptions));
require('./src/config/mongoose.config'); // start database connection here
/** BRING IN ALL ROUTES STARTING HERE */
/** Healthcheck route*/
app.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong' }));
/** Static Files Route */
app.use('/', express_1.default.static(path_1.default.join(__dirname, 'public'))); // 'path' is from NodeJS. Listens for root route. __dirname is a global variable. We're telling Express where to find static files.
/** Root Router */
app.use(root_routes_1.default);
/** API routes here */
app.use(user_routes_1.default);
app.use(note_routes_1.default);
/** Catchall (404) */
app.use(catchall_routes_1.default);
/** Finally, add errorHandler that: adds error to log, logs error to console, sets res.status and res.json */
app.use(errorHandler_1.errorHandler);
mongoose_1.default.connection.once('open', () => {
    app.listen(PORT, () => Logging_1.default.info(`Express is listening on port: ${PORT}`));
});
// TODO: Try to figure out the interface for 'err' below. Not MongooseError, not Error, not mongoose.Error. Is a "MongoDB" error?
mongoose_1.default.connection.on('error', (err) => {
    Logging_1.default.error(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`);
    (0, logger_1.logEvents)(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});
