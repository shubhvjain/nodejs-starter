var express = require('express');
var router = express.Router();
var handler = require('./handler');

router.get('/',handler.index);

module.exports = router;