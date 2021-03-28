const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/dailyEmail',{useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection

db.on('error', (err) => {
   console.log(err)
})
db.once('open', function callback() {
   console.log('datbase connection established')
})

process.on('SIGINT', function() {
   console.log('database connection terminated')
   db.close()
   process.exit()
})

module.exports = {
   db: db
}