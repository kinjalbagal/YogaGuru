const connection = require("../db/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Rendering Signup Page
function renderSignup(req, res) {
  res.render("signup");
}

// Cheking if User Exists of Not
function checkUser(req, res) {
  const param = [req.body.email];
  connection.query(
    `select * from users where email = ? `,
    param,
    (error, result) => {
      if (!error) {
        if (result == "") {
          return res.status(200).send({
            msg: "User Not Exists",
            error: false,
          });
        } else {
          return res.status(409).send({
            msg: "User Exists",
            error: true,
          });
        }
      } else {
        res.status(500).send(error);
      }
    }
  );
}


// Verifying Email
async function verifyEmail(req, res) {
  try {
    console.log(req.body);
    const email = req.body.email;
    const payload = {
      name: req.body.name,
      age: req.body.age,
      email: req.body.email,
      password: req.body.password,
      medical_condition: req.body.medical_condition,
      experience: req.body.experience,
      joining_date : req.body.joining_date
    };

    const token = jwt.sign(payload, process.env.JWTKEY, { expiresIn: "15m" });

    await sendMail(email, token);
    return res.status(200).send({
      token: token,
    });
  } catch (err) {
    console.log("Login Controller Error : ", err);
  }
}


// Sending Verification Mail
function sendMail(email, token) {
  try {
    const saltrounds = parseInt(process.env.SALTROUNDS);
    bcrypt.hash(token, saltrounds).then(function (hash) {
      hash = hash.toString()
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL,
          pass: process.env.PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL,
        to: email,
        subject: "Verification Code from Yoga Guru",
        html: `
            <html>
            <body>
            <h1>Verification Link<h1>
            <a href="http://localhost:3000/verified?id=${hash}" style="text-decoration:none;padding: 8px 12px;background:#fff;color:#2a7832">Click here</a>
            </body>
            <script>
            </script>
            </html>
            `,
      };

      transporter.sendMail(
        mailOptions,
        (result = (err, res) => {
          if (err) {
            const resp = {
              error: true,
              msg: err,
            };
            return resp;
          } else {
            const resp = {
              error: false,
              msg: "Ok",
            };
            return resp;
          }
        })
      );
      console.log("[ Verification Mail Send ] . . .");
    });
  } catch (err) {
    console.log(err);
  }
}

// User Verification from Verification Mail
function verified(req, res) {
  let hashedToken = req.query.id;
  const token = req.cookies.Temptoken;

  bcrypt.compare(token, hashedToken)
  .then(function(result) {
    if(result){
      jwt.verify(token, process.env.JWTKEY, async (err, decoded) => {
        if (err) {
          console.log(err);
          return res.status(401).redirect("/");
        }
        //console.log(decoded);
        res.cookie('User Data :',[decoded.name,decoded.age,decoded.medical_condition,decoded.experience,decoded.joining_date])
        await addUser(decoded);
        const payload = {
          name: decoded.name,
          email: decoded.email,
        }
        const token = jwt.sign(payload, process.env.JWTKEY, { expiresIn: "30d" });
        res.cookie("JWTtoken", token, {
          expires: new Date(Date.now() + 60 * 60 * 24 * 30),
        });
        return res.status(200).redirect("/dashboard");
      }); 
    }
  });
}


async function addUser(decoded) {
  //console.log(decoded);
  const data = [decoded.name,decoded.age,decoded.email,decoded.password,decoded.medical_condition,decoded.experience,decoded.joining_date,0,decoded.experience];
  //console.log(data);
  connection.query(`insert into users(name,age,email,password,medical_condition,experience,joining_date) values(?,?,?,?,?,?,?)`,data,(error, result) => {
      if (error) {
        return error;
      }
    }
  );
  const data1 = [decoded.email,0,decoded.medical_condition,decoded.experience]
  connection.query(`insert into userWorkoutDetails(email,noofdays,medical_condition,level) values(?,?,?,?)`,data1,(error, result) => {
    if (error) {
      return error;
    }
  }
);
}

module.exports = { renderSignup, checkUser, verifyEmail, verified };
