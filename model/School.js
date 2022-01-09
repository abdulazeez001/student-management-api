const mongoose = require('mongoose');
const geocoder = require('../util/geocoder')

const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
      },
     
      description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
      },
      website: {
        type: String,
        match: [
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
          'Please use a valid URL with HTTP or HTTPS'
        ]
      },
      phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
      },
      email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      address:{
          type:String,
          required: [true, 'Please add an address']
      },
      location: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
      },
      careers: {
        type: [String],
        required: true,
        enum: [
          'Course A',
          'Course B',
          'Course C',
          'Course D',
          'Course E',
          'other'
        ]
      },
      averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
      },
      averageCost: Number,
      photo: {
        type: String,
        default: 'no-photo.jpg'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      user:{
          type:mongoose.Schema.ObjectId,
          ref:'User',
          required:true
      }
      
},{
  toJSON:{
    virtuals:true
},
toObject:{
    virtuals:true
}  
})


SchoolSchema.virtual('courses',{
    ref:'Course',
    localField:'_id',
    foreignField:'school',
    justOne:false
})

SchoolSchema.pre('save', async function(next){
  const location = await geocoder.geocode(this.address);
  const {longitude,
         latitude,
         formattedAddress,
         streetName,
         city,
         stateCode,
         zipcode,
         countryCode} = location[0]
  this.location = {
    type: 'Point',
    coordinates: [longitude, latitude],
    formattedAddress: formattedAddress,
    street: streetName,
    city: city,
    state: stateCode,
    zipcode: zipcode,
    country: countryCode}

    this.address = undefined
})
// delete courses when a school is deleted
SchoolSchema.pre('remove',async function(next){
    console.log(`Courses being removed from school ${this._id}`);
     await this.model('Course').deleteMany({school:this_id});
     next()
})

module.exports = mongoose.model('School', SchoolSchema);