module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        // custom application error
        console.log(err);
        return res.status(200).json({ message: err });
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({ message: 'Invalid Token' });
    }
    if (err.name === 'MongoError') {
        if (err.code === 11000) {
            return res.status(200).json({message: 'Email is already exist'})
        }
    }

    // default to 500 server error
    console.log(err);
    return res.status(200).json({ message: err.message });
}