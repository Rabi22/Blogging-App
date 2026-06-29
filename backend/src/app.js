import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoute from "./routes/auth.route.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, ".env") })
const app = express()
app.use(express.json())
app.use(cookieParser())

/**
 * @name CORSConfig
 */

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))


/**
 * @name Routes
 */

app.use("/api/auth", authRoute)

/**
 * @name MongoDBConnect
 */


async function connectDB(){
    try {
        await mongoose.connect(process.env.mongodb_url);
        console.log("Connected to DB")
    } catch (error) {
        console.log(error)
    }
}

connectDB()

// Server

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

export default app;