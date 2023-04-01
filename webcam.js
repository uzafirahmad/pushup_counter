let detector;
let detectorConfig;
let poses;
let video;
let hip_above_line = false;
let reps = 0;
let is_UP=true;
let is_down=false;
let correctform=false;
let good_back_angle = false;
let good_leg_angle = false;
let ankle_above_wrist = false;
// let hip_above_elbow_inUP = false;
// let good_nose_elbow_hip_inAction = false;


async function init() {
  detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
  // edges = {
  //   '5,7': 'm',
  //   '7,9': 'm',
  //   '6,8': 'c',
  //   '8,10': 'c',
  //   '5,6': 'y',
  //   '5,11': 'm',
  //   '6,12': 'c',
  //   '11,12': 'y',
  //   '11,13': 'm',
  //   '13,15': 'm',
  //   '12,14': 'c',
  //   '14,16': 'c'
  // };
  await getPoses();
}


async function setup() {
  createCanvas(640, 480);
  video = createCapture({
    audio: false,
    video: {
      facingMode: "user"
    }
  });
  video.hide()
  await init();
}

async function getPoses() {
  poses = await detector.estimatePoses(video.elt);
  document.getElementById("counterdiv").innerHTML="Number of pushups:"+reps;
  try {
    leg_formcheck();
    back_formcheck();
    ankle_wrist_formcheck();
    // hip_and_elbow_inUP_formcheck();
    // good_nose_elbow_hip_inAction_func();
    if ((good_back_angle == true) && (good_leg_angle == true) && (ankle_above_wrist == true)) {
      correctform=true
    }
    else {
      // console.log("good_back_angle:" + good_back_angle + ", good_leg_angle:" + good_leg_angle + " ,ankle_above_wrist:" + ankle_above_wrist)
      // console.log("bad form")
      correctform=false
    }
    if (correctform){
      check_isUP();
      if(is_UP){
        is_down=check_down_position();
        if(is_down){
          is_UP=false;
          reps=reps+1
        }
      }
    }
    else{
      is_UP=true;
      is_down=false;
    }
    // if(correctform && is_UP){

    // }
    // else if (correctform && is_UP==true){
    //   check_down_position();
    // }
  }
  catch (err) {

  }
  setTimeout(getPoses, 0);
}

function draw() {
  image(video, 0, 0, video.width, video.height);

  // Draw keypoints and skeleton
  // drawKeypoints();
  // if (skeleton) {
  //   drawSkeleton();
  // }

  // Write text
  // fill(255);
  // strokeWeight(2);
  // stroke(51);
  // translate(width, 0);
  // scale(-1, 1);
  // textSize(40);

  // if (poses && poses.length > 0) {
  //   let pushupString = `Push-ups completed: ${reps}`;
  //   text(pushupString, 100, 90);
  // }
  // else {
  //   text('Loading, please wait...', 100, 90);
  // }

}

// function get_left_or_right() {
//   if ((poses[0].keypoints[0].x > poses[0].keypoints[15].x) || ((poses[0].keypoints[0].x > poses[0].keypoints[16].x))) {
//     left_or_right = 'right';
//   }
//   else {
//     left_or_right = 'left';
//   }
// }

function leg_formcheck() {
  var leftHip = poses[0].keypoints[11];
  var leftKnee = poses[0].keypoints[13];
  var leftAnkle = poses[0].keypoints[15];
  a = Math.sqrt(Math.pow(leftHip.x - leftKnee.x, 2) + Math.pow(leftHip.y - leftKnee.y, 2))
  b = Math.sqrt(Math.pow(leftHip.x - leftAnkle.x, 2) + Math.pow(leftHip.y - leftAnkle.y, 2))
  c = Math.sqrt(Math.pow(leftKnee.x - leftAnkle.x, 2) + Math.pow(leftKnee.y - leftAnkle.y, 2))
  // correct angle must be greater than 160
  leg_angle = find_angle(a, b, c, 'b')
  if (leg_angle > 159) {
    good_leg_angle = true;
  }
  else {
    good_leg_angle = false;
  }
}

