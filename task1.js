function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded .split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
}

let cook = JSON.parse(getCookie('Asans')) 
//console.log('cook :',cook);
const message = document.querySelector("#message")
const numbers = document.querySelector("#numbers")
const video = document.getElementById("video")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const audio = document.getElementById("audio")
var timeElm = document.getElementById('timer');
const cur = document.querySelector("#cur");
// var learn = document.getElementById("learn").src;
var id = 1;
var x = 0;
var curr_pose;

/* 

var paused // is the clock paused?
var time_left; // time left on the clock when paused
var timeinterval;

var time_in_minutes
var current_time
var deadline


function time_remaining(endtime){
    var t = Date.parse(endtime) - Date.parse(new Date());
	var seconds = Math.floor( (t/1000) % 60 );
	var minutes = Math.floor( (t/1000/60) % 60 );
	var hours = Math.floor( (t/(1000*60*60)) % 24 );
	var days = Math.floor( t/(1000*60*60*24) );
	return {'total':t, 'days':days, 'hours':hours, 'minutes':minutes, 'seconds':seconds};
}


function run_clock(id,endtime){
    // var clock = document.getElementById(id);
	function update_clock(){
        var t = time_remaining(endtime);
		id.innerHTML = t.seconds + ' s';
		if(t.total<=0){ clearInterval(timeinterval); }
        if(paused == true){pause_clock()}
        else{resume_clock()}
	}
	update_clock(); // run function once at first to avoid delay
	timeinterval = setInterval(update_clock,1000);
}

function pause_clock(){
    if(!paused){
        console.log(paused);
		paused = true;
		clearInterval(timeinterval); // stop the clock
		time_left = time_remaining(deadline).total; // preserve remaining time
	}
}

function resume_clock(){
    if(paused){
        console.log(paused);
        paused = false;
        
		// update the deadline to preserve the amount of time remaining
		deadline = new Date(Date.parse(new Date()) + time_left);
        
		// start the clock
		run_clock('clockdiv',deadline);
	}
}

function startTimer(){
    // paused = false;
    time_in_minutes = 0.25;
    current_time = Date.parse(new Date());
    deadline = new Date(current_time + time_in_minutes*60*1000);
    run_clock(timeElm,deadline);
}
*/

audio.pause();
/* 
function play() {
    if (audio.paused) {
        audio.currentTime = 0
        audio.play();
    }
    else {
        audio.play()
    }
}
*/

timer = setInterval(() => {
    if (audio.paused) {
        x = 0;
    }
    ++x;
    console.log(x);
    timeElm.innerHTML = `${x-1} s`
}, 1000);

let poses = []
let poseNet
let neuralNetwork


function startApp(){
    ctx.strokeStyle = 'red';
    ctx.fillStyle = "red";
    ctx.lineWidth = 3;
    ctx.translate(640, 0);
    ctx.scale(-1, 1)

    initWebcam()
    
    neuralNetwork = ml5.neuralNetwork({ task: 'classification' })

    const modelInfo = {
        model: 'model/model.json',
        metadata: 'model/model_meta.json',
        weights: 'model/model.weights.bin',
    }

    neuralNetwork.load(modelInfo, yogaModelLoaded)
}

function yogaModelLoaded() {
    message.innerHTML = "Yoga model loaded"
    poseNet = ml5.poseNet(video, "single", poseModelReady)
    poseNet.on("pose", gotPoses)
    drawCameraAndPoses()
}

function poseModelReady() {
    message.innerHTML = "Pose model loaded"
    poseNet.singlePose(video)
}

function gotPoses(results) {
    poses = results
    //console.log(poses);
}

function initWebcam() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            video.srcObject = stream
            video.play()

            let stream_settings = stream.getVideoTracks()[0].getSettings()
            console.log('Width: ' + stream_settings.width)
            console.log('Height: ' + stream_settings.height)
        })
    }
}

function drawCameraAndPoses() {
    ctx.drawImage(video, 0, 0, 640, 480) // 640 x 360 or 640 x 480
    drawKeypoints()
    drawSkeleton()
    classifyKeyPoints()
    window.requestAnimationFrame(drawCameraAndPoses)
}

function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i += 1) {
        // For each pose detected, loop through all the keypoints
        for (let j = 0; j < poses[i].pose.keypoints.length; j += 1) {
            let keypoint = poses[i].pose.keypoints[j]
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.3) {
                ctx.beginPath()
                ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI)
                ctx.stroke()
            }
        }
    }
}

