const router = require('express').Router();

router.use('/users', require('./auth'));
router.use('/users', require('./user'));

router.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({error: err.message})
  }
  return next(err);
});

module.exports = router;