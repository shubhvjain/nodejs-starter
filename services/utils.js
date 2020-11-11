// error generator , to be used in services and models
let genError = (code, message, other) => {
    if (!other) {
        other = " ";
    }
    return new Error(code + "#@#" + message + "#@#" + other);
}
module.exports.genError = genError;


let inspectJSON = (input, config) => {
    // to inspect a json , config can take - requiredFields(array), validFields(array),acceptBlank(boolean)
    //return new Promise(function (resolve, reject) {
    if (config.requiredFields) {
        let allReqFields = true;
        let reqFieldMissing = [];
        config.requiredFields.forEach((element) => {
            // loop throught all required fields to check wheter they exist in the JSON or not
            if (!input[element]) {
                allReqFields = false;
                reqFieldMissing.push("" + element);
            }
        });
        if (!allReqFields) {
            // some required fields are missing
            throw genError('validationError', "Required field(s) - " + reqFieldMissing);
        }
    }
    let varfields = config.validFields;
    let invalid = false, ifields = "";

    // check if input is blank, error if blank
    if (!input || Object.keys(input).length <= 0) {
        if (config.acceptBlank == true) {
            return 
        } else {
            throw genError("jsonEmpty", "Input is empty");
        }
    }

    Object.keys(input).forEach(function (key) {
        if (input[key].length == 0) {
            invalid = true;
            ifields += key + " , ";
        }
        else if (!varfields.includes(key)) {
            invalid = true;
            ifields += key + " , ";
        }
    });
    // if invalid flag is set, some invalid fields exists in the json
    if (invalid) {
        throw genError('validationError', "Invalid fields - " + ifields + " Valid fields -  " + config.validFields);
    } else {
        return ;
    }
    //});
}
module.exports.inspectJSON = inspectJSON;
