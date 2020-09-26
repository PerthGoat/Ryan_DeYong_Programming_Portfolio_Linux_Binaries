/*
 * This library handles sound synthesis for in-game music and sound effects
 * Handles many voices at once
 */
// global webaudio context for handling sound stuffs
// causes a not allowed to start warning but it works fine
var audioCtx = new (window.AudioContext)();
/*
 * Holds a note
 * Has frequency, duration, and wait time before starting the next note
 */
var Note = /** @class */ (function () {
    function Note(voice, duration, wait) {
        this.voice = voice;
        this.duration = duration;
        this.wait = wait;
    }
    return Note;
}());
var NOTE_FREQ;
(function (NOTE_FREQ) {
    NOTE_FREQ[NOTE_FREQ["C"] = 130.82] = "C";
    NOTE_FREQ[NOTE_FREQ["CS"] = 138.59] = "CS";
    NOTE_FREQ[NOTE_FREQ["D"] = 146.83] = "D";
    NOTE_FREQ[NOTE_FREQ["DS"] = 155.56] = "DS";
    NOTE_FREQ[NOTE_FREQ["E"] = 164.81] = "E";
    NOTE_FREQ[NOTE_FREQ["F"] = 174.61] = "F";
    NOTE_FREQ[NOTE_FREQ["FS"] = 185] = "FS";
    NOTE_FREQ[NOTE_FREQ["G"] = 196] = "G";
    NOTE_FREQ[NOTE_FREQ["GS"] = 207.65] = "GS";
    NOTE_FREQ[NOTE_FREQ["A"] = 220] = "A";
    NOTE_FREQ[NOTE_FREQ["AS"] = 233.08] = "AS";
    NOTE_FREQ[NOTE_FREQ["B"] = 246.94] = "B";
})(NOTE_FREQ || (NOTE_FREQ = {}));
var NOTE_DURATION;
(function (NOTE_DURATION) {
    NOTE_DURATION[NOTE_DURATION["QUARTER"] = 300] = "QUARTER";
    NOTE_DURATION[NOTE_DURATION["DOT"] = 150] = "DOT";
    NOTE_DURATION[NOTE_DURATION["HALF"] = 600] = "HALF";
    NOTE_DURATION[NOTE_DURATION["WHOLE"] = 1200] = "WHOLE";
})(NOTE_DURATION || (NOTE_DURATION = {}));
/* sound synthesizer class
 * holds sequences of notes and delays to be played back
 * format is {voice: 100, duration: 100, wait: 50}
 * this means it will play voice1 for 100ms and wait 50ms before starting the next note
 * that means voices can be combined, so it will still be playing for 50ms when the next note starts
 */
var SoundSynthesizer = /** @class */ (function () {
    // constructor takes in an optional notes parameter
    function SoundSynthesizer(notes) {
        this.current_note = 0; // reference to the current note being played on this sound synth
        if (notes == undefined) {
            this.Notes = [];
        }
        else {
            this.Notes = notes;
        }
    }
    // adds a note to the end of the notes array
    SoundSynthesizer.prototype.AddNote = function (note) {
        this.Notes.push(note);
    };
    // removes a note from the note array
    SoundSynthesizer.prototype.PopNote = function () {
        this.Notes.pop();
    };
    // recursively plays all of the notes one by one using timeouts
    SoundSynthesizer.prototype.Play = function (current_note) {
        var _this = this;
        if (current_note === void 0) { current_note = 0; }
        if (this.current_note > current_note && this.current_note != this.Notes.length - 1) {
            console.warn("Tried to play sound synthesizer, but it's already playing.");
            return;
        }
        this.current_note = current_note;
        var oscillator = audioCtx.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(this.Notes[this.current_note].voice, audioCtx.currentTime); // value in hertz
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        setTimeout(function () { oscillator.stop(); }, this.Notes[this.current_note].duration);
        if ((this.current_note + 1) < this.Notes.length) {
            setTimeout(function () { _this.Play(_this.current_note + 1); }, this.Notes[this.current_note].wait);
        }
    };
    return SoundSynthesizer;
}());
/// <reference path="sound_synth.ts" />
var sound_syn = new SoundSynthesizer();
sound_syn.AddNote(new Note(NOTE_FREQ.D, NOTE_DURATION.WHOLE * 5, 10));
// yankee doodle
sound_syn.AddNote(new Note(NOTE_FREQ.G, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.G, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.A, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.B, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.G, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.B, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.A, NOTE_DURATION.HALF, NOTE_DURATION.HALF + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.G, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.G, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.A, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.B, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.G, NOTE_DURATION.HALF, NOTE_DURATION.HALF + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.FS, NOTE_DURATION.HALF, NOTE_DURATION.HALF + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.G, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.G, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.A, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.B, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.C * 2, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.B, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.A, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.G, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.FS, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.D, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.E, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.FS, NOTE_DURATION.QUARTER, NOTE_DURATION.QUARTER + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.G, NOTE_DURATION.HALF, NOTE_DURATION.HALF + NOTE_DURATION.DOT));
sound_syn.AddNote(new Note(NOTE_FREQ.G, NOTE_DURATION.HALF, NOTE_DURATION.HALF + NOTE_DURATION.DOT));
function runSynth() {
    sound_syn.Play();
}
