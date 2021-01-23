// Make image simple

function convertImage(img) {
    let dst = new cv.Mat();
    cv.cvtColor(img, dst, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(255, dis)
    //cv2.threshold(img, thresh, 255, cv2.THRESH_BINARY)[1]
    // 👾
    return dst
}

function helloworld() {
    hello()
}