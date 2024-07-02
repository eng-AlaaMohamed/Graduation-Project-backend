const mongoose = require('mongoose');

module.exports = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('connected to mongoDB ^_^');
    } catch (error) {
        console.log('connection falid to mongoDB', error);
    }
};