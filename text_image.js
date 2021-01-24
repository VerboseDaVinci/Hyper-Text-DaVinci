// Add Text to image
let scaleFactor = 1.0;

let colorCanvas = document.getElementById("canvasOutput");
let textCanvas = document.getElementById("textOutput");


function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function onClickConvert(){
    let text = document.getElementById("input-text");
    let colorCanvas = document.getElementById("canvasOutput");
    let textCanvas = document.getElementById("textOutput")
    let canvasContext = colorCanvas.getContext('2d');

    //canvasContext.clearRect(0,0,canvas.width,canvas.height) // Clear It

    canvasContext.font="10px Arial"; // Set Font
    //canvasContext.fillText(text.value, 10, 50); // Add the text

    resizeCanvas(colorCanvas, textCanvas, text.value)

    wrapText(textCanvas, text.value);
    console.log({canvas: colorCanvas, textCanvas})
    // Create Downloadable image png
    createDownload(colorCanvas)


    //console.log(text.value);

}

function createDownload(canvas){
    let link = document.getElementById('download-anchor');
    link.addEventListener('click', function(ev) {
        link.href = textCanvas.toDataURL();
        link.download = "davincis-masterpiece.png";
    }, false);
}

function getLineHeight(ctx) {
    return parseInt(ctx.font.split('px')[0]);
}

function wrapText(canvas, str){
    /**
     * for letter in text{
         * if x > canvas_width{
         *     x = 0
         *     y+=line_height
         * }
     *
     * drawLetter(canvas, char, x,y)
     * x+= char_width
     * }
     */
    let ctx = canvas.getContext('2d');
    let lineHeight = getLineHeight(ctx);

    let x = lineHeight;
    let y = lineHeight;
    let letter = " "


    let line = "";
    for (var i = 0; i < str.length; i++) {
        letter = str.charAt(i);
        var metric = ctx.measureText(letter);


        if (x > canvas.width - lineHeight){
            y+=lineHeight;
            x=lineHeight;
            line = "";
        }
        line += letter;

        drawLetter(colorCanvas, letter, x, y);

        x+= metric.width;


    }


}


function getColor(canvas, x,y){
    let ctx = document.getElementById("canvasOutput").getContext('2d')

    let colorX = x / scaleFactor;
    let colorY = y / scaleFactor;
    let data = ctx.getImageData(colorX, colorY, 1, 1).data
    let colorHex = rgbToHex(data[0],data[1],data[2])
    //"#fe3482"
    return colorHex;
}

function resizeCanvas(inputCanvas, outputCanvas, str) {
    let ctx = inputCanvas.getContext('2d')

    let charWidth = ctx.measureText(str).width/str.length;
    let charHeight = getLineHeight(ctx);

    let xRatio = inputCanvas.width / charWidth
    let yRatio = inputCanvas.height / charHeight

    scaleFactor = Math.sqrt(str.length/(xRatio*yRatio));
    console.log("sqrt man");
    outputCanvas.width = inputCanvas.width * scaleFactor;
    outputCanvas.height = inputCanvas.height * scaleFactor;

    console.table({charWidth, charHeight, xRatio, yRatio, scaleFactor})

    outputCanvas.getContext('2d').font = ctx.font;
}

/**
 * Draw character at selected position
 * @param canvas Canvas to draw character on
 * @param char
 * @param x x-position of character
 * @param y
 * @return Return if the character has been successfully drawn at position, if not return false
 */
function drawLetter(canvas, char, x, y){
    /**
     * if there is color at x,y
     *  increment the x,y to next pos
     *  return false
     * else if there is color
     *  filltext
     *  return true
     */
    let ctx = textCanvas.getContext('2d')
    // if(ctx.ucharPtr(x, y)[0] != null || ctx.ucharPtr(x, y)[0] != 0){
    //     return;
    // }else{

    let drawColor = getColor(colorCanvas, x,y)

        ctx.fillStyle = drawColor;
        ctx.fillText(char,x,y);
        return true;
    // }

}
