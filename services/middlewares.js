let responseHandler = (req, res, next) => {
    // adds a new function in res, which will handle success
    res.success = (data) => {
        res.json({
            success: true,
            data: data
        });
    };
    res.error = (err, code, message) => {
        if (err) {
            next(err); //passing the error to the error handler
        } else {
            next(Error(code + "#@#" + message));
        }
    }
    next();
}
module.exports.responseHandler = responseHandler;


let enableCORS = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,fields,user-access-token");
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE,GET")
        return res.status(200).json({});
    }
    next();
}
module.exports.enableCORS = enableCORS;


let appErrorHandler = (err, req, res, next) => {
    // error handler
    // set locals, only providing error in development
    console.error(err)
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    let errObj = {};
    let errorArr = err.message.split("#@#");
    console.log("----Error----")
    console.log(errorArr);
    console.log("--------")
    //console.log(errorArr);
    if (errorArr.length == 1) {
        errObj = {
            success: false,
            error: {
                code: 'error',
                message: err.message
            }
        }
    } else {
        if (errorArr[0] == 'internalError') {
            logit.error('Internal error occured - ' + errorArr.join(" "));
            // log the error
            //console.log('internal error occured. Error =  ' + err.message);
            errObj = {
                success: false,
                error: {
                    code: "internalError",
                    message: "We encountered some unexpected error. We have logged it and are working on it. Please try again later."
                }
            }
        } else {
            errObj = {
                success: false,
                error: {
                    code: errorArr[0],
                    message: errorArr[1]
                }
            }
        }
    }
    res.status(err.status || 500);
    res.json(errObj);
}
module.exports.appErrorHandler = appErrorHandler;