function back_formcheck() {
  var leftShoulder = poses[0].keypoints[5];
  var leftHip = poses[0].keypoints[11];
  var leftKnee = poses[0].keypoints[13];
  a = Math.sqrt(Math.pow(leftHip.x - leftShoulder.x, 2) + Math.pow(leftHip.y - leftShoulder.y, 2))
  b = Math.sqrt(Math.pow(leftKnee.x - leftShoulder.x, 2) + Math.pow(leftKnee.y - leftShoulder.y, 2))
  c = Math.sqrt(Math.pow(leftKnee.x - leftHip.x, 2) + Math.pow(leftKnee.y - leftHip.y, 2))

  back_angle = find_angle(a, b, c, 'b')
  hip_above_line = check_hip_coordinates(leftShoulder, leftKnee, leftHip);
  arm_angle = arm_formcheck();
  if (hip_above_line == false && back_angle > 165) {
    hip_above_line = true
  }
  else if (hip_above_line == false && arm_angle < 135) {
    hip_above_line = true
  }

  if (back_angle > 150 && hip_above_line==true) {
    good_back_angle = true;
  }
  else {
    good_back_angle = false;
  }
}

function ankle_wrist_formcheck() {
  if (poses[0].keypoints[15].y < poses[0].keypoints[9].y) {
    ankle_above_wrist = true
  }
  else {
    ankle_above_wrist = false
  }
}

// function hip_and_elbow_inUP_formcheck() {
//   arm_angle = arm_formcheck();
//   if (arm_angle < 170) {
//     hip_above_elbow_inUP = true
//   }
//   if (arm_angle > 170 && poses[0].keypoints[11].y > poses[0].keypoints[7].y) {
//     hip_above_elbow_inUP = true
//   }
//   else {
//     hip_above_elbow_inUP = false
//   }
// }

// function good_nose_elbow_hip_inAction_func() {
//   arm_angle = arm_formcheck();
//   if (arm_angle < 135 && (poses[0].keypoints[7].y < poses[0].keypoints[11].y) && (poses[0].keypoints[0].y < poses[0].keypoints[7].y)) {
//     good_nose_elbow_hip_inAction = false
//   }
//   else {
//     good_nose_elbow_hip_inAction = true
//   }
// }

function arm_formcheck() {
  var leftWrist = poses[0].keypoints[9];
  var leftElbow = poses[0].keypoints[7];
  var leftShoulder = poses[0].keypoints[5];
  a = Math.sqrt(Math.pow(leftElbow.x - leftShoulder.x, 2) + Math.pow(leftElbow.y - leftShoulder.y, 2))
  b = Math.sqrt(Math.pow(leftWrist.x - leftShoulder.x, 2) + Math.pow(leftWrist.y - leftShoulder.y, 2))
  c = Math.sqrt(Math.pow(leftWrist.x - leftElbow.x, 2) + Math.pow(leftWrist.y - leftElbow.y, 2))
  return find_angle(a, b, c, 'b')
}

function drawKeypoints() {
  var count = 0;
  if (poses && poses.length > 0) {
    for (let kp of poses[0].keypoints) {
      const { x, y, score } = kp;
      if (score > 0.2) {
        count = count + 1;
        fill(0, 255, 255);
        stroke(2);
        strokeWeight(2);
        circle(x, y, 10);
      }
      // if (count == 17) {
      //   //console.log('Whole body visible!');
      // }
      // else {
      //   //console.log('Not fully visible!');
      // }
      // updateArmAngle();
      // updateBackAngle();
      // inUpPosition();
      // inDownPosition();
    }
  }
}

// Draws lines between the keypoints
// function drawSkeleton() {
//   confidence_threshold = 0.2;

//   if (poses && poses.length > 0) {
//     for (const [key, value] of Object.entries(edges)) {
//       const p = key.split(",");
//       const p1 = p[0];
//       const p2 = p[1];

//       const y1 = poses[0].keypoints[p1].y;
//       const x1 = poses[0].keypoints[p1].x;
//       const c1 = poses[0].keypoints[p1].score;
//       const y2 = poses[0].keypoints[p2].y;
//       const x2 = poses[0].keypoints[p2].x;
//       const c2 = poses[0].keypoints[p2].score;

//       if ((c1 > confidence_threshold) && (c2 > confidence_threshold)) {
//         if ((highlightBack == true) && ((p[1] == 11) || ((p[0] == 6) && (p[1] == 12)) || (p[1] == 13) || (p[0] == 12))) {
//           strokeWeight(5);
//           stroke(255, 0, 255);
//           line(x1, y1, x2, y2);
//         }
//         else {
//           strokeWeight(5);
//           stroke('rgb(255, 0, 255)');
//           line(x1, y1, x2, y2);
//         }
//       }
//     }
//   }
// }

