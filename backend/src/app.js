import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: "http://localhost:5173", // Allows all origins
    credentials: true, // Allows cookies and authentication headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allows common HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allows these headers
  }));


  const corsOptions = {
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,  // Allow credentials (cookies)
  };

app.use(express.json({
    limit: "20kb"
}))
app.use(express.urlencoded({
    extended:true,
    limit:"20kb"
}))


app.use(express.static("public"))

app.use(cookieParser())


//routes import
import userRouter from "./routes/user.router.js"

//routes declaration
app.use("/api/v1/users",userRouter)


export {app}