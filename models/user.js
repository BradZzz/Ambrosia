var mongoose = require('mongoose')
var bcrypt   = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({

  //user fields
  name:     { type: String },
  email:    { type: String, required: true, index: true },
  gender:   { type: String },
  address1: { type: String },
  address2: { type: String },
  city:     { type: String },
  state:    { type: String },
  zip:      { type: Number },
  //misc shit that has to do with the user's account
  personal: [{ type: mongoose.Schema.Types.Mixed }],

  //profile fields
  photo:    { type: String, default: 'assets/img/test/test_logged_out.png' },
  background : { type: Number, default: 1 },

  //server fields
  pass:     { type: String, required: true },
  role:     { type: Number, default: 1 },
  token:    { type: String },
  type:     { type: String, required: true },

  created:  { type: Date, default: Date.now },
  __v:      { type: Number, select: false },
})

//methods ======================
//generating a hash
userSchema.methods.generateHash = function(password) {
 return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function(password) {
 return bcrypt.compareSync(password, this.pass);
};

//return formatted string for client
userSchema.methods.clientUser = function() {
    var returned = JSON.parse(JSON.stringify(this))
    delete returned['token']
    delete returned['pass']
    return returned
};

module.exports = mongoose.model('user', userSchema)
