const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config()

const config = {
    port: process.env.PORT || 3000,
    mongodb: {
      dsn: process.env.NODE_ENV === 'production' ? process.env.MONGODB_PROD_URI : process.env.MONGODB_LOCAL_URI,
      options: {
        dbName: 'studentManagement',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify:false
      },
    },
    // debugger: debug(`${appName}:server`),
    secret:process.env.JWT_SECRET,
    jwtTokenExpire:process.env.JWT_EXPIRE
  };
  
const connectDB = ()=>{
    const {dsn,options} = config.mongodb
    mongoose.connect(dsn,options).then(function(){
        console.log(`MongoDB Connected: ${mongoose.connection.host}`.cyan.underline.bold);
    }).catch((err)=>{
        console.log('Could not connect to db',err)
    })
}

module.exports = {
    config,
    connectDB
}