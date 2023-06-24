let flags = {
    framesReady: false,
    audioReady: false,
    partWaiting: false,
};
let fps = 25;
let b64data = [];
let b64parts = 20;
let partIndex = 0;
let frameIndex = 0;
let globalFrameIndex = 0;
let intervalID = null;
let b64image = null;
let b64audio = new Audio();
let bodyColor = {
    black: [370, 1053, 1448, 2362, 3020, 3064, 3552, 4513, 5347, 5430],
    white: [685, 1405, 2284, 2766, 3042, 3154, 3874, 5116, 5384],
}

function _setNextFrame(){
    if (flags.partWaiting){
        if (b64data[partIndex] === undefined) return;
        b64audio.play();
        flags.partWaiting = false;
        _log("", true);
    }
    b64image.attr("src", ("data:image/jpeg;base64," + b64data[partIndex].seq[frameIndex]));
    _specialActions();
    // console.log("part:" + partIndex + ", lf:" + frameIndex + ", global_frame:" + (partIndex*328 + frameIndex));
}
function _specialActions(){
    if (frameIndex+1 >= b64data[partIndex].seq.length){
        frameIndex = 0;
        partIndex++;
        if (partIndex >= b64parts){
            return b64appleStop();
        }
        if (b64data[partIndex] === undefined){
            flags.partWaiting = true;
            _log("Part " + partIndex + " not loaded yet", true);
            b64audio.pause();
            return;
        }
        // audio sync per part
        // b64audio.currentTime = (globalFrameIndex+1)/fps;
    } else {
        frameIndex++;
    }
    globalFrameIndex++;
    
    if (bodyColor.black.indexOf(globalFrameIndex) >= 0) {
        $(document.body).addClass("black");
    }
    if (bodyColor.white.indexOf(globalFrameIndex) >= 0) {
        $(document.body).removeClass("black");
    }
}
function _log(text, erase = false){
    if (!erase){
        text = $("#b64log").html() + text;
    }
    $("#b64log").html(text + "<br>");
}
function _checkReady(){
    if (!flags.framesReady) return false;
    if (!flags.audioReady) return false;
    _log("Ready to play", true)
    $("#b64play")
        .html("Play")
        .addClass("loaded");
    return true;
}

function b64applePlay(){
    if (!flags.framesReady) return false;
    if (!flags.audioReady) return false;
    $("#b64play").addClass("hidden");
    _log("", true);
    setTimeout(() => {b64audio.play()}, 1000/fps);
    intervalID = setInterval(_setNextFrame, 1000/fps);
}
function b64appleStop(){
    $("#b64play").removeClass("hidden");
    b64audio.pause();
    b64audio.currentTime = 0;
    frameIndex = 0;
    globalFrameIndex = 0;
    partIndex = 0;
    $(document.body).removeClass("black");
    b64image.attr("src", "");
    clearInterval(intervalID);
    $(document.body).removeClass("alt");
}

function _loadNextJSON(part){
    if (part >= b64parts) return;
    let filename = "b64apple_p";
    $.getJSON(`assets/js/${filename}${part}.json`)
        .done(function(data) {
            b64data[part] = data;
            let logmsg = `File ${filename}${part}.json 
            loaded successfully [${b64data[part].seq.length}]`;
            if (part == 0){
                _log(logmsg);
                flags.framesReady = true;
                _checkReady();
            } else {
                console.log(logmsg);
            }
            _loadNextJSON(part+1);
        })
        .fail(function() {
            _log(`An error occurred while downloading the ${filename}${part}.json file`);
        });
}
function loadJSON(){
    _log("Loading json data");
    b64data.length = b64parts;
    _loadNextJSON(0);
}
function loadAudio(){
    _log("Loading audio data");
    b64audio.src = "assets/sound/badapple.ogg";
    b64audio.load();
    b64audio.volume = 0.1;
    b64audio.addEventListener("loadeddata", function(){
        _log("File badapple.ogg loaded successfully");
        flags.audioReady = true;
        _checkReady();
    }, {once: true, capture: false});
}

// ------------------------------------------------------------------
$(document).ready(function(){
    b64image = $("#b64image");
    $("#b64play").click(b64applePlay);

    // JSON data load
    loadJSON();

    // Audio data load
    loadAudio();
});