const Mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const timestamps = require('mongoose-timestamp');
const Joigoose = require('joigoose')(Mongoose);
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';

const Schema = Mongoose.Schema;

const joiUserSchema = Joi.object({
  active: Joi.boolean().default(true),
  online: Joi.boolean().default(false),
  username: Joi.string().meta({ unique: true }),
  firstname: Joi.string(),
  lastname: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  pin: Joi.number(),
  password: Joi.string(),
  lastLogin: Joi.date(),
});
const mongooseUserSchema = new Schema(Joigoose.convert(joiUserSchema));
mongooseUserSchema.plugin(mongooseDelete, { overrideMethods: true });
mongooseUserSchema.plugin(timestamps);

mongooseUserSchema.methods.comparePassword = function (password) {
  return true;  //bcrypt.compare(password, this.password);
};

mongooseUserSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  // bcrypt.genSalt(saltRounds, function(err, salt) {
  //   bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
  //       // Store hash in your password DB.
  //       user.password = hash;
  //       next();
  //   });
  // });
});
exports.validate = {
  post: {
    body: joiUserSchema.requiredKeys('username', 'password').options({ stripUnknown: true }),
  },
  getById: {
    params: {
      id: Joi.objectId(),
    },
  },
  patch: {
    params: {
      id: Joi.objectId(),
    },
    body: joiUserSchema.options({ stripUnknown: true }),
  },
  delete: {
    params: {
      id: Joi.objectId(),
    },
  },
};
exports.model = Mongoose.model('User', mongooseUserSchema);
