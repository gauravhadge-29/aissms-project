import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import session from "express-session";
import MongoStore from "connect-mongo";


const app = express()
app.use(
    session({
        secret: process.env.SESSION_SECRET, // Store this in .env
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI, // Your MongoDB connection string
            collectionName: "sessions",
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);
app.use(cors({
  origin: "https://data-discovery-login.onrender.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(express.json({
    limit: "20kb"
}))
app.use(express.urlencoded({
    extended:true,
    limit:"20kb"
}))


app.use(express.static("public"))

app.use(cookieParser())

app.use((req, res, next) => {
    console.log("Cookies Sent:", req.headers.cookie);
    console.log("Session Data:", req.session);
    next();
  });
  
//routes import
import userRouter from "./routes/user.router.js"

//routes declaration
app.use("/api/v1/users",userRouter)


export {app}