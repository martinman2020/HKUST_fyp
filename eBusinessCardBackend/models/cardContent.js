import mongoose from "mongoose";

const contactMethod = mongoose.Schema({
    type: String,
    value: String,
})

const cardsSchema = mongoose.Schema({
    email: String,
    password: String,
    title: String,
    firstName: String,
    lastName: String,
    gender: String,
    selectedFile : String,
    introduction: String,
    service:[String], 
    experience: [String],
    award: [String],
    createdAt:{
        type: Date,
        default: new Date(),
    },
    lastModifiedAt: Date,
    contact:[contactMethod]
})

const CardContent = mongoose.model('cardContent', cardsSchema);

export default CardContent;