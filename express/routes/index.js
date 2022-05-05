const router = require('express').Router();

router.use('/api', require('./api'));
router.use('/', require('./user'));
router.use('/', require('./auth'));

module.exports = router;