const mongoose = require("mongoose");

const { Schema } = mongoose;
const {
    Types: { ObjectId }
} = Schema;

const boardSchema = new Schema({
    writer: {
        type: ObjectId,
        required: true,
        ref: "User"
    },
    name: {
        type: String,
        required: true,
        ref:"User"
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("board", boardSchema);