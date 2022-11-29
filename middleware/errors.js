function errorHandler(err, req, res, next) {

    //triple === because checking type of error returned
    if(typeof err === "String") {
        return res.status(400).json({message: err});
    }

    //returned from mongoDB schema => "ValidationError"
    if(typeof err === "ValidationError") {
        return res.status(400).json({message: err.message});
    }

    //returned from mongoDB schema => "UnauthorizedError"
    if(typeof err === "UnauthrizedError") {
        return res.status(401).json({message: err.message});
    }

    return res.status(500).json({message: err.message});
}

module.exports = {
    errorHandler
}