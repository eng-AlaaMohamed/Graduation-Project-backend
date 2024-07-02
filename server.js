const connectToDb = require('./config/connectToDb');
const express = require('express');
const cors = require('cors')
require('dotenv').config();

//Connection to Db
connectToDb();

//Init App
const app = express();

//Middleweres
app.use(express.json()); //To read json files entered by the user

//Corse Policy
app.use(cors({
    origin: 'http://localhost:3000',
}));

//Routes
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/users', require('./routes/usersRoute'));
app.use('/api/projects', require('./routes/projectsRoute'));
app.use('/api/categories', require('./routes/categoriesRout'));
app.use('/api/applicants', require('./routes/applicantsRout'));
app.use('/api/portfolio', require('./routes/portfolioRout'));
app.use('/api/password', require('./routes/passwordRout'));

//Ranning the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, (req,res) => {
    // console.log(`Server is ranning in ${process.env.NODE_ENV} mode in port ${process.env.PORT}`);
    res.status(200).json({ message: `Server is ranning in ${process.env.NODE_ENV} mode in port ${process.env.PORT}` });
})