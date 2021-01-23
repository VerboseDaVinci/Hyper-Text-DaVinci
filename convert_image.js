// Make image simple

function convertImage(img) {
    let dstr = new cv.Mat();
    let dstg = new cv.Mat();
    let dstb = new cv.Mat();
    let rgbaPlanes = new cv.MatVector();
    cv.split(img, rgbaPlanes);


    // cv.cvtColor(img, dst, cv.COLOR_RGBA2GRAY, 0);
    // cv.inRange(img, low, high, dst);
    cv.threshold(rgbaPlanes.get(0), dstr, 128, 255, cv.THRESH_BINARY);
    cv.threshold(rgbaPlanes.get(1), dstg, 128, 255, cv.THRESH_BINARY);
    cv.threshold(rgbaPlanes.get(2), dstb, 128, 255, cv.THRESH_BINARY);
    cv.imshow('canvasR', dstr);
    cv.imshow('canvasG', dstg);
    cv.imshow('canvasB', dstb);
    return dstr
}