// function updateArmAngle() {
//   /*
//   rightWrist = poses[0].keypoints[10];
//   rightShoulder = poses[0].keypoints[6];
//   rightElbow = poses[0].keypoints[8];
//   */
//   leftWrist = poses[0].keypoints[9];
//   leftShoulder = poses[0].keypoints[5];
//   leftElbow = poses[0].keypoints[7];



//   angle = (
//     Math.atan2(
//       leftWrist.y - leftElbow.y,
//       leftWrist.x - leftElbow.x
//     ) - Math.atan2(
//       leftShoulder.y - leftElbow.y,
//       leftShoulder.x - leftElbow.x
//     )
//   ) * (180 / Math.PI);

//   if (angle < 0) {
//     //angle = angle + 360;
//   }

//   if (leftWrist.score > 0.3 && leftElbow.score > 0.3 && leftShoulder.score > 0.3) {
//     //console.log(angle);
//     elbowAngle = angle;
//   }
//   else {
//     //console.log('Cannot see elbow');
//   }

// }

// function updateBackAngle() {

//   var leftShoulder = poses[0].keypoints[5];
//   var leftHip = poses[0].keypoints[11];
//   var leftKnee = poses[0].keypoints[13];

//   angle = (
//     Math.atan2(
//       leftKnee.y - leftHip.y,
//       leftKnee.x - leftHip.x
//     ) - Math.atan2(
//       leftShoulder.y - leftHip.y,
//       leftShoulder.x - leftHip.x
//     )
//   ) * (180 / Math.PI);
//   angle = angle % 180;
//   if (leftKnee.score > 0.3 && leftHip.score > 0.3 && leftShoulder.score > 0.3) {

//     backAngle = angle;
//   }

//   if ((backAngle < 20) || (backAngle > 160)) {
//     highlightBack = false;
//   }
//   else {
//     highlightBack = true;
//     if (backWarningGiven != true) {
//       var msg = new SpeechSynthesisUtterance('Keep your back straight');
//       window.speechSynthesis.speak(msg);
//       backWarningGiven = true;
//     }
//   }

// }

// function inUpPosition() {
//   if (elbowAngle > 170 && elbowAngle < 200) {
//     //console.log('In up position')
//     if (downPosition == true) {
//       var msg = new SpeechSynthesisUtterance(str(reps+1));
//       window.speechSynthesis.speak(msg);
//       reps = reps + 1;
//     }
//     upPosition = true;
//     downPosition = false;
//   }
// }

// function inDownPosition() {
//   var elbowAboveNose = false;
//   if (poses[0].keypoints[0].y > poses[0].keypoints[7].y) {
//     elbowAboveNose = true;
//   }
//   else {
//     console.log('Elbow is not above nose')
//   }

//   if ((highlightBack == false) && elbowAboveNose && ((abs(elbowAngle) > 70) && (abs(elbowAngle) < 100))) {
//     console.log('In down position')
//     if (upPosition == true) {
//       var msg = new SpeechSynthesisUtterance('Up');
//       window.speechSynthesis.speak(msg);
//     }
//     downPosition = true;
//     upPosition = false;
//   }
// }

function find_angle(A, B, C, center) {
  if (center == 'a') {
    return radians_to_degrees(Math.acos(((B * B) + (C * C) - (A * A)) / (2 * B * C)))
  }
  else if (center == 'b') {
    return radians_to_degrees(Math.acos(((A * A) + (C * C) - (B * B)) / (2 * A * C)))
  }
  else {
    return radians_to_degrees(Math.acos(((A * A) + (B * B) - (C * C)) / (2 * A * B)))
  }
}

function check_hip_coordinates(shoulder, knee, hip) {
  m = (shoulder.y - knee.y) / (shoulder.x - knee.x)
  c = shoulder.y - (m) * (shoulder.x)
  check_y = (m * hip.x) + c
  if (hip.y > check_y) {
    // console.log("hip below line")
    return false
  }
  else {
    return true
  }
}

function radians_to_degrees(radians) {
  var pi = Math.PI;
  return radians * (180 / pi);
}

function check_down_position(){
  arm_angle=arm_formcheck();
  if (arm_angle<90 && (poses[0].keypoints[5].y> poses[0].keypoints[7].y) && (poses[0].keypoints[0].y> poses[0].keypoints[7].y)){
    return true
  }
  else{
    return false
  }
}

function check_isUP(){
  arm_angle=arm_formcheck();
  if (arm_angle>170){
    is_UP=true
    is_down=false
  }
}