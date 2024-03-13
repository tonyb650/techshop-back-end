import { NextFunction, Request, Response } from "express";
import userModel, { IUser } from "../models/user.model";
import noteModel from "../models/note.model";
const asyncHandler = require('express-async-handler')
// import expressAsyncHandler from "express-async-handler";
// const asyncHandler = expressAsyncHandler
import bcrypt from 'bcrypt';

// @desc Get all users
// @route GET /api/users
// @access Private
const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userModel.find().select('-password').lean() // lean() removes methods from 'users' object
  if(!users?.length) {
    return res.status(400).json({message: 'No users found'})
  }
  res.json(users)
})

// @desc Create a user
// @route POST /api/users
// @access Private
const createNewUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password, roles } = req.body
  
  // confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({message: 'All fields are required'})
  }

  // check for duplicates
  const duplicate = await userModel.findOne({ username }).lean().exec() // According to mongoose documentation, if you are passing something in (username in this case), you are supposed to call exec() at the end
  if (duplicate ) {
    return res.status(409).json({message: 'Duplicate username'})
  }

  // hash password
  const hashedPwd = await bcrypt.hash(password, 10) // 10 salt rounds

  const userObject = { username, "password": hashedPwd, roles}

  // Create and store new user
  const newUser = await userModel.create(userObject)

  if (newUser) { // created
    res.status(201).json({ message: `New user ${username} created`})
  } else {
    res.status(400).json({ message: "Invalid user data received"})
  }

})

// @desc Update a user
// @route PATCH /api/users
// @access Private
const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id, username, roles, active, password } = req.body
  
  // confirm data
  if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
    return res.status(400).json({message: 'All fields are required'})
  }

  // find the target user
  const userToUpdate = await userModel.findById({ _id : id }).exec() // <- do not add 'lean()' here because we need the .save() method below
  if ( !userToUpdate ) {
    return res.status(400).json({message: 'User not found'})
  }

  // check for duplicates
  const duplicate = await userModel.findOne({ username }).lean().exec()
  // allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({message: 'Duplicate username'})
  }

  userToUpdate.username = username
  userToUpdate.roles = roles
  userToUpdate.active = active

  if(password) {
    userToUpdate.password = await bcrypt.hash(password, 10) // 10 salt rounds
  }

  const updatedUser = await userToUpdate.save()

  res.json({ message: `${updatedUser.username} updated`})
})

// @desc Delete a user
// @route DELETE /api/users
// @access Private
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.body
  if (!id) {
    return res.status(400).json({ message: 'User ID Required'})
  }
  const note = await noteModel.findOne({ user: id }).lean().exec()
  if (note) {
    return res.status(400).json({ message: 'User has assigned notes'})
  }
  const user = await userModel.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: 'User not found'})
  }

  const result = await userModel.deleteOne()
  const reply = `Username ${user.username} with ID ${id} deleted`

  res.json(reply)
})

export default { getAllUsers, createNewUser, updateUser, deleteUser}