const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser')
const morgan = require('morgan');
const colors = require('colors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const {config,connectDB} = require('./config');
const ErrorResponse = require('./util/errorResponse');

const {
       userRoutes,
       authRoutes,
       schoolRoutes,
       courseRoutes,
       reviewRoutes} = require('./routes')


// Connect to Database
connectDB()
const app  = express();

app.use(express.json())
app.use(cookieParser())
// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
  
// File uploading
app.use(fileupload());

// Set security headers
app.use(helmet());

//sanitize
app.use(mongoSanitize());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)
app.use('/api/schools',schoolRoutes)
app.use('/api/courses',courseRoutes)
app.use('/api/reviews',reviewRoutes)

app.use(async function(req,res,next){
    const error = new ErrorResponse('Not Found',404)
    next(error)
})

app.use(errorHandler)


app.listen(config.port,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${config.port}`.yellow.bold
        )
) 

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
});