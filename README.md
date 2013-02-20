uprightSpass
============

Motion Controlled Upright Air Bass - no bass, just space!


Install
=======

It's a little hairy to install this.  We're in demo territory here, but it requires a Node.js Midi library to talk to your instruments, and a socket client to talk to your browser.  The browser piece isn't necessary, but its nice to have a heads up display to give you visual feedback on what your hands are doing.

So for those:

npm install midi

and

npm install websocket

The motion controller/depth cam piece relies on OpenNI/NiTE and my custom written Node wrapper around it.  This can be found at https://github.com/bengfarrell/node-sweatintotheweb and as per the readme depends on OpenNI 2.0 and NiTE 2.0 to be installed.


What it does
============

Stand up in front of the camera.  Pretend you have an upright bass in the exact center of your body.  Smack at the air in the center line - boom, a MIDI event is fired off.  Both hands work.  The higher your hand, the higher the note.  I've restricted playback to the key of D# Minor.  You can change this in code.

If you choose to startup a browser with the contents of the clientside folder's index.html file, you'll get visual feedback on where your hands are in relation to the bass.  You'll also have floating text areas to tell you on what note each hand is resting.


Oddities
========

It's a little hard to play!  I think its a combination of the fact that you rarely use your entire arm to play an instrument, there's no tactile feedback, and you can kinda fudge hitting a couple notes with no tactile feedback.

