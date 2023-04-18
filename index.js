const express = require('express');
const app = express();
const port = 2002;
const path = require('path');
const env = require('dotenv');
const cookie_parser = require('cookie-parser')

env.config({
    path: './.env'
})

app.set('view engine', 'hbs')
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cookie_parser())

//define the routes --- this is the middleware
app.use('/', require('./routes/register_routes'));
app.use('/auth', require('./routes/auth.js'));
app.use('/', require('./routes/login_routes'));

app.listen(port, () => {
    console.log(`Server listening on ${port}`);
})
