const dashboard_name = getById('dashboard-name')
const email_span = getById('email-span');
const med_cond_span = getById('med-cond-span');
const exp_span = getById('exp-span');
const level_span = getById('level-span');
const joining_span = getById('joining-span');
const complete_span = getById('complete-span');

let x = document.cookie;
let y = x.split('; User Data')
let z = y[1].split('%22');
console.log(z);
let det = []
const idx = [1,3,5,7,9,10,11]
for (let i = 0; i < idx.length;i++){
    if(i == 4){
        det.push(z[idx[i]].slice(0,10))
    }
    else if(i == 5){
        det.push(unescape(z[idx[i]]).slice(1,2))
    }
    else{
        det.push(unescape(z[idx[i]]))
    }
}
console.log(det)

dashboard_name.innerHTML = det[0]
email_span.innerHTML = det[1]
med_cond_span.innerHTML = det[2]
exp_span.innerHTML = det[3]
level_span.innerHTML = det[6]
joining_span.innerHTML = det[4]
complete_span.innerHTML = det[5]


function getById(id) {
    return document.getElementById(id);
}