const connection = require("../db/db");
const jwt = require("jsonwebtoken");


// Rendering Login Page
function renderLogin(req, res) {
    res.render("login");
}

// Checking User Details & Redirecting to Dashboard
function login(req, res) {
    const data = req.body;
    const param = [data.email];

    // Finding Email in Databsae
    connection.query(
        "select * from users where email = ?",
        param,
        (error, result) => {
            if (error) {
                return res.render("error", {
                    status: 500,
                    msg: error,
                });
            }

            if (result.length < 1) {
                return res.render("error", {
                    status: 404,
                    msg: "User Not Found",
                });
            }

            // If All Details are Correct
            if (
                result[0].email == data.Email &&
                result[0].password == data.Password
            ) {
                const payload = {
                    name: result[0].name,
                    email: result[0].email,
                };

                const token = jwt.sign(payload, process.env.JWTKEY, {
                    expiresIn: "30d",
                });

                res.cookie("JWTtoken", token, {
                    expires: new Date(Date.now() + 60 * 60 * 24 * 30),
                });
                connection.query(
                    "select * from userWorkoutDetails where email = ?",
                    param,
                    (errorr, resultt) => {
                        if (errorr) {
                            return res.render("error", {
                                status: 500,
                                msg: errorr,
                            });
                        }
                        
                        res.cookie("User Data :", [
                            result[0].Name,
                            result[0].Email,
                            result[0].Medical_Condition,
                            result[0].Experience,
                            result[0].joining_date,
                            resultt[0].NoOfDays,
                            resultt[0].Level,
                        ])
                        return res.status(200).redirect("/home");
                    }
                );
            } else if (
                result[0].email == data.Email &&
                result[0].password != data.Password
            ) {
                return res.render("error", {
                    status: 401,
                    msg: "Invalid Credentials",
                });
            }
        }
    );
}

module.exports = { renderLogin, login };
