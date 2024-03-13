import mongoose from "mongoose";

const AutoIncrement = require('mongoose-sequence')(mongoose)

export interface INote {
  _id: string;
  user: mongoose.Schema.Types.ObjectId;
  title: string;
  text: string;
  completed: boolean;
  createdAt: mongoose.Schema.Types.Date;
  updatedAt: mongoose.Schema.Types.Date;
}

const NoteSchema = new mongoose.Schema<INote>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
},
  { timestamps: true}
)

NoteSchema.plugin(AutoIncrement, {
  inc_field: 'ticket',
  id: 'ticketNums',
  start_seq: 500
})

export default mongoose.model<INote>("Note", NoteSchema)