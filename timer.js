
// Define the timer object with initial values #1
const timer = {
  pomodoro: 30,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  sessions: 0, 
};

let interval;

// Create an audio object for button sound
const buttonSound = new Audio('button-sound.mp3');
// Get the main button element and add click event listener
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
  buttonSound.play();
  const { action } = mainButton.dataset;
  if (action === 'start') {
    startTimer();
  } else {
    stopTimer();
  }
});

// Get the mode buttons element and add click event listener #2
const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

// Function to calculate the remaining time
function getRemainingTime(endTime) {
  const currentTime = Date.parse(new Date());
  const difference = endTime - currentTime;

  const total = Number.parseInt(difference / 1000, 10);
  const minutes = Number.parseInt((total / 60) % 60, 10);
  const seconds = Number.parseInt(total % 60, 10);

  return {
    total,
    minutes,
    seconds
  };  
}

// Function to start the timer
function startTimer() {
  let { total } = timer.remainingTime;
  const endTime = Date.parse(new Date()) + total * 1000;

  if (timer.mode === 'pomodoro') timer.sessions++;

  mainButton.dataset.action = 'stop';
  mainButton.textContent = 'stop';
  mainButton.classList.add('active');
  
  interval = setInterval(function() {
    timer.remainingTime = getRemainingTime(endTime);
    updateClock();

    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);
     //stopTimer(); null for swiitch & case logic
      //switchMode(timer.mode); null for switch & case logic

      switch (timer.mode) {
        case 'pomodoro':
          if (timer.sessions % timer.longBreakInterval === 0) {
            switchMode('longBreak');
          } else {
            switchMode('shortBreak');
          }
          break;
          default: 
          switchMode('pomodoro');
        }
  // Show notification if permission is granted
    if (Notification.permission === 'granted') {
    const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break';
    new Notification(text);
  }
        document.querySelector(`[data-sound="${timer.mode}"]`).play();

        startTimer();
      }
  }, 1000);
}

function resetTimer() {
  timer.remainingTime = {
    total: timer[timer.mode] * 60,
    minutes: timer[timer.mode],
    seconds: 0,
  };
  updateClock();
}

// Function to update the clock display
function updateClock() {
  const { remainingTime } = timer;
  const minutes = `${remainingTime.minutes}`.padStart(2, '0');
  const seconds = `${remainingTime.seconds}`.padStart(2, '0');

  const min = document.getElementById('js-minutes');
  const sec = document.getElementById('js-seconds');
  min.textContent = minutes;
  sec.textContent = seconds;

  const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
  document.title = `${minutes}:${seconds} - ${text}`;

  const progress = document.getElementById('js-progress');
  progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
};

// Function to switch the timer mode
function switchMode(mode) {
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: timer[mode],
    seconds: 0,
  };

  // Remove active class from all mode buttons and add it to the selected mode button
  document
    .querySelectorAll('button[data-mode]')
    .forEach(e => e.classList.remove('active'));
  document.querySelector(`[data-mode='${mode}']`).classList.add('active');
  
  // Change the background color based on the mode
  //document.body.style.backgroundColor = `var(--${mode})`;
  
  // Set the maximum value of the progress bar
  document 
    .getElementById('js-progress')
    .setAttribute('max', timer.remainingTime.total);

  updateClock();
};

// Function to handle mode button click #2.5
function handleMode(event) {
  const { mode } = event.target.dataset;

  if(!mode) return;

  switchMode(mode);
  stopTimer();
};


// Function to stop the timer
function stopTimer() {
  clearInterval(interval);

  mainButton.dataset.action ='start';
  mainButton.textContent = 'start';
  mainButton.classList.remove('active');
};

// Function to switch the timer mode
function switchMode(mode) {
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: timer[mode],
    seconds: 0,
  };

  // Remove active class from all mode buttons and add it to the selected mode button
  document
    .querySelectorAll('button[data-mode]')
    .forEach(e => e.classList.remove('active'));
  document.querySelector(`[data-mode='${mode}']`).classList.add('active');
  
  // Change the background color based on the mode
  //document.body.style.backgroundColor = `var(--${mode})`;
  
  // Set the maximum value of the progress bar
  document 
    .getElementById('js-progress')
    .setAttribute('max', timer.remainingTime.total);

  updateClock();
};


// Add notifications for the app when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if the browser supports notifications
  if ('Notification' in window) {
    // Check if notification permission is neither granted nor denied
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      // Ask user for permission to show notifications
      Notification.requestPermission().then(function(permission) {
        // If permission is granted, show a notification
        if (permission === 'granted') {
          new Notification(
            'LETS GET IT! You will be notified at the start of each session you heard!'
          );
        }
      });
    }
  }
  switchMode('pomodoro');
});

console.log(Notification.permission);