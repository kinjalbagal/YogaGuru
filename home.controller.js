const connection = require("../db/db");

function renderHome(req, res) {
    res.render("home");
}

function fetchAsans(req, res){
    const param = [req.body.Level];
    connection.query(
        "select * from asans where Level = ?",
        param,
        (errorr, result) => {
            if (errorr) {
                return res.status(404).send({
                    status: 500,
                    msg: errorr,
                });
            }
            console.log(result);
            return res.status(200).send(result);
        }
    );
}

module.exports = {renderHome,fetchAsans};
