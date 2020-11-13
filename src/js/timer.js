const timer = document.querySelector(".js-timer");
const timer__min = document.querySelector(".js-timer__min");
const leftTimeWrap = document.querySelector(".js-leftTimeWrap");
const restartBtn = document.querySelector(".js-restartBtn");
const main = document.querySelector(".js-main");
const poseRunTime = document.querySelector(".js-poseRunTime");
const maskCount = document.querySelector(".js-maskCount");

const SHOWING_CLASS = "showing";
const GRID = "grid";

function setTimer(inputTime) {
    leftTime = inputTime;
    leftTimeWrap.classList.add(SHOWING_CLASS);
    leftTimeWrap.innerHTML = `${leftTime} minutes left`;
    let interval = setInterval(function() {
        leftTime -= 1;
        if (leftTime > 0) {
            leftTimeWrap.innerHTML = `${leftTime} minutes left`;
        } else {
            clearInterval(interval); // Timer finished
            leftTimeWrap.classList.remove(SHOWING_CLASS);
            restartBtn.classList.add(SHOWING_CLASS);
            main.classList.add(GRID);
            poseRunTime.innerHTML = `총 시간: ${totalRunTime}분`;
            maskCount.innerHTML = mask_count;
            moduleFinish();
            drawChart();
        }
    }, 60000);
}

function handleRestartBtnClick(event) {
    restartBtn.classList.remove(SHOWING_CLASS);
    timer.classList.add(SHOWING_CLASS);
    timer__min.value = "";
}

function handleTimerSubmit(event) {
    event.preventDefault();
    const inputTime = Number(timer__min.value);
    timer.classList.remove(SHOWING_CLASS);
    main.classList.remove(GRID);
    moduleStart(inputTime);
}

function init() {
    timer.classList.add(SHOWING_CLASS);
    leftTimeWrap.classList.remove(SHOWING_CLASS);
    restartBtn.classList.remove(SHOWING_CLASS);
    main.classList.remove(GRID);
    timer.addEventListener("submit", handleTimerSubmit);
    restartBtn.addEventListener("click", handleRestartBtnClick);
}
init();