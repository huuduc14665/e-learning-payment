//VALIDATION
const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

exports.validation = (schema, property) => { 
    return (req, res, next) => { 
    const { error } = schema.validate(req.body); 
    const valid = error == null; 
    
    if (valid) { 
      next(); 
    } else { 
      const { details } = error; 
      const errorMessage = details.map(i => i.message).join(',');
   
     res.status(200).json({ message: errorMessage  }) } 
    } 
  } 

exports.areParamsValidObjectIdCasting = function()  {
  return [
    (req, res, next) => {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(200).json({message: "Provided id is not a valid ObjectId"});
      }
      next()
    }
  ]
}