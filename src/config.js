require('dotenv').config()

const SECRET = process.env.SECRET
const PORT = process.env.PORT
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const MONGODB = process.env.MONGODB

module.exports = {
    SECRET,
    PORT,
    SENDGRID_API_KEY,
    MONGODB
}
