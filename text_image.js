// Add Text to image
let scaleFactor = 1.0;

let colorCanvas = document.getElementById("canvasOutput");
let textCanvas = document.getElementById("textOutput");
let ignoreColor = "#ffffffff"

WebFont.load({
    google: {
        families: ['Open Sans:300,400']
    },
    loading: function() {
        console.log("Fonts are being loaded");
    },
    active: function() {
        console.log("Fonts have been rendered")
    }
});
// console.log("Hello")

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b, a) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(a);
}

function onClickConvert() {
    let text = document.getElementById("input-text");
    let colorCanvas = document.getElementById("canvasOutput");
    let textCanvas = document.getElementById("textOutput");
    let canvasContext = colorCanvas.getContext('2d');
    let fontSize = document.getElementById('font-input').value;

    //canvasContext.clearRect(0,0,canvas.width,canvas.height) // Clear It
    canvasContext.font = fontSize + "px OpenSans"; // Set Font
    //canvasContext.fillText(text.value, 10, 50); // Add the text
    console.log(canvasContext.font)
    smartResizeCanvas(colorCanvas, textCanvas, text.value);

    wrapText(textCanvas, text.value);
    // Create Downloadable image png
    createDownload(colorCanvas);


    // console.log(text.value);

}

function createDownload(canvas) {
    let link = document.getElementById('download-anchor');
    link.addEventListener('click', function (ev) {
        link.href = textCanvas.toDataURL();
        link.download = "davincis-masterpiece.png";
    }, false);

    let button = document.getElementById("download-button");
    button.disabled=false;
}

function getLineHeight(ctx) {
    return parseInt(ctx.font.split('px')[0]);
}

function wrapText(canvas, str) {
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

    // let x = lineHeight;
    let x = canvas.width - lineHeight;
    let y = lineHeight;
    let letter = " ";
    console.log({x})

    let line = "";
    for (var i = 0; i < str.length; i++) {
        letter = str.charAt(i);
        var metric = ctx.measureText(letter);

        if (y > canvas.height){
            break;
        }

        if (x < lineHeight) {
        // if (x > canvas.width - lineHeight) {
            y += lineHeight;
            // x = lineHeight;
            x =  canvas.width - lineHeight;
            line = "";
        }
        line = letter + line;

        if (!drawLetter(colorCanvas, letter, x, y)){
            i--;
        };

        // x += metric.width;
        x -= metric.width;


    }
    console.log({line})


}


function getColor(canvas, x, y) {
    let ctx = document.getElementById("canvasOutput").getContext('2d')

    let colorX = x / scaleFactor;
    let colorY = y / scaleFactor;
    let data = ctx.getImageData(colorX, colorY, 1, 1).data;
    let colorHex = rgbToHex(data[0], data[1], data[2], data[3]);
    //"#fe3482"
    return colorHex;
}

function resizeCanvas(inputCanvas, outputCanvas, str) {
    let ctx = inputCanvas.getContext('2d');

    let charWidth = ctx.measureText(str).width / str.length;
    let charHeight = getLineHeight(ctx);

    let xRatio = inputCanvas.width / charWidth;
    let yRatio = inputCanvas.height / charHeight;

    scaleFactor = Math.sqrt(str.length / (xRatio * yRatio));
    outputCanvas.width = inputCanvas.width * scaleFactor;
    outputCanvas.height = inputCanvas.height * scaleFactor;

    outputCanvas.getContext('2d').font = ctx.font;
}

function smartResizeCanvas(inputCanvas, outputCanvas, str) {
    let ctx = inputCanvas.getContext('2d')

    let charWidth = ctx.measureText(str).width / str.length;
    let charHeight = getLineHeight(ctx);

    scaleFactor = 1;
    let pixelRatio = getValidPixelRatio();
    let xRatio = inputCanvas.width / charWidth;
    let yRatio = inputCanvas.height / charHeight;

    scaleFactor = Math.sqrt(str.length / (xRatio * yRatio * pixelRatio));
    outputCanvas.width = inputCanvas.width * scaleFactor;
    outputCanvas.height = inputCanvas.height * scaleFactor;

    outputCanvas.getContext('2d').font = ctx.font;
}

function getValidPixelRatio() {
    let width = colorCanvas.width;
    let height = colorCanvas.height;

    ctx = colorCanvas.getContext('2d');
    let background = "#ffffffff";
    let transparent = "#00000000";

    let invalidPixels = 0;


    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            let color = getColor(colorCanvas, i, j);

            // if (i%50 === 1 && j%50 ===1) {
            //     console.log({color})
            // }

            if (isWhite(color) || isTransparent(color)) {

                invalidPixels++;
                //console.log({color, invalidPixels})
            }
        }
    }

    let pixelRatio = 1 - (invalidPixels / (width * height));
    return pixelRatio;

}

function isWhite(hex){
    return (hex[1] === 'f' && hex[3] ==='f' && hex[5] === 'f');
}

function isTransparent(hex){
    return hex[8] === '0';
}


/**
 * Draw character at selected position
 * @param canvas Canvas to draw character on
 * @param char
 * @param x x-position of character
 * @param y
 * @return Return if the character has been successfully drawn at position, if not return false
 */
function drawLetter(canvas, char, x, y) {
    /**
     * if there is color at x,y
     *  increment the x,y to next pos
     *  return false
     * else if there is color
     *  filltext
     *  return true
     */
    let ctx = textCanvas.getContext('2d');
    // if(ctx.ucharPtr(x, y)[0] != null || ctx.ucharPtr(x, y)[0] != 0){
    //     return;
    // }else{

    let drawColor = getColor(colorCanvas, x, y);

    if (isWhite(drawColor) || isTransparent(drawColor)){
        ctx.fillStyle = "#00000000";
        ctx.fillText(char, x, y);
        return false;
    } else {
        ctx.fillStyle = drawColor;
        ctx.fillText(char, x, y);
        return true;
    }

    // }

}
