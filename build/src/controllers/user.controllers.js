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
const user_model_1 = __importDefault(require("../models/user.model"));
const note_model_1 = __importDefault(require("../models/note.model"));
const asyncHandler = require('express-async-handler');
// import expressAsyncHandler from "express-async-handler";
// const asyncHandler = expressAsyncHandler
const bcrypt_1 = __importDefault(require("bcrypt"));
// @desc Get all users
// @route GET /api/users
// @access Private
const getAllUsers = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.find().select('-password').lean(); // lean() removes methods from 'users' object
    if (!(users === null || users === void 0 ? void 0 : users.length)) {
        return res.status(400).json({ message: 'No users found' });
    }
    res.json(users);
}));
// @desc Create a user
// @route POST /api/users
// @access Private
const createNewUser = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, roles } = req.body;
    // confirm data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    // check for duplicates
    const duplicate = yield user_model_1.default.findOne({ username }).lean().exec(); // According to mongoose documentation, if you are passing something in (username in this case), you are supposed to call exec() at the end
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' });
    }
    // hash password
    const hashedPwd = yield bcrypt_1.default.hash(password, 10); // 10 salt rounds
    const userObject = { username, "password": hashedPwd, roles };
    // Create and store new user
    const newUser = yield user_model_1.default.create(userObject);
    if (newUser) { // created
        res.status(201).json({ message: `New user ${username} created` });
    }
    else {
        res.status(400).json({ message: "Invalid user data received" });
    }
}));
// @desc Update a user
// @route PATCH /api/users
// @access Private
const updateUser = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, username, roles, active, password } = req.body;
    // confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' });
    }
    // find the target user
    const userToUpdate = yield user_model_1.default.findById({ _id: id }).exec(); // <- do not add 'lean()' here because we need the .save() method below
    if (!userToUpdate) {
        return res.status(400).json({ message: 'User not found' });
    }
    // check for duplicates
    const duplicate = yield user_model_1.default.findOne({ username }).lean().exec();
    // allow updates to the original user
    if (duplicate && (duplicate === null || duplicate === void 0 ? void 0 : duplicate._id.toString()) !== id) {
        return res.status(409).json({ message: 'Duplicate username' });
    }
    userToUpdate.username = username;
    userToUpdate.roles = roles;
    userToUpdate.active = active;
    if (password) {
        userToUpdate.password = yield bcrypt_1.default.hash(password, 10); // 10 salt rounds
    }
    const updatedUser = yield userToUpdate.save();
    res.json({ message: `${updatedUser.username} updated` });
}));
// @desc Delete a user
// @route DELETE /api/users
// @access Private
const deleteUser = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' });
    }
    const note = yield note_model_1.default.findOne({ user: id }).lean().exec();
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' });
    }
    const user = yield user_model_1.default.findById(id).exec();
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }
    const result = yield user_model_1.default.deleteOne();
    const reply = `Username ${user.username} with ID ${id} deleted`;
    res.json(reply);
}));
exports.default = { getAllUsers, createNewUser, updateUser, deleteUser };
