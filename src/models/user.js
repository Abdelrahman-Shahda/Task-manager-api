const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs') 
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid');
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(value) {
            if(value.toLowerCase().includes('password')){
                throw new Error('Password should not contain email')
            }
        }
    },
    age: {
        type:Number,
        default:0,
        validate(value){
            if(value < 0){
                throw new Error("Age must be a positive number")
            }
        }
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }
    ],
    avater: {
        type: Buffer
    }
},{
    timestamps: true
})
//virtuals
userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})
//Middleware
userSchema.pre('save', async function(next) {

    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})
//user methods
userSchema.methods.toJSON = function () {
    const user = this.toObject()
    delete user.password
    delete user.tokens
    return user
}
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id:user._id.toString() },'anagamed2wi')
    user.tokens.push({token})
    await user.save()
    return token

}
userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({email})

    if(!user)
    {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}
const User = mongoose.model('User',userSchema)

module.exports = User