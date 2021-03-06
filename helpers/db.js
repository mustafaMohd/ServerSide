const config = require('../Config/config.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect(config.connectionString,{ useNewUrlParser: true ,useUnifiedTopology: true}).then(
    () => { 
        console.log(`connected to DB with String ${config.connectionString}` )
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ 
},
      ).catch((err) => {
    console.log("Not Connected to Database ERROR! ", err);
});

module.exports = {
    User: require('../_models/user.model'),
    
};