const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    username: String, 
    password: String,
    confirm_password: String,
    email: String,
    firstname: String,
    surname: String,
    birthday: Date, 
    age: String,
    created: {
        type: Date,
        default: Date.now
    }
});

UserSchema.plugin(passportLocalMongoose); // creation of la méthode User.authenticate, User.serializeUserUser and User.deserialiseUser, User.register

const User = mongoose.model('User', UserSchema);

module.exports = User;