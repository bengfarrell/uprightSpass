var midi = require('midi');
var WebSocketServer = require('websocket').server;
var http = require('http');
var s2web = require("node-sweatintotheweb/handtracker");
var Note = require('./musictheory/notes.js');
var Chord = require('./musictheory/chords.js');

var minY = -500;
var maxY = 800;
var instrumentWidth = 50;
//var keySigs = ["A", "B", "C", "D", "E", "F", "G"];

var currentKeySignature = "D#m";
var frameLoop;
var leftNote;
var rightNote;
var connections = [];

var output = new midi.output();
output.getPortCount();
output.getPortName(0);
output.openPort(0);

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({httpServer: server});

wsServer.on('request', function(request) {
    var cnct = request.accept();
    connections.push( cnct );
    console.log((new Date()) + ' Connection accepted.');
    cnct.on('close', function(reasonCode, description) {
         console.log((new Date()) + ' Peer disconnected.');
    });
});


s2web.context.on = function(name) {
    switch (name) {
        case "SKELETON_TRACKING":
            if (!frameLoop) {
                console.log("Start tracking");
                frameLoop = setInterval(onUpdate,50);
            }
            break;

        case "SKELETON_STOPPED_TRACKING":
            if (frameLoop) {
                console.log("Stop tracking");
                clearInterval(frameLoop);
                frameLoop = null;
            }
    }
};

function onUpdate() {
    var hands = s2web.getHands();
    var left = hands["left_hand"];
    var right = hands["right_hand"];
    var bodycenter = hands["body_center"];

    /*if (right.active) {
        currentKeySignature = changeKeySignature(right.y);
    }*/

    if (Math.abs(bodycenter.x - left.x) < instrumentWidth && left.active) {
        leftNote = playNote(leftNote, convertToNote(left.y));
        left.contact = true;
    } else if (leftNote) {
        output.sendMessage([128, Note.toMIDI(leftNote), 90]);
        left.contact = false;
        leftNote = null;
    }

    if (Math.abs(bodycenter.x - right.x) < instrumentWidth && right.active) {
        rightNote = playNote(rightNote, convertToNote(right.y));
        right.contact = true;
    } else if (rightNote) {
        output.sendMessage([128, Note.toMIDI(rightNote), 90]);
        right.contact = false;
        rightNote = null;
    }
    /*if (Math.abs(bodycenter.x - right.x) < instrumentWidth && right.active) {
        rightNote = playChord(rightNote, convertToNote(right.y));
        right.contact = true;
    } else if (rightNote) {
        var c = new Chord(rightNote);
        for (note in c.getNotations()) {
            output.sendMessage([128, Note.toMIDI(c.getNotations()[note]), 90]);
        }
        right.contact = false;
        rightNote = null;
    }*/

    if (right.active && left.active) {
        // send info to client for heads up display
        for (var c in connections) {
            left.distanceFromCenter = bodycenter.x - left.x;
            left.verticalPercentage = parseInt( ( (left.y-minY) / (maxY-minY) ) *100);
            left.note = convertToNote(left.y);

            right.distanceFromCenter = bodycenter.x - right.x;
            right.verticalPercentage = parseInt( ( (right.y-minY) / (maxY-minY) ) *100);
            right.note = convertToNote(right.y);

            hands = {"left_hand": left, "right_hand": right};
            connections[c].sendUTF(JSON.stringify(hands));
        }
    }
}

function changeKeySignature(yPos) {
    var noteSurfaceHeight = (maxY-minY)/keySigs.length;
    var noteIndex = parseInt( (yPos - minY)/noteSurfaceHeight );
    return keySigs[noteIndex];
}

function convertToNote(yPos) {
    // concat 2 octaves together into an array
    var notes = Note.notesInKeySignature(currentKeySignature, true, 3);
    notes = notes.concat( Note.notesInKeySignature(currentKeySignature, true, 4) );

    var noteSurfaceHeight = (maxY-minY)/notes.length;
    var noteIndex = parseInt( (yPos - minY)/noteSurfaceHeight );
    return notes[noteIndex];
}

function playChord(oldchord, newchord) {
    if (oldchord != newchord) {
        if (oldchord) {
            var c = new Chord(oldchord);
            for (note in c.getNotations()) {
                output.sendMessage([128, Note.toMIDI(c.getNotations()[note]), 90]);
            }
        }
        if (newchord) {
            var c = new Chord(newchord);
            for (note in c.getNotations()) {
                output.sendMessage([144, Note.toMIDI(c.getNotations()[note]), 90]);
            }
        }
    }
    return newchord;

}

function playNote(oldnote, newnote) {
    if (oldnote != newnote) {
        if (oldnote) {
            output.sendMessage([128, Note.toMIDI(oldnote), 90]);
        }
        if (newnote) {
            output.sendMessage([144, Note.toMIDI(newnote), 90]);
        }
    }
    return newnote;
}

process.on('exit', function() {
    output.closePort();
    s2web.close();
});
s2web.init();