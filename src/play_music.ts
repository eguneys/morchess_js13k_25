import { Sequence } from "./tiny_music"

export let cx = new AudioContext()

let when = cx.currentTime
let tempo = 96

/*
let lead = [
    '-   e',
    'Bb3 e',
    'A3  e',
    'Bb3 e',
    'G3  e',
    'A3  e',
    'F3  e',
    'G3  e',

    'E3  e',
    'F3  e',
    'G3  e',
    'F3  e',
    'E3  e',
    'F3  e',
    'D3  q',

    '-   e',
    'Bb3 s',
    'A3  s',
    'Bb3 e',
    'G3  e',
    'A3  e',
    'G3  e',
    'F3  e',
    'G3  e',

    'E3  e',
    'F3  e',
    'G3  e',
    'F3  e',
    'E3  s',
    'F3  s',
    'E3  e',
    'D3  q'
  ]

let harmony = [
    '-   e',
    'D4  e',
    'C4  e',
    'D4  e',
    'Bb3 e',
    'C4  e',
    'A3  e',
    'Bb3 e',

    'G3  e',
    'A3  e',
    'Bb3 e',
    'A3  e',
    'G3  e',
    'A3  e',
    'F3  q',

    '-   e',
    'D4  s',
    'C4  s',
    'D4  e',
    'Bb3 e',
    'C4  e',
    'Bb3 e',
    'A3  e',
    'Bb3 e',

    'G3  e',
    'A3  e',
    'Bb3 e',
    'A3  e',
    'G3  s',
    'A3  s',
    'G3  e',
    'F3  q'
  ]
let bass = [
    'D3  q',
    '-   h',
    'D3  q',

    'A2  q',
    '-   h',
    'A2  q',

    'Bb2 q',
    '-   h',
    'Bb2 q',

    'F2  h',
    'A2  h'
  ]

  */

  let lead: string[] = []
  let harmony: string[] = []
  let bass: string[] = []

  /*
  lead = [
    'B4 q',
    'C5 q',
    'E5 h',

    'E5 q',
    'F5 q',
    'B4 h',

    'D5 q',
    'C5 q',
    'B4 h',

    'B4 q',
    'B4 q',
    'A4 h',

    'B4 q',
    'C5 q',
    'D5 h',

    'B4 q',
    'C5 q',
    'D5 h',

    'E5 q',
    'D5 q',
    'B4 h',

    'B4 q',
    'B4 q',
    'A4 h',
  ]

  harmony =  [
    '- q',
    'E4 h',
    'C4 q',

    'G4 h',
    'E4 q',
    '- q',

    '- h',
    'E4 q',
    'C4 q',

    'G4 q',
    'E4 h',
    '- q',
  ]

  bass = [

    '- h',
    '- q',
    'A2 q',

    '- h',
    '- q',
    'D3 q',

    '- h',
    '- q',
    'A2 q',
  ]
    */


  lead = [

    'G4 q',
    'A4 q',
    'B4 h',

    'B4 h',
    'A4 q',
    'F#4 q',

    'F#4 h',
    'F#4 h',

    'A4 h',
    'G4 q',
    'F#4 q',

    'E4 q',
    'D4 q',
    'C4 q',
    'F#4 q',

    'G4 h',
    'A4 q',
    'B4 q',

    'B4 q',
    'B4 q',
    'A4 h',

    'B4 q',
    'B4 q',
    'F#4 h',

    // repeat
    'G4 q',
    'A4 q',
    'B4 h',

    'B4 h',
    'A4 q',
    'F#4 q',

    'F#4 h',
    'F#4 h',

    'A4 h',
    'G4 q',
    'F#4 q',

    'E4 q',
    'D4 q',
    'C4 q',
    'F#4 q',

    'G4 h',
    'A4 q',
    'B4 q',

    'B4 q',
    'B4 q',
    'A4 h',

    'B4 q',
    'B4 q',
    'F#4 h',

    // B

    'E4 q',
    'F#4 q',
    'G4 h',

    'G4 h',
    'A4 q',
    'B4 q',

    'C5 q',
    'B4 q',
    'A4 h',

    'A4 h',
    'F#4 q',
    'G4 q',

    'E4 q',
    'F#4 q',
    'A4 q',
    'G4 q',



    'F#4 h',
    'G4 q',
    'B4 q',

    'C5 h',
    'A4 h',

    'D5 q',
    'C4 q',
    'B3 h',
  ]

  bass = [
    'G4 h',
    'D4 h',

    'G4 h',
    'D4 h',

    'B4 h',
    'D4 h',

    'D4 h',
    'G4 h',

    'C4 h',
    'D4 h',

    'G4 h',
    'E4 h',

    'A4 h',
    'D4 h',

    'G4 h',
    'D4 q',

    // repeat
    'G4 h',
    'D4 h',

    'G4 h',
    'D4 h',

    'B4 h',
    'D4 h',

    'D4 h',
    'G4 h',

    'C4 h',
    'D4 h',

    'G4 h',
    'E4 h',

    'A4 h',
    'D4 h',

    'G4 h',
    'D4 q',


    // B

    'E4 h',
    'D4 h',

    'G4 h',
    'C4 h',

    'A4 h',
    'C4 h',

    'B4 h',
    'D4 h',

    'D4 h',
    'B4 h',

    'D4 h',
    'B4 h',

    'C4 h',
    'G4 h',

    'E4 h',
    'G4 q',
  ]

  let sequence1 = new Sequence(cx, tempo, lead)
  let sequence2 = new Sequence(cx, tempo, harmony)
  let sequence3 = new Sequence(cx, tempo, bass)


  sequence1.staccato = 0.55
  sequence2.staccato = 0.55
  sequence3.staccato = 0.6
  sequence3.smoothing = 0.01


  sequence1.gain.gain.value = 0.07
  sequence2.gain.gain.value = 0.06 
  sequence3.gain.gain.value = 0.024


  // apply EQ Settings
sequence1.eqs.mid!.frequency.value = 800;
sequence1.eqs.mid!.gain.value = 3;

sequence2.eqs.mid!.frequency.value = 1200;
sequence2.eqs.mid!.gain.value = 3;

sequence3.eqs.bass!.gain.value = 6;
sequence3.eqs.bass!.frequency.value = 80;

sequence3.eqs.mid!.gain.value = -6;
sequence3.eqs.mid!.frequency.value = 500;

sequence3.eqs.treble!.gain.value = -2;
sequence3.eqs.treble!.frequency.value = 1400;

export function play_music() {
  //start the lead part immediately
  sequence1.play(when);
  // delay the harmony by 16 beats
  //sequence2.play(when + (60 / tempo) * 16);
  //sequence2.play(when)
  // start the bass part immediately
  sequence3.play(when);
}

export function stop_music() {
  sequence1.stop()
  sequence3.stop()
}