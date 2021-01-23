// Add Text to image


function importImage(){

}

function importText(){

}

function imageToText(){

}

function onClickConvert(){
    let text = document.getElementById("input-text");
    let canvas = document.getElementById("text-canvas");
    let canvasContext = canvas.getContext('2d');

    canvasContext.clearRect(0,0,canvas.width,canvas.height) // Clear It

    canvasContext.font="30px Arial"; // Set Font
    canvasContext.fillText(text.value, 10, 50); // Add the text

    // Create Downloadable image png
    let link = document.getElementById('download-anchor');
    link.addEventListener('click', function(ev) {
        link.href = canvas.toDataURL();
        link.download = "davincis-masterpiece.png";
    }, false);

    console.log(text.value);

}
