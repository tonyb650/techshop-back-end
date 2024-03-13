"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const note_controllers_1 = __importDefault(require("../controllers/note.controllers"));
const noteRouter = (0, express_1.Router)();
noteRouter.route('/api/notes')
    .get(note_controllers_1.default.getAllNotes)
    .post(note_controllers_1.default.createNewNote)
    .patch(note_controllers_1.default.updateNote);
// .delete(noteController.deleteNote)
exports.default = noteRouter;
