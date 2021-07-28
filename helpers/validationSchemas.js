const Joi = require('@hapi/joi') 

exports.registerSchema= Joi.object().keys({ 
    email: Joi.string().min(6).required().email(),
    password: Joi.string().alphanum().min(8).max(50).required(),
    firstname: Joi.string().max(20).required(),
    lastname: Joi.string().max(20).required(),
    birthday: Joi.date().iso(), //need to be in ISO 8601 format
}) 
// exports.schemas = (data) => {
//     const schema = Joi.object({
//         email: Joi.string().min(6).required().email(),
//         password: Joi.string().alphanum().min(8).max(50).required(),
//         firstname: Joi.string().max(20).required(),
//         lastname: Joi.string().max(20).required(),
//         birthday: Joi.date().iso(), //need to be in ISO 8601 format
//         role: Joi.string().required
//     });
//     return schema.validate(data);
// ;}

