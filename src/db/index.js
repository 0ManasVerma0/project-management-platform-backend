import mongoose from "mongoose"

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongo DB is connected succesfully")
    } catch (error) {
        console.log("Erron connecting to mongo: ", error)
        process.exit(1)
    }
}

export default connectDB;