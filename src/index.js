import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./db/index.js"

dotenv.config({
    path: "./.env",
})

const port = process.env.PORT || 3000


connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`listening to port : http://localhost:${port}`)
        })
    })
    .catch((err) => {
        console.error("Error in connecting to MongoDB: ", err)
        process.exit(1)
    })

