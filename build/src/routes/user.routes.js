"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = __importDefault(require("../controllers/user.controllers"));
const userRouter = (0, express_1.Router)();
userRouter.route('/api/users')
    .get(user_controllers_1.default.getAllUsers)
    .post(user_controllers_1.default.createNewUser)
    .patch(user_controllers_1.default.updateUser)
    .delete(user_controllers_1.default.deleteUser);
exports.default = userRouter;
