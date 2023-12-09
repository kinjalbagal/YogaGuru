const router = require("express").Router();
const {
  renderSignup,
  checkUser,
  verifyEmail,
  verified,
} = require("../controller/signup.controller");
const { renderLogin, login } = require("../controller/login.controller.js");
const {renderHome,fetchAsans} = require("../controller/home.controller.js");
const { renderDashboard } = require("../controller/dashboard.controller");
const renderTask = require("../controller/task.controller");
const renderTest = require("../controller/test.controller");
const renderContact = require("../controller/contact.controller");
const renderAbout = require("../controller/about.controller");
const { isAuth } = require("../middlewear/jwtMiddlewear");

router.get("/", (req, res) => {
  const token = req.cookies.JWTtoken;

  if (token) {
    return res.redirect("/home");
  }
  res.render("index");
});

router.get("/signup", renderSignup);
router.post("/checkUser", checkUser);
router.post("/verifyEmail", verifyEmail);
router.get("/verified", verified);

router.get("/login", renderLogin);
router.post("/login", login);

router.get("/home", isAuth, renderHome);
router.post("/fetchAsans", isAuth, fetchAsans);

router.get("/dashboard", isAuth, renderDashboard);

router.get("/task", isAuth, renderTask);

router.get("/test", isAuth, renderTest);

router.get("/about", isAuth, renderAbout);

router.get("/contact", isAuth, renderContact);

router.get("/something", (req,res) =>{
  res.render("something")
})

router.get("/logout", (req, res) => {
  res.clearCookie("JWTtoken");
  res.clearCookie("User Data :");
  res.redirect("/");
});

/* 
function getExtension(fileName) {
  for (let i = fileName.length; i >= 0; i--) {
    if (fileName[i] == ".") {
      return {
        ext: fileName.slice(i, fileName.length),
        name: fileName.slice(0, i),
      };
    }
  }
}
*/

module.exports = router;