function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i += 1) {
        // For every skeleton, loop through all body connections
        for (let j = 0; j < poses[i].skeleton.length; j += 1) {
            let partA = poses[i].skeleton[j][0]
            let partB = poses[i].skeleton[j][1]
            ctx.beginPath()
            ctx.moveTo(partA.position.x, partA.position.y)
            ctx.lineTo(partB.position.x, partB.position.y)
            ctx.stroke()
        }
    }
}

function classifyKeyPoints(){
if(poses.length > 0) {
    let points = []
    for (let keypoint of poses[0].pose.keypoints) {
        points.push(Math.round(keypoint.position.x))
        points.push(Math.round(keypoint.position.y))
    }
    numbers.innerHTML = points.toString()
    neuralNetwork.classify(points, yogaResult)
}
}
function sleep(miliseconds) {
    var currentTime = new Date().getTime();
 
    while (currentTime + miliseconds >= new Date().getTime()) {
    }
 }
function yogaResult(error, result) {
    if (error){console.error(error)}
    //console.log(result[0].label + " confidence:" + result[0].confidence.toFixed(2))
    // message.innerHTML = `Pose: "${result[0].label}" --- confidence: ${result[0].confidence.toFixed(2)}`
    console.log(result);
    if (id == 5) {
        cur.innerHTML = 'tree';
        // document.getElementById(learn).src = 'https://youtu.be/sxymAjTuUx0';
        learn ="https://www.youtube.com/embed/sxymAjTuUx0"
        if (result[0].label == 'tree' && result[0].confidence > 0.72) {
            message.innerHTML = `${result[0].confidence}`;
            timer;
            play();
        }
        else {
            message.innerHTML = 'NONEEE';
            audio.pause();
        }
    }
    else if (id == 1) {
        cur.innerHTML = 'goddess';
        let output = map(result[0].confidence)
        if (result[id].label == 'goddess' && result[0].confidence > 0.90) {
            message.innerHTML = output.toFixed(2)+' %';
            // message.innerHTML = `${result[0].confidence}`;
            // timer;
            message.style.background = '#7be885'
            message.style.color = '#2a7832'
            /* 
            paused = false;
            resume_clock()
            */
            play();
        }
        else {
            message.style.background = 'red'
            message.style.color = '#fff'
            message.innerHTML = output.toFixed(2)+' %';
            /* paused = true;
            pause_clock() */
            audio.pause();
        }
    }
    else if (id == 2) {
        cur.innerHTML = 'downdog';
        if (result[0].label == 'downdog' && result[0].confidence > 0.90) {
            message.innerHTML = `${result[0].confidence}`;
            timer;
            play();
        }
        else {
            message.innerHTML = 'NONEEE';
            audio.pause();
    }
    }
    else if (id == 4) {
        cur.innerHTML = 'warrior2';
        if (result[0].label == 'warrior2' && result[0].confidence > 0.90) {
            message.innerHTML = `${result[0].confidence}`;
            timer;
            play();
        }
        else {
            message.innerHTML = 'NONEEE';
            audio.pause();
    }
    }
    else if (id == 3) {
        cur.innerHTML = 'plank';
        if (result[0].label == 'plank' && result[0].confidence > 0.90) {
            message.innerHTML = `${result[0].confidence}`;
            timer;
            play();
        }
        else {
            message.innerHTML = 'NONEEE';
            audio.pause();
    }
    }
    sleep(100)
    // console.log(id)
    // console.log(result[0].confidence)
}


function setId() {
    globalThis.id = id + 1;
    if (id == 3) {
        document.getElementById("learn").src = "https://www.youtube.com/embed/Fcbw82ykBvY"
    }
    if (id == 4) {
        document.getElementById("learn").src = "https://www.youtube.com/embed/YSjBJDkA6zg"
    }
    if (id == 5) {
        document.getElementById("learn").src = "https://www.youtube.com/embed/sxymAjTuUx0"
    }
    if (id == 2) {
        document.getElementById("learn").src="https://www.youtube.com/embed/ahBd-oI76Zs"
    }
}

function map (value) {
    oldRange = [0,1]
    newRange = [0,100]
    var newValue = (value - oldRange[0]) * (newRange[1] - newRange[0]) / (oldRange[1] - oldRange[0]) + newRange[0];
    return Math.min(Math.max(newValue, newRange[0]) , newRange[1]);
}



/* // handle pause and resume button clicks
document.getElementById('pause').onclick = pause_clock;
document.getElementById('resume').onclick = resume_clock; */

startApp()
startTimer()