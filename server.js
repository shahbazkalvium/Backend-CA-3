const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");

require("dotenv").config();

app.use(cookieParser());
app.use(express.json());

const port = process.env.port;

app.listen(8080, async () => {
  console.log(`Server is running on ${port}`);
});

let User = [
    { userName:"admin",password:"password123" },
];

app.get("/User",(req,res)=>{
    res.send(User)
})
app.post("/login", async (req, res) => {
  try {
    console.log("1");
    const { userName, password } = req.body;
    if (!userName || !password)
      return res.status(400).send({ message: "Invalid credentials" });

    let newUser = await User.findOne({ userName: userName });
    if (newUser) {
      const match = await bcrypt.compare(password, newUser.password);
      if (!match) return res.status(401).send({ message: "Invalid Password" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      newUser = await User.create({ userName, password: hashedPassword });
    }
    console.log("2");

    const loginToken = jwt.sign(
      { userId: newUser._id },
      process.env.LOGIN_TOKEN_SECRET,
      { expiresIn: "10m" }
    );
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", accessToken, { httpOnly: true });
    res.cookie("logintoken", loginToken, { httpOnly: true });

    return res
      .status(200)
      .send({ message: "Generated access and login token sucessfully" });
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: err.message });
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    const loginToken = req.cookies.loginToken
    if (!loginToken) return res.sendStatus(400);
    jwt.verify(
      refreshToken,
      process.env.LOGIN_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(401).send({ error: err });
        }

        const accessToken = jwt.sign(
          { userId: decoded.userId },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "10m" }
        );
        res.cookie("accessToken", accessToken, { httpOnly: true });
      }
    );
    return res.status(200).send({ message: "Welcome to your Dashboard" });
  } catch (er) {
    return res
      .status(401)
      .send({ message: "Unauthorized", error: er.message});
}
});
