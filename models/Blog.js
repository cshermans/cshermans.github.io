const mongoose = require('mongoose')

const Schema = mongoose.Schema

var blogSchema = new Schema ({
    text: {
        type: String,
        unique: false,
        required: true
    },
    user: {
        type: String,
        unique: false,
        required: true,
    }

}, {timestamps : true})

const Blog = mongoose.model('Blog', blogSchema)
module.exports = Blog