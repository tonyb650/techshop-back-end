"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const rootRouter = (0, express_1.Router)();
/** Get the index.html file if it matches any of the 3 below */
rootRouter.get('^/$|index(.html)?', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '..', 'views', 'index.html'));
});
exports.default = rootRouter;
