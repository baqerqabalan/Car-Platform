const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please enter your first name"],
        trim: true,
        match: [/^[a-zA-Z]+$/, "First name should only contain alphabetic characters"],
    },
    lastName : {
        type: String,
        required: [true, "Please enter your last name"],
        trim: true,
        match: [/^[a-zA-Z]+$/, "Last name should only contain alphabetic characters"],
    },
    username: {
        type: String,
        required: [true, "Please enter your username"],
        trim: true,
        minLength:5,
        maxLength:8,
        unique: true
    },
    dob: {
        type: Date,
        required: [true, 'Please enter your date of birth'],
    },
    phoneNumber:{
        type:String,
        required:[true, "Please enter a valid phone number"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/],
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength:8,
    },
    profileImg: {
        type: String,
        required: false,
        default: null
      },
      reputationScore:{
        type:Number,
        default:0,
      },
      joinDate: {
        type:Date,
        default: Date.now(),
      },
      job:{
        type:String,
        required: [true, "Please enter your job"],
      },
      badges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EarnedBadge'
    }],
      passwordChangedAt: Date,
      passwordResetToken: String,
      passwordResetExpires: Date,
      },
      {
        timestamps: true
    },
);

userSchema.pre("save", async function(next){
    try{
        if(!this.isModified("password")){
            next();
        }
        this.password = await bcrypt.hash(this.password, 12);
    }catch(error){
        console.log(error);
    }
});

userSchema.pre("save", async function(next) {
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

userSchema.methods.checkPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.generatePasswordResetToken = async function() {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

userSchema.methods.passwordChangedAfterIssuingToken = function(JWTtimestamp){
    if(this.passwordChangedAt){
        const passwordChangeTime = parseInt(this.passwordChangedAt.getTime()/1000, 10);
        return passwordChangeTime > JWTtimestamp;
    }
    return false;
}

module.exports = mongoose.model("User", userSchema);