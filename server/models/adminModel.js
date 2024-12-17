const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const adminModel = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please enter your username"],
        trim: true,
        minLength:5,
        maxLength:8,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    timestamps: true
});

adminModel.pre("save", async function(next){
    try{
        if(!this.isModified("password")){
            next();
        }
        this.password = await bcrypt.hash(this.password, 12);
    }catch(error){
        console.log(error);
    }
});

adminModel.pre("save", async function(next) {
    try {
        if (this.isModified("password")) {
            this.passwordChangedAt = Date.now() - 1000; 
        } else if (this.isNew) {
            this.passwordChangedAt = Date.now() - 1000;
        }
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
});

adminModel.methods.checkPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

adminModel.methods.passwordChangedAfterIssuingToken = function(JWTtimestamp){
    if(this.passwordChangedAt){
        const passwordChangeTime = parseInt(this.passwordChangedAt.getTime()/1000, 10);
        return passwordChangeTime > JWTtimestamp;
    }
    return false;
}

module.exports = mongoose.model('Admin', adminModel);