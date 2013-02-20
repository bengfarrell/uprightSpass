$(document).ready( function() {
    resize();
});

$(document).resize( function() {
    resize();
});

function resize() {
    var numStaffLines = 7*2; // notes in key sig times num of octaves
    for (var c = 0; c < numStaffLines; c++) {
        var seg = document.createElement("div");
        seg.className = "notesurface";
        seg.style.height = parseInt(document.height/numStaffLines) + "px";
        document.body.appendChild(seg)
    }
}

var connection = new WebSocket('ws://localhost:8080');

// When the connection is open, send some data to the server
connection.onopen = function () {
    connection.send('Ping'); // Send the message 'Ping' to the server
};

// Log errors
connection.onerror = function (error) {
    console.log('WebSocket Error ' + error);
};

// Log messages from the server
connection.onmessage = function (e) {
    var hands = JSON.parse(e.data);

    var lHandPosY = document.height * ( (100-hands.left_hand.verticalPercentage)/100);
    var lHandPosX = document.width/2 - hands.left_hand.distanceFromCenter;
    var rHandPosY = document.height * ( (100-hands.right_hand.verticalPercentage)/100);
    var rHandPosX = document.width/2 - hands.right_hand.distanceFromCenter;

    document.getElementById("leftHand").style.marginTop = lHandPosY + "px";
    document.getElementById("leftHand").style.marginLeft = lHandPosX + "px";
    document.getElementById("rightHand").style.marginLeft = rHandPosX + "px";
    document.getElementById("rightHand").style.marginTop = rHandPosY + "px";

    document.getElementById("leftHandNote").innerText = hands.left_hand.note;
    document.getElementById("rightHandNote").innerText = hands.right_hand.note;
    document.getElementById("leftHandNote").style.left = (lHandPosX-80) + "px"
    document.getElementById("leftHandNote").style.top = (lHandPosY) + "px";
    document.getElementById("rightHandNote").style.left = (rHandPosX+80) + "px"
    document.getElementById("rightHandNote").style.top = (rHandPosY) + "px";

    if (hands.left_hand.contact) {
        document.getElementById("leftHand").style.backgroundColor = "#00ffff";
    } else {
        document.getElementById("leftHand").style.backgroundColor = "#ff0000";
    }

    if (hands.right_hand.contact) {
        document.getElementById("rightHand").style.backgroundColor = "#00ffff";
    } else {
        document.getElementById("rightHand").style.backgroundColor = "#ff0000";
    }
};
