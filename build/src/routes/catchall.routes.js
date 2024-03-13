"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const catchAllRouter = (0, express_1.Router)();
catchAllRouter.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path_1.default.join(__dirname, '..', 'views', '404.html')); // TODO the css file is not connecting from the public folder upon deployment
    }
    else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' });
    }
    else {
        res.type('txt').send('404 Not Found');
    }
});
exports.default = catchAllRouter;
