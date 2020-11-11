let index = (req, res, next) => {
  res.success({msg: "User API",ua : req.useragent["source"]})
}
module.exports.index = index