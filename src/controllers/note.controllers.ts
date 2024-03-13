import { NextFunction, Request, Response } from "express";
import noteModel, { INote } from "../models/note.model";
import bcrypt from 'bcrypt';

const asyncHandler = require('express-async-handler')


// @desc Get all notes
// @route GET /api/notes
// @access Private
const getAllNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await noteModel.find().lean() // lean() removes methods from 'notes' object
  if(!notes?.length) {
    return res.status(400).json({message: 'No notes found'})
  }
  res.json(notes)
})

// @desc Create a note
// @route POST /api/notes
// @access Private
const createNewNote = asyncHandler(async (req: Request, res: Response) => {
  const { user, title, text } = req.body
  
  // confirm data
  if (!user || !title || !text) {
    return res.status(400).json({message: 'Required field is missing'})
  }

  // TODO check for duplicates using 'ticketNums' somehow? I don't think so, because ticket number is handled by AutoIncrement
  // const duplicate = await noteModel.findOne({ ticket }).lean().exec() // According to mongoose documentation, if you are passing something in (username in this case), you are supposed to call exec() at the end
  // if (duplicate ) {
  //   return res.status(409).json({message: 'Duplicate username'})
  // }

  // Create and store new note
  const noteObject = { user, title, text }
  const newNote = await noteModel.create(noteObject)

  if (newNote) { // created
    res.status(201).json({ message: `New note created: ${title}`})
  } else {
    res.status(400).json({ message: "Invalid note data received"})
  }

})


// @desc Update a note
// @route PATCH /api/notes
// @access Private
const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const { id, user, title, text, completed } = req.body 
  
  // confirm data
  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    return res.status(400).json({message: 'All fields are required'})
  }

  // find the target note
  const noteToUpdate = await noteModel.findById({ _id : id }).exec() // <- do not add 'lean()' here because we need the .save() method below
  if ( !noteToUpdate ) {
    return res.status(400).json({message: 'Original note not found. Unable to update.'})
  }

  // updatable fields
  noteToUpdate.user = user
  noteToUpdate.title = title
  noteToUpdate.text = text
  noteToUpdate.completed = completed

  const updatedNote = await noteToUpdate.save()

  res.json({ message: `Successful update: ${updatedNote.title}`})
})


// @desc Delete a note
// @route DELETE /api/notes
// @access Private
const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.body
  // Check that ID was included in the request
  if (!id) {
    return res.status(400).json({ message: 'Note ID Required'})
  }
  // Check that the note exists
  const targetNote = await noteModel.findById(id).exec()

  if (!targetNote) {
    return res.status(400).json({ message: 'Note not found'})
  }

  // if it exists, delete the notes
  const result = await noteModel.deleteOne()
  const reply = `Note ${targetNote.title} with ID ${id} deleted`

  res.json(reply)
})

export default { getAllNotes, createNewNote, updateNote, deleteNote}