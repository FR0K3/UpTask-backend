const debug = require('debug')('uptask:db')
const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.set('strictQuery', true); // Deprecating warning fix
    
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const url = `${connection.connection.host}:${connection.connection.port}`;
        debug('MongoDB connected at: ' + url);
    } catch (error) {
        debug(`error: ${error.message}`);
        process.exit(1);
    }
}

exports.connectDB = connectDB;