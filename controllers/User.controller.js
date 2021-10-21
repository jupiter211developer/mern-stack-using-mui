import User from '../models/User.js'
import bcrypt from 'bcryptjs'

export async function getUsers(req, res) {
    let { page, rowsPerPage, sortOrder: { name, direction }, searchText } = req.body
    let count = await User.count().catch(err => { console.log('getUsers: ', err.message) })
    let users = null
    let searchPattern = new RegExp(searchText, 'i')

    if (name && direction) {
        users = await User.find({ $or: [{ name: searchPattern }, { email: searchPattern }] }).skip(page * rowsPerPage).limit(rowsPerPage).sort({ [name]: direction }).catch(err => { console.log('getUsers: ', err.message) })
    } else {
        users = await User.find({ $or: [{ name: searchPattern }, { email: searchPattern }] }).skip(page * rowsPerPage).limit(rowsPerPage).catch(err => { console.log('getUsers: ', err.message) })
    }

    if (!users) {
        return res.status(500).end()
    }

    res.json({ list: users, count })
}

export async function deleteUser(req, res) {
    let result = await User.deleteOne({_id: req.body.user_id}).catch(err => {console.log('deleteUser: ', err.message)})

    if (!result) {
        return res.status(500).end()
    }

    res.json({ error: false })
}

export async function updateUser(req, res) {
    let user = await User.findOne({_id: req.body._id}).catch(err => {console.log('updateUser: ', err.message)})

    if (!user) {
        return res.status(500).end()
    }

    user.name = req.body.name
    user.email = req.body.email
    user.register_date = req.body.register_date

    await user.save().catch(err => {console.log('updateUser: ', err.message)})

    res.json({ error: false })
}

export async function createUser(req, res) {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' })
    }

    try {
        const user = await User.findOne({ email }).catch(err => {console.log('createUser: ', err.message)})
        if (user) {
            throw Error('User already exists')
        }

        const salt = await bcrypt.genSalt(10)
        if (!salt) {
            throw Error('Something went wrong with bcrypt')
        }

        const hash = await bcrypt.hash(password, salt)
        if (!hash) {
            throw Error('Something went wrong hashing the password')
        }

        const newUser = new User({
            name,
            email,
            password: hash
        })

        const savedUser = await newUser.save().catch(err => {console.log('createUser: ', err.message)})
        if (!savedUser) {
            throw Error('Something went wrong saving the user')
        }

        res.status(200).json({ error: false })
    } catch (e) {
        res.status(500).end()
    }
}