const asans_container = document.getElementById('asans-container');
let x = document.cookie;
let y = x.split('; User Data')
let z = y[1].split('%22');
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

let lvl = ''

if(det[6] == 'beginner' && det[5] < 15){
    lvl = 'Easy-1'
}
else if(det[6] == 'beginner' && det[5] >= 15){
    lvl = 'Easy-2'
}
else if(det[6] == 'intermediate' && det[5] < 15){
    lvl = 'Indermediate-1'
}
else if(det[6] == 'intermediate' && det[5] >= 15){
    lvl = 'Indermediate-2'
}
else if(det[6] == 'expert' && det[5] < 15){
    lvl = 'Expert-1'
}
else if(det[6] == 'expert' && det[5] >= 15){
    lvl = 'Expert-2'
}
console.log(lvl);
/* 
*/
fetch("/fetchAsans", {
    method: "POST",
    body: JSON.stringify({Level : lvl}),
    headers: {
        "Content-Type": "application/json",
    }, 
})        

.then(res => res.json())
.then(data => {
    let arr = []
    for(let i=0;i < data.length;i++){
        let div = document.createElement("div");
        div.classList.add('asan-box');
        let img = document.createElement("img");
        let div1 = document.createElement("div");
            img.src = 'assets/Asans/Easy/'+data[i].Asans+'.png';
            div1.innerHTML = data[i].Asans
            div.appendChild(img);
            div.appendChild(div1);
            asans_container.appendChild(div);
        arr.push(data[i].Asans)
    }
    var json_str = JSON.stringify(arr);
    document.cookie = `Asans = ${json_str}`;
})
