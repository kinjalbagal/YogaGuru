const namee = getById("name");
const age = getById("age");
const email = getById("email");
const password = getById("password");
const med_condition = getById("med-condtion");
const experience = getById("experience");
const submitBtn = getById("signup-submit");
const error = document.getElementsByClassName("form-error")[0];

const closeBtn = document.getElementById("close");
const verificationWindow = document.getElementById("verification");
const signup_section = document.getElementById("signup-section");

var isName = false;
var isAge = false;
var isEmail = false;
var isPassword = false;

namee.addEventListener("change", namevalidate);
age.addEventListener("change", agevalidate);
email.addEventListener("change", emailvalidate);
password.addEventListener("change", passwordvalidate);
submitBtn.addEventListener("click", checkall);

// Name Validation
function namevalidate() {
  if (namee.value.length < 5) {
    error.innerText = "Name length should be greater than 5";
    isName = false;
  } else {
    error.innerText = ""
    isName = true;
  }
}

// Name Validation
function agevalidate() {
  if (age.value < 14) {
    error.innerText = "Age should be greater than 14";
    isAge = false;
  } else {
    error.innerText = ""
    isAge = true;
  }
}

// Password Validation
function passwordvalidate() {
  let isUpper = false;
  let isLower = false;
  let integer = false;
  let special = false;
  let specialChar = ["/", "\\", "+", "=", "@", "$"];
  let passwordVal = password.value;

  if (passwordVal.length > 7 && passwordVal.length < 16) {
    for (let i = 0; i < passwordVal.length; i++) {
      if (passwordVal[i] == parseInt(passwordVal[i])) {
        integer = true;
        continue;
      }
      for (x in specialChar) {
        if (specialChar[x] === passwordVal[i]) {
          special = true;
          continue;
        }
      }
      if (passwordVal[i] === passwordVal[i].toUpperCase()) {
        isUpper = true;
        continue;
      }
      if (passwordVal[i] == passwordVal[i].toLowerCase()) {
        isLower = true;
        continue;
      }
    }

    if ((((!isUpper == isLower) == integer) == special) == true) {
      isPassword = false;
      return (error.innerHTML =
        "Password Should Contain : Atleast 1 UpperCase , Atleast 1 LowerCase , Atleast 1 Number , Atleast 1 Special character");
    }
    error.innerHTML = "";
    isPassword = true;
  } else {
    isPassword = false;
    return (error.innerHTML =
      "Password : Password length should between 8 - 16");
  }
}


// Email Validation
function emailvalidate() {
  const emailVal = email.value;
  var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (emailVal.match(validRegex)) {
    error.innerHTML = "";
    return (isEmail = true);
  } else {
    isEmail = false;
    return (error.innerHTML = "Invalid email address!");
  }
}

// Verification
function checkall() {
  if ((((isName == isAge)== isPassword ) == isEmail) == true) {
    const name = namee.value;
    const emaill = email.value;
    const passwordd = password.value;
    const agee = age.value;
    const cond = med_condition.value;
    const exp = experience.value;
    const data = {
      name,
      age:agee,
      email: emaill,
      password: passwordd,
      medical_condition: cond,
      experience : exp
    };

    // Check if User Exists
    fetch("/checkUser", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((data) => {
      if (data.status == 200) {
        namee.value = "";
        age.value = "";
        email.value = "";
        password.value = "";
        verificationWindow.style.display = "flex";
        let today = new Date();
        let indianTime = today.toLocaleString("en-US", "Asia/Delhi");
        let tempDate = indianTime.split(',')
        let d = tempDate[0].split('/')
        let datee = `${d[2]}-${d[1]}-${d[0]}`
        // Sending Verfication Mail
        fetch("/verifyEmail", {
            method: "POST",
            body: JSON.stringify({name,age:agee,email : emaill,password : passwordd,medical_condition : cond,experience : exp,joining_date : datee}),
            headers: {
              "Content-Type": "application/json",
            }, 
        })        

        .then(res => res.json())
        .then(data => {
          const inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);
          document.cookie = `Temptoken=${data.token}; expires = ${inFifteenMinutes} )`;
        })

      } else if (data.status == 409) {
        error.innerHTML = 'User Exists , Try to Login'
      } else if (data.status == 500) {
        error.innerHTML = 'Something Went Wrong'
      } else {
        throw new Error(data.statusText);
      }
    });
  }
}

closeBtn.addEventListener("click", () => {
  verificationWindow.style.display = "none";
});

function getById(id) {
  return document.getElementById(id);
}
