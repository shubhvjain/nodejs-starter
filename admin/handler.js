let index = (req, res, next) => {
    res.success({ msg: "Admin API", ua: req.useragent["source"] })
}
module.exports.index = index

