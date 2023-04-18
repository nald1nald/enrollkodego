const express = require('express');
const router = express.Router();

router.get('/register', (req, res) => { // http://localhost:2002/register
    res.render('register')
});



module.exports = router;
