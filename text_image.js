// Add Text to image

function onClickConvert(){
    let text = document.getElementById("input-text");
    let canvas = document.getElementById("canvasOutput");
    let canvasContext = canvas.getContext('2d');

    //canvasContext.clearRect(0,0,canvas.width,canvas.height) // Clear It

    canvasContext.font="30px Arial"; // Set Font
    //canvasContext.fillText(text.value, 10, 50); // Add the text

    wrapText(canvas, text.value);

    // Create Downloadable image png
    createDownload(canvas)


    //console.log(text.value);

}

function createDownload(canvas){
    let link = document.getElementById('download-anchor');
    link.addEventListener('click', function(ev) {
        link.href = canvas.toDataURL();
        link.download = "davincis-masterpiece.png";
    }, false);
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
    let lineHeight = parseInt(ctx.font.split('px')[0]);

    let x = lineHeight;
    let y = lineHeight;
    let letter = " "


    let line = "";
    for (var i = 0; i < str.length; i++) {
        letter = str.charAt(i);
        var metric = ctx.measureText(letter);


        if (x > canvas.width){
            y+=lineHeight;
            x=0;
            console.log (y);
            console.log(line);
            line = "";
        }
        line += letter;
        ctx.fillText(letter, x, y);

        x+= metric.width;


    }


}

/**
 * Draw character at selected position
 * @param canvas Canvas to draw character on
 * @param char
 * @param x x-position of character
 * @param y
 * @return Return if the character has been successfully drawn at position, if not return false
 */
function drawLetter(ctx, char, x, y){
    ctx.fillText(char,x,y)
    return true
}
