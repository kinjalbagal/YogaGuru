const message = document.querySelector("#message");
const numbers = document.querySelector("#numbers");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const audio = document.getElementById("audio");
const timeElm = document.getElementById("timer");
const notice = document.getElementById("notice");
const nextBtn = document.getElementById("next-btn");
const poseName = document.getElementById("pose-name");

let timeRemaining = parseInt(timeElm.innerHTML);
let timer;
var fullBody = false;
var tempFlag = false;
var conf;
var temp = [];
/* audio.pause();

function play() {
  if (audio.paused) {
    audio.currentTime = 0;
    audio.play();
  } else {
    audio.play();
  }
}
 */
let poses = [];
let poseNet;
let neuralNetwork;
let pauseTime;

timer = setInterval(function() {
  timeRemaining--;
  // console.log(`Time remaining: ${timeRemaining} seconds`);
  if (timeRemaining === 0) {
    console.log("Stop!");
    clearInterval(timer);
  }
}, 1000);

// Pause or resume the timer based on the value of the flag
let interval = setInterval(function() {
  if (pauseTime) {
    clearInterval(timer);
    console.log("Timer paused.");
  } else if (!pauseTime && !timer) {
    timer = setInterval(function() {
      timeRemaining--;
      console.log(`Time remaining: ${timeRemaining} seconds`);
      if (timeRemaining === 0) {
        console.log("Stop!");
        clearInterval(timer);
      }
    }, 1000);
    console.log("Timer resumed.");
  }
}, 1000);
/* 
// Function to start the timer
function startTimer() {
  // Decrement the time remaining by 1 second
  timeRemaining--;
  console.log(timeRemaining);
  // Update the timer display
  document.getElementById("timer").textContent = timeRemaining;
  // Check if the time is up
  if (timeRemaining <= 0) {
    clearInterval(timer);
    // Do something when the time is up
    // alert("Time's up!");
  }
}

function pauseTimer() {
  clearInterval(timer);
}

// Function to resume the timer
function resumeTimer() {
  // Call the startTimer function every second
  timer = setInterval(startTimer, 1000);
}
*/

/* let timer = function (x) {
  if (x === 30) {
    timeElm.innerHTML = "DONEEE";
  }
  timeElm.innerHTML = x;
  return setTimeout(() => {
    timer(++x);
  }, 1000);
};
 */
function startApp() {
  ctx.strokeStyle = "red";
  ctx.fillStyle = "red";
  ctx.lineWidth = 3;
  ctx.translate(640, 0);
  ctx.scale(-1, 1);

  initWebcam();

  neuralNetwork = ml5.neuralNetwork({ task: "classification" });

  const modelInfo = {
    model: "model/beginner/model.json",
    metadata: "model/beginner/model_meta.json",
    weights: "model/beginner/model.weights.bin",
  };

  neuralNetwork.load(modelInfo, yogaModelLoaded);
}

function yogaModelLoaded() {
  message.innerHTML = "Yoga model loaded";
  poseNet = ml5.poseNet(video, "single", poseModelReady);
  poseNet.on("pose", gotPoses);
  drawCameraAndPoses();
}

function poseModelReady() {
  message.innerHTML = "Pose model loaded";
  poseNet.singlePose(video);
}

function gotPoses(results) {
  poses = results;
  // console.log(poses)
  conf = poses[0].pose.score;
  temp = poses[0].pose.keypoints;
  //   console.log(poses);
  //   flag = false;

/*   for (let i = 0; i < temp.length; i++) {
    if (temp[i].score < 0.5) {
      notice.innerHTML = "Get your Full Body in Frame";
      tempFlag = false;
    } else {
      notice.innerHTML = "";
      tempFlag = true;
    }
  }
  fullBody = tempFlag
  if (!fullBody) {
    message.innerHTML = 0;
  } else {
  message.innerHTML = Math.round(conf * 100);
} */
// message.innerHTML = Math.round(conf * 100);
}

function initWebcam() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.play();
      let stream_settings = stream.getVideoTracks()[0].getSettings();
      console.log("Width: " + stream_settings.width);
      console.log("Height: " + stream_settings.height);
    });
  }
}

function drawCameraAndPoses() {
  ctx.drawImage(video, 0, 0, 640, 480); // 640 x 360 or 640 x 480
  drawKeypoints();
  drawSkeleton();
  classifyKeyPoints();
  window.requestAnimationFrame(drawCameraAndPoses);
}

function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j += 1) {
      let keypoint = poses[i].pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  }
}

function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    // For every skeleton, loop through all body connections
    for (let j = 0; j < poses[i].skeleton.length; j += 1) {
      let partA = poses[i].skeleton[j][0];
      let partB = poses[i].skeleton[j][1];
      ctx.beginPath();
      ctx.moveTo(partA.position.x, partA.position.y);
      ctx.lineTo(partB.position.x, partB.position.y);
      ctx.stroke();
    }
  }
}

