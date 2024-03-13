import { Router } from 'express'
import noteController from '../controllers/note.controllers'
const noteRouter = Router()

noteRouter.route('/api/notes')
  .get(noteController.getAllNotes)
  .post(noteController.createNewNote)
  .patch(noteController.updateNote)
  // .delete(noteController.deleteNote)

export default noteRouter