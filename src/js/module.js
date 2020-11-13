// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const pose_URL = "https://teachablemachine.withgoogle.com/models/09nqyf6SY/";
let pose_model, webcam;

const mask_URL = "https://teachablemachine.withgoogle.com/models/xc0Fgt-Z5/";
let mask_model;

let data;

let moduleRunning = false;
let totalRunTime;

let pose_startTime;
let pose_endTime;
let pose_timeDiff = 0;
let pose_wholeTime = 0;

let pose_status = "okay";

//=========================

let mask_status = "mask";

let mask_startTime;
let mask_endTime;
let mask_timeDiff;

let mask_count = 0;

let sent = false;

function drawChart() {
    let pieName =['good posture 😃','bad posture 😒']
    let pieNum = [data.pose_wholeTime, data.pose_nagative]
    
    //올바른 자세를 유지한 시간 
    const pieChart = document.getElementById('added').getContext('2d')
    Chart.defaults.global.defaultFontFamily='Arials';
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = "black";

    new Chart(pieChart,{
        type: 'pie', //bar,horizontalBar,pie,line,doughnut,radar, polarArea
        data:{
            labels : pieName, //이름 적기
            datasets: [{
                label:'일별 추가 확진자수',
                data: pieNum, 
                backgroundColor : ['#FFE4E1','#E0FFFF'],
                borderWidth : 2,
                borderColor : '#ddd',
                hoverBorderWidth: 2,
                hoverBorderColor: 'black',
                lineTension:0.1
            }] //마음에 드는 데이터셋 아무거나 가능
        },
        options:{
            
            responsive: false,
            title : {
                display : false,
                text : '자세',
                fontSize : 20, // 글로벌에 설정한 폰트사이즈를 바꿀 수 있음.
            },
            legend : {
                
                //position : 'right',
                labels :{
                    fontColor: '#474747',
                    backgroundColor: 'black' 
                }
            },
            layout: {
                padding : {
                    left : 0,
                    right: 0,
                    bottom : 0,
                    top : 0
                }
            },
            tooltips : {
                enabled : true //마우스 오버시 보이는 숫자
            }
        }
    });
}

function moduleFinish() {
    moduleRunning = false;
    data = {
        pose_nagative: (totalRunTime * 60) - Math.round(pose_wholeTime),
        pose_wholeTime: Math.round(pose_wholeTime)
    };
    testSend.option.data = data;
    sendRequest();
    pose_timeDiff = 0;
    pose_wholeTime = 0;
    pose_status = "okay";
    mask_status = "mask";
    mask_timeDiff = 0;
    mask_count = 0;
    sent = false;
}

async function moduleStart(inputTime) {
    totalRunTime = inputTime;

    const pose_modelURL = pose_URL + "model.json";
    const pose_metadataURL = pose_URL + "metadata.json";

    const mask_modelURL = mask_URL + "model.json";
    const mask_metadataURL = mask_URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    pose_model = await tmPose.load(pose_modelURL, pose_metadataURL);

    mask_model = await tmImage.load(mask_modelURL, mask_metadataURL);

    // Convenience function to setup a webcam
    const size = 200;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    setTimer(inputTime); // Add code
    moduleRunning = true;
    window.requestAnimationFrame(loop);

    pose_startTime = new Date();
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    if (moduleRunning) {
        window.requestAnimationFrame(loop);
    } else {
        webcam.stop();
    }
}

function countingEnd(pose_status) {
    if (pose_status === "okay") {
        pose_endTime = new Date();
        pose_timeDiff = (pose_endTime - pose_startTime) / 1000;
        pose_wholeTime += pose_timeDiff;
    }
}

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await pose_model.estimatePose(webcam.canvas);

    // Prediction 2: run input through teachable machine classification model
    const pose_prediction = await pose_model.predict(posenetOutput);

    const mask_prediction = await mask_model.predict(webcam.canvas);

    const okay = pose_prediction[0].probability.toFixed(2);
    const leanLeft = pose_prediction[1].probability.toFixed(2);
    const leanRight = pose_prediction[2].probability.toFixed(3);
    const bent = pose_prediction[3].probability.toFixed(2);

    if (okay >= Math.max(leanLeft, leanRight, bent)) {
        if (pose_status !== "okay") {
            pose_startTime = new Date();
        } else {
            pose_endTime = new Date();
            pose_timeDiff = (pose_endTime - pose_startTime) / 1000;
        }
        pose_status = "okay";
    } else if (leanLeft >= Math.max(okay, leanRight, bent)) {
        countingEnd(pose_status);
        pose_status = "leanLeft";
    } else if (leanRight >= Math.max(okay, leanLeft, bent)) {
        countingEnd(pose_status);
        pose_status = "leanRight";
    } else if (bent >= Math.max(okay, leanLeft, leanRight)) {
        countingEnd(pose_status);
        pose_status = "bent";
    }

    //======================================

    const noMask = mask_prediction[0].probability.toFixed(2);

    if (noMask >= 0.3) {
        if (mask_status === "mask") {
            mask_startTime = new Date();
        } else if (mask_status === "noMask") {
            mask_endTime = new Date();
            mask_timeDiff = (mask_endTime - mask_startTime) / 1000;
            if (mask_timeDiff >= 15) {
                if (!sent) {
                    mask_count += 1;
                    const beepSound = new Audio('./src/mp3/beep.mp3');
                    beepSound.play();
                }
                sent = true;
            }
        }
        mask_status = "noMask";
    } else {
        mask_status = "mask";
        sent = false;
    }
}
