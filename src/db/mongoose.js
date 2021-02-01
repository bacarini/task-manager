const mongoose = require('mongoose')
const { MONGODB } = require('../config')

mongoose.connect(MONGODB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
