// Make image simple

function convertImage(img) {
    let dst = new cv.Mat();
    let dst2 = new cv.Mat();
    cv.cvtColor(img, dst, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(dst, dst2, 128, 255, cv.THRESH_BINARY);
    return dst2
}

function helloworld() {
    hello()
}