function classifyKeyPoints() {
  if (poses.length > 0) {
    let points = [];
    for (let keypoint of poses[0].pose.keypoints) {
      points.push(Math.round(keypoint.position.x));
      points.push(Math.round(keypoint.position.y));
    }
    numbers.innerHTML = points.toString();
    neuralNetwork.classify(points, yogaResult);
  }
}

const id = 1;
function yogaResult(error, result) {
  if (error) console.error(error);
  //console.log(result[0].label + " confidence:" + result[0].confidence.toFixed(2))
  // message.innerHTML = `Pose: "${result[0].label}" --- confidence: ${result[0].confidence.toFixed(2)}`
  console.log('res :',result  );
    if (id == 1) {
      if (result[0].label == "goddess" && result[0].confidence > 0.9) {
        //   message.innerHTML = "goddess";
        // resumeTimer();
        // play();
        pauseTime = false;
      } else {
        message.style.color = "red";
        pauseTime = true;
        // pauseTimer();
      }
      poseName.innerHTML = "goddess";
    } else if (id == 2) {
      if (result[0].label == "downdog" && result[0].confidence > 0.8) {
        //   message.innerHTML = "downdog";
        message.style.color = "red";

        // play();
      } else {
        //   message.innerHTML = "NONEEE";
        message.style.color = "red";
        // audio.pause();
      }
      poseName.innerHTML = "downdog";
    } else if (id == 3) {
      if (result[0].label == "warrior2" && result[0].confidence > 0.83) {
        //   message.innerHTML = "warrior2";
        // play();
      } else {
        //   message.innerHTML = "NONEEE";
        message.style.color = "red";
        // audio.pause();
      }
      poseName.innerHTML = "warrior2";
    } else if (id == 4) {
      if (result[0].label == "plank" && result[0].confidence > 0.9) {
        //   message.innerHTML = "plank";
        // play();
      } else {
        //   message.innerHTML = "NONEEE";
        message.style.color = "red";
        // audio.pause();
      }
      poseName.innerHTML = "plank";
    }
    if (id == 5) {
      if (result[0].label == "tree" && result[0].confidence > 0.9) {
        //   message.innerHTML = "tree";
        // play();
      } else {
        //   message.innerHTML = "NONEEE";
        message.style.color = "red";
        // audio.pause();
      }
      poseName.innerHTML = "tree";
    } else if (id == 6) {
      if (result[0].label == "garland" && result[0].confidence > 0.7) {
        //   message.innerHTML = "garland";
        // play();
      } else {
        //   message.innerHTML = `NONEEE`;
        message.style.color = "red";

        // audio.pause();
      }
      poseName.innerHTML = "garland";
    } else if (id == 7) {
      if (result[0].label == "halfmoon" && result[0].confidence > 0.8) {
        //   message.innerHTML = "halfmoon";
        // play();
      } else {
        //   message.innerHTML = `NONEEE`;
        message.style.color = "red";
        // audio.pause();
      }
      poseName.innerHTML = "halfmoon";
    } else if (id == 8) {
      if (result[0].label == "Triangle" && result[0].confidence > 0.7) {
        //   message.innerHTML = "Triangle";
        // play();
      } else {
        //   message.innerHTML = `NONEEE`;
        message.style.color = "red";
        // audio.pause();
      }
      poseName.innerHTML = "Triangle";
    } else if (id == 9) {
      if (result[0].label == "warrior" && result[0].confidence > 0.9) {
        //   message.innerHTML = "warrior3";
        // play();
      } else {
        //   message.innerHTML = `NONEEE`;
        message.style.color = "red";
        // audio.pause();
      }
      poseName.innerHTML = "warrior3";
    } else if (id == 10) {
      if (result[0].label == "Eagle" && result[0].confidence > 0.8) {
        //   message.innerHTML = "Eagle";
        // play();
      } else {
        //   message.innerHTML = `NONEEE`;
        message.style.color = "red";
        // audio.pause();
      }
      poseName.innerHTML = "Eagle";
    }
}

nextBtn.addEventListener("click", () => {
  id += 1;
});
/* setInterval(()=>{
  for (let i = 0; i < temp.length; i++) {
    if (temp[i].score < 0.5) {
      notice.innerHTML = "Get your Full Body in Frame";
      tempFlag = false;
    } else {
      notice.innerHTML = "";
      tempFlag = true;
    }
  }
  fullBody = tempFlag
  if (!fullBody) {
    message.innerHTML = 0;
  } else {
  message.innerHTML = Math.round(conf * 100);
  }
  console.log(fullBody);
  if (fullBody) {
    console.log('Inside')
    drawKeypoints();
    drawSkeleton();
    classifyKeyPoints();
  }
},500) */
startApp();
/* setInterval(()=>{
  console.log('Inside');
  console.log(pauseTime);
  if(pauseTime){
    pauseTimer()
  }
  else{
    resumeTimer()
  }
},1000) */