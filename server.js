const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");


const corsOptions = {
    origin: true,
    credentials: true
};

app.use(express.json())
app.use(express.urlencoded({ extended: true })); // 배열을 받아오기 위함

app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: "baldwhale",
        cookie: {
            httpOnly: true,
            secure: false
        }
    })
);

app.use(cors(corsOptions));


app.listen(8080, () => {
    console.log("listening");
});
