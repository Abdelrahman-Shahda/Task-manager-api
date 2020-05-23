const express = require('express')
require('./db/mongoose.js')
const userRouter = require('./routers/user.js')
const taskRouter = require('./routers/task')
//Express config
const app = express();
const port = process.env.PORT ;

//Customize the app
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

//app listen for requests
app.listen(port, () => {
    console.log(`Server is up and runnig at ${port}`)
})
