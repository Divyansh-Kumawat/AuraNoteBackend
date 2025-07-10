const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/inotebook"; // Add your DB name

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to Mongo Successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Stop the server if DB connection fails
    }
};

module.exports = connectToMongo;
