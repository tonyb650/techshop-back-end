import mongoose from "mongoose";

export interface IUser {
  _id: string;
  username: string;
  password: string;
  // _confirmPassword: string;
  roles: string[];
  active: boolean;
  createdAt: mongoose.Schema.Types.Date;
  updatedAt: mongoose.Schema.Types.Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  roles: [{
    type: String,
    default: "Employee"
  }],
  active: {
    type: Boolean,
    default: true
  }
})

export default mongoose.model<IUser>("User", UserSchema)