import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import https from "https";
import dotenv from "dotenv";
import passport from "passport";

import apiRouter from "./api";
import authRouter from "./auth";
import setJwtStrategy from "./auth/jwtstrategy";
import cors from "cors";

dotenv.config();

let dbUrl = 'mongodb+srv://student:i295Anz59j94lTIE@cluster0.n9t74.gcp.mongodb.net/GroupMongooseDB?retryWrites=true&w=majority'; 
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
};
mongoose.connect(dbUrl, dbOptions)
    .then(() => {
        try {
            console.log("DB connected");

            const server = express();
            server.use(cors());

            server.use(express.urlencoded({ extended: false }));
            server.use(express.json());

            server.use(passport.initialize());
            setJwtStrategy(passport);

            server.use("/api", apiRouter);
            server.use("/auth", authRouter);

            server.use((req, res, next) => {
                if (req.header('x-forwarded-proto') !== 'https')
                    res.redirect(`https://${req.header('host')}${req.url}`);
                else
                    next();
            });

            const httpsOptions = {
                key: fs.readFileSync('./secret/key.pem'),
                cert: fs.readFileSync('./secret/cert.pem'),
                //ca: fs.readFileSync("./secret/rootCA.pem")
            };

            const httpsServer = https.createServer(httpsOptions, server);
            httpsServer.listen(3443);
            console.log("https://localhost:3443");
            server.listen(3000);
            console.log("http://localhost:3000");

        } catch (e) {
            console.error(e);
        }
    })
    .catch(error => {
        console.error(error);
    });