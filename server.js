const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({
    path: `.env.${process.env.NODE_ENV}`
  });       // will run based on NODE_ENV mentioned in package.json script
const app = require('./app')
const db = process.env.DATABASE_URL.replace('<db_password>',process.env.PASSWORD)

mongoose.connect(db).then(()=>{
  console.log('database connection established successfully!')
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}`)
})