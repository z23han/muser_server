var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');


// Schema for users
var UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique : true,
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique : true,
    },
    city: {
        type: String,
        required: true
    },
    isConsented: {
        type: Boolean,
        require:  true
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

// Hash and salt the password and add the instance to database
module.exports.addUser = function(newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
         bcrypt.hash(newUser.password, salt, function(err, hash){
             if(err) throw err;
             newUser.password = hash;
             newUser.save(callback);
         });
    });
};

module.exports.getUserByName = function (name, callback) {
    var query = {name: name};
    User.findOne(query, callback);
};

module.exports.getUserByPhone = function (phone, callback) {
    var query = {phone: phone};
    User.findOne(query, callback);
};

// Check if the hashed passwords matched
module.exports.comparePassword = function(tryPassword, hash, callback){
    bcrypt.compare(tryPassword, hash, function(err, isMatch){
        if(err) throw err;
        callback(null, isMatch);
    });
};