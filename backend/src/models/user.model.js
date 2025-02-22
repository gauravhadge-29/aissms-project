import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { strict } from "assert";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            trim: true,
            index: true,
            required:true
        },
        password: {
            type: String,
            required: function () {
                return this.provider === "local"; // Password required only for local users
            },
            select: false, // Do not return password by default
        },
        avatar: {
            type: String, // Cloudinary URL
        },
        refreshToken: {
            type: String,
            select: false, // Do not return refreshToken by default
        },
        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
    },
    {
        timestamps: true,
    },{
        strict: false
    }
);

// 🔹 Hash password before saving (Only for Local users)
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || this.provider === "google") return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// 🔹 Check if password is correct
// 🔹 Check if password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    console.log("Password entered:", password);  // Log the entered password
    console.log("Stored password in DB:", this.password);
    if (this.provider === "google") return true; // No password for Google users
    return await bcrypt.compare(password, this.password);
};


// 🔹 Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// 🔹 Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
