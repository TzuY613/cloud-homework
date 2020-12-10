const video = document.querySelector('#webcam');
const enableWebcamButton = document.querySelector('#enableWebcamButton');
const disableWebcamButton = document.querySelector('#disableWebcamButton');
const canvas = document.querySelector('#outputCanvas');
let labelContainer = document.getElementById('label-container');



function onOpenCvReady() {
  document.querySelector('#status').innerHTML = 'model is ready.';
  /* enable the button */
  enableWebcamButton.disabled = false;
  //enableWebcamButton.disabled = false;
}

/* Check if webcam access is supported. */
function getUserMediaSupported() {
  /* Check if both methods exists.*/
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
    
    /* alternative approach 
    return ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices);
    */
}
  
  /* 
   * If webcam is supported, add event listener to button for when user
   * wants to activate it to call enableCam function which we will 
   * define in the next step.
   */

if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam);
  disableWebcamButton.addEventListener('click', disableCam);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}


function enableCam(event) {
  /* disable this button once clicked.*/
  event.target.disabled = true;
    
  /* show the disable webcam button once clicked.*/
  disableWebcamButton.disabled = false;

  /* show the video and canvas elements */
  document.querySelector("#liveView").style.display = "block";

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', processVid);
  })
  .catch(function(err){
    console.error('Error accessing media devices.',error);
  });
};

function disableCam(event) {
    event.target.disabled = true;
    enableWebcamButton.disabled = false;

    /* stop streaming */
    video.srcObject.getTracks().forEach(track => {
      track.stop();
    })
  
    /* clean up. some of these statements should be placed in processVid() */
    video.srcObject = null;
    //video.removeEventListener('loadeddata', processVid);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.querySelector("#liveView").style.display = "none";
}

function processVid() {
  const y = tf.tidy(() => {
    let img = tf.browser.fromPixels(video);
    img = tf.image.resizeBilinear(img, [32, 32]);
    let test_data = tf.expandDims(img);
    test_data = test_data.div(tf.scalar(255));
    predict(test_data) ;
    return test_data ;
  });
}



async function predict(test_data) {
    mobilenet.load().then(model => {
        // Classify the image.
        model.classify(test_data).then(predictions => {
          console.log('Predictions: ');
          console.log(predictions);
          let str = '';
          predictions.forEach(el => {
            str += el.className +  '<br>';
          });
        
            labelContainer.innerHTML = str;
        });
      });

      window.requestAnimationFrame(processVid);

}
