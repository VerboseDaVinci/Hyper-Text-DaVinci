// Make image simple

function convertImage(img) {

    // let dstr = new cv.Mat();
    // let dstg = new cv.Mat();
    // let dstb = new cv.Mat();
    // let rgbaPlanes = new cv.MatVector();
    // cv.split(img, rgbaPlanes);


    // cv.cvtColor(img, dst, cv.COLOR_RGBA2GRAY, 0);
    // cv.inRange(img, low, high, dst);
    // cv.threshold(rgbaPlanes.get(0), dstr, 177, 255, cv.THRESH_BINARY);
    // cv.threshold(rgbaPlanes.get(1), dstg, 128, 255, cv.THRESH_BINARY);
    // cv.threshold(rgbaPlanes.get(2), dstb, 128, 255, cv.THRESH_BINARY);
    // cv.imshow('canvasR', dstr);
    // cv.imshow('canvasG', dstg);
    // cv.imshow('canvasB', dstb);

    let pixels = get_pixel_dataset(img, MAX_K_MEANS_PIXELS);
    let centroids = k_means(pixels, 4);
    let quantized_img = quantize(img, centroids)
    let mat = cv.matFromImageData(quantized_img)
    return mat;

}

/*
Following code adapted from:
 https://github.com/dstein64/k-means-quantization-js
 */


var MAX_K_MEANS_PIXELS = 50000;

// Checks for equality of elements in two arrays.
var arrays_equal = function(a1, a2) {
    if (a1.length !== a2.length) return false;
    for (var i = 0; i < a1.length; ++i) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
};

// Given width w and height h, rescale the dimensions to satisfy
// the specified number of pixels.
var rescale_dimensions = function(w, h, pixels) {
    var aspect_ratio = w / h;
    var scaling_factor = Math.sqrt(pixels / aspect_ratio);
    var rescaled_w = Math.floor(aspect_ratio * scaling_factor);
    var rescaled_h = Math.floor(scaling_factor);
    return [rescaled_w, rescaled_h];
};

// Given an Image, return a dataset with pixel colors.
// If resized_pixels > 0, image will be resized prior to building
// the dataset.
// return: [[R,G,B,a], [R,G,B,a], [R,G,B,a], ...]
var get_pixel_dataset = function(img, resized_pixels) {
    if (resized_pixels === undefined) resized_pixels = -1;
    // Get pixel colors from a <canvas> with the image
    var canvas = document.createElement("canvas");
    var img_n_pixels = img.width * img.height;
    var canvas_width = img.width;
    var canvas_height = img.height;
    if (resized_pixels > 0 && img_n_pixels > resized_pixels) {
        var rescaled = rescale_dimensions(img.width, img.height, resized_pixels)
        canvas_width = rescaled[0];
        canvas_height = rescaled[1];
    }
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    var canvas_n_pixels = canvas_width * canvas_height;
    var context = canvas.getContext("2d");
    context.drawImage(img, 0, 0, canvas_width, canvas_height);
    var flattened_dataset = context.getImageData(
        0, 0, canvas_width, canvas_height).data;
    var n_channels = flattened_dataset.length / canvas_n_pixels;
    var dataset = [];
    for (var i = 0; i < flattened_dataset.length; i += n_channels) {
        dataset.push(flattened_dataset.slice(i, i + n_channels));
    }
    return dataset;
};

// Given a point and a list of neighbor points, return the index
// for the neighbor that's closest to the point.
var nearest_neighbor = function(point, neighbors) {
    var best_dist = Infinity; // squared distance
    var best_index = -1;
    for (var i = 0; i < neighbors.length; ++i) {
        var neighbor = neighbors[i];
        var dist = 0;
        for (var j = 0; j < point.length; ++j) {
            dist += Math.pow(point[j] - neighbor[j], 2);
        }
        if (dist < best_dist) {
            best_dist = dist;
            best_index = i;
        }
    }
    return best_index;
};

