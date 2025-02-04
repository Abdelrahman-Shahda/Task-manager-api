const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth.js')
const router = new express.Router();
const multer = require('multer')
const sharp = require('sharp')

router.post('/users',async (req,res) => {
    const user = new User(req.body);
    
    try{
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
})
router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token})
    } catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter( token => token.token !== req.token)
        await req.user.save()
        res.send()

    } catch(e) {
        res.status(500).send()
    }
}) 
router.post('/users/logall', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        console.log('cool')
        res.send()
       
    } catch(e) {
        res.status(500).send()
    }
}) 
router.get('/users/me', auth, async (req, res) => {
    
    res.send(req.user)

})

router.patch('/users/me', auth, async (req, res) => {
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every(update => allowedUpdates.includes(update) )
    
    if(!isValid){
        return res.send(400).send({error: 'Invalid updates!'})
    }
    try{
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.send(user)
    } catch(e)
    {
        res.status(400).send()
    }
})

const upload = multer({
    limits: {
        fileSize:1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.matchs(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a correct format'))
        }
        cb(undefined, true)

    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    
    const buffer = await sharp(rq.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})
router.delete('/users/me/avatars', auth, async (req, res) => {

    req.user.avatar = undefined
    await req.user.save()
    res.send()
})
router.delete('/users/me', auth, async (req, res) => {
    try{
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})
module.exports = router