// Returns the centroid of a dataset.
var centroid = function(dataset) {
    if (dataset.length === 0) return [];
    // Calculate running means.
    var running_centroid = [];
    for (var i = 0; i < dataset[0].length; ++i) {
        running_centroid.push(0);
    }
    for (var i = 0; i < dataset.length; ++i) {
        var point = dataset[i];
        for (var j = 0; j < point.length; ++j) {
            running_centroid[j] += (point[j] - running_centroid[j]) / (i+1);
        }
    }
    return running_centroid;
};

// Returns the k-means centroids.
var k_means = function(dataset, k) {
    if (k === undefined) k = Math.min(3, dataset.length);
    // Use a seeded random number generator instead of Math.random(),
    // so that k-means always produces the same centroids for the same
    // input.
    rng_seed = 0;
    var random = function() {
        rng_seed = (rng_seed * 9301 + 49297) % 233280;
        return rng_seed / 233280;
    };
    // Choose initial centroids randomly.
    centroids = [];
    for (var i = 0; i < k; ++i) {
        var idx = Math.floor(random() * dataset.length);
        centroids.push(dataset[idx]);
    }
    while (true) {
        // 'clusters' is an array of arrays. each sub-array corresponds to
        // a cluster, and has the points in that cluster.
        var clusters = [];
        for (var i = 0; i < k; ++i) {
            clusters.push([]);
        }
        for (var i = 0; i < dataset.length; ++i) {
            var point = dataset[i];
            var nearest_centroid = nearest_neighbor(point, centroids);
            clusters[nearest_centroid].push(point);
        }
        var converged = true;
        for (var i = 0; i < k; ++i) {
            var cluster = clusters[i];
            var centroid_i = [];
            if (cluster.length > 0) {
                centroid_i = centroid(cluster);
            } else {
                // For an empty cluster, set a random point as the centroid.
                var idx = Math.floor(random() * dataset.length);
                centroid_i = dataset[idx];
            }
            converged = converged && arrays_equal(centroid_i, centroids[i]);
            centroids[i] = centroid_i;
        }
        if (converged) break;
    }
    return centroids;
};

// Takes an <img> as input. Returns a quantized image.
var quantize = function(img, colors) {
    var width = img.width;
    var height = img.height;
    var source_canvas = document.createElement("canvas");
    source_canvas.width = width;
    source_canvas.height = height;
    var source_context = source_canvas.getContext("2d");
    source_context.drawImage(img, 0, 0, width, height);

    // flattened_*_data = [R, G, B, a, R, G, B, a, ...] where
    // (R, G, B, a) groups each correspond to a single pixel, and they are
    // column-major ordered.
    var flattened_source_data = source_context.getImageData(
        0, 0, width, height).data;
    var n_pixels = width * height;
    var n_channels = flattened_source_data.length / n_pixels;

    var flattened_quantized_data = new Uint8ClampedArray(
        flattened_source_data.length);

    // Set each pixel to its nearest color.
    var current_pixel = new Uint8ClampedArray(n_channels);
    for (var i = 0; i < flattened_source_data.length; i += n_channels) {
        // This for loop approach is faster than using Array.slice().
        for (var j = 0; j < n_channels; ++j) {
            current_pixel[j] = flattened_source_data[i + j];
        }
        var nearest_color_index = nearest_neighbor(current_pixel, colors);
        var nearest_color = centroids[nearest_color_index];
        for (var j = 0; j < nearest_color.length; ++j) {
            flattened_quantized_data[i+j] = nearest_color[j];
        }
    }

    var quantized_canvas = document.createElement("canvas");
    quantized_canvas.width = width;
    quantized_canvas.height = height;
    var quantized_context = quantized_canvas.getContext("2d");

    var image = quantized_context.createImageData(width, height);
    image.data.set(flattened_quantized_data);
    quantized_context.putImageData(image, 0, 0);
    return image;
};

/*
end of adapted code
 */