import { Sequence } from "./tiny_music"

export let cx = new AudioContext()

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

let lead3 = []
let harmony3: string[] = []
let bass3: string[] = []

let lead3_a = [

  'C4 q',
  'E4 q',
  'G4 q',
  'C5 q',

  'E5 q',
  'D5 q',
  'C5 q',
  'G4 q',

  'A4 q',
  'G4 q',
  'F4 q',
  'E4 q',

  'C4 h',
  'G4 h',

  'C4 e',
  'D4 e',
  'E4 q',
  'G4 q',
  'D5 q',

  'E5 q',
  'D5 q',
  'C5 e',
  'B4 e',
  'A4 q',

  'A4 q',
  'G4 q',
  'F4 q',
  'E4 q',

  'C4 w'

]

let lead3_b = [

  'E4 q',
  'G4 q',
  'A4 q',
  'C5 q',

  'B4 h',
  'A4 q',
  'G4 q',

  'F4 q',
  'E4 q',
  'D4 q',
  'E4 q',


  'A4 w',
]

let bass3_a = [

  'C2 h',
  'G3 h',
  
  'C2 h',
  'E2 h',

  'F3 h',
  'C3 h',

  'C2 w',

  'C2 q',
  'E3 q',
  'G3 q',
  'G3 q',

  'G3 q',
  'G3 q',
  'E3 q',
  'C2 q',

  'C2 q',
  'E3 q',
  'G3 q',
  'G3 q',


  'C2 w',
]

let bass3_b = [
  'A3 h',
  'E3 h',

  'E3 h',
  'A3 h',

  'F3 h',
  'E3 h',

  'A3 w'
]

lead3 = [
  ...lead3_a,
  ...lead3_b,
  ...lead3_a
]


bass3 = [
  ...bass3_a,
  ...bass3_b,
  ...bass3_a
]

  let sequence3_1 = new Sequence(cx, tempo, lead3)
  let sequence3_2 = new Sequence(cx, tempo, harmony3)
  let sequence3_3 = new Sequence(cx, tempo, bass3)


  sequence3_1.staccato = 0.55
  sequence3_3.staccato = 0.6
  sequence3_3.smoothing = 0.01


  sequence3_1.gain.gain.value = 0.07
  sequence3_2.gain.gain.value = 0.07
  sequence3_3.gain.gain.value = 0.024


  // apply EQ Settings
sequence3_1.eqs.mid!.frequency.value = 800;
sequence3_1.eqs.mid!.gain.value = 3;

sequence3_3.eqs.bass!.gain.value = 6;
sequence3_3.eqs.bass!.frequency.value = 80;

sequence3_3.eqs.mid!.gain.value = -6;
sequence3_3.eqs.mid!.frequency.value = 500;

sequence3_3.eqs.treble!.gain.value = -2;
sequence3_3.eqs.treble!.frequency.value = 1400;

export function play_music3() {
  let when = cx.currentTime
  sequence3_1.play(when)
  //sequence3_2.play(when)
  sequence3_3.play(when)
}

  let lead_a = [

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


  ]

  let lead_b = [

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

  let bass_a = [
    'G3 h',
    'D3 h',

    'G3 h',
    'D3 h',

    'B3 h',
    'D3 h',

    'D3 h',
    'G3 h',

    'C3 h',
    'D3 h',

    'G3 h',
    'E3 h',

    'A3 h',
    'D3 h',

    'G3 h',
    'D3 q',


  ]

  let bass_b = [

    'E3 h',
    'D3 h',

    'G3 h',
    'C3 h',

    'A3 h',
    'C3 h',

    'B3 h',
    'D3 h',

    'D3 h',
    'B3 h',

    'D3 h',
    'B3 h',

    'C3 h',
    'G3 h',

    'E3 h',
    'G3 q',

  ]

  let lead = [
    ...lead_a,
    ...lead_a,
    ...lead_b,
    ...lead_a
  ]

  let bass = [
    ...bass_a,
    ...bass_a,
    ...bass_b,
    ...bass_a
  ]

  let sequence1 = new Sequence(cx, tempo, lead)
  let sequence3 = new Sequence(cx, tempo, bass)


  sequence1.staccato = 0.55
  sequence3.staccato = 0.6
  sequence3.smoothing = 0.01


  sequence1.gain.gain.value = 0.07
  sequence3.gain.gain.value = 0.024


  // apply EQ Settings
sequence1.eqs.mid!.frequency.value = 800;
sequence1.eqs.mid!.gain.value = 3;

sequence3.eqs.bass!.gain.value = 6;
sequence3.eqs.bass!.frequency.value = 80;

sequence3.eqs.mid!.gain.value = -6;
sequence3.eqs.mid!.frequency.value = 500;

sequence3.eqs.treble!.gain.value = -2;
sequence3.eqs.treble!.frequency.value = 1400;

export function play_music() {
  let when = cx.currentTime
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

  sequence2_1.stop()
  sequence2_3.stop()

  sequence3_1.stop()
  sequence3_2.stop()
  sequence3_3.stop()
}



let lead2: string[] = []
let bass2: string[] = []

let lead2_a = [
  'A4 q',
  'B4 q',
  'C4 h',

  'D4 q',
  'D#4 q',
  'E4 h',

  'G4 q',
  'F#4 q',
  'E4 h',

  'C4 q',
  'D4 q',
  'B4 h',

  'E4 q',
  'F#4 q',
  'G#4 h',

  'A4 hs',
  '- q',

  'C4 q',
  'B4 q',
  'G4 h',


  'A4 w',
]

let lead2_b = [

  'E4 q',
  'F#4 q',
  'G#4 h',

  'A4 h',
  'B4 q',
  'A4 q',

  'C4 qs',
  'D4 e',
  'F#4 q',
  'E4 q',


  'G4 h',
  'A4 h',

  'B4 q',
  'A4 q',
  'G#4 q',
  'E4 q',

  'F4 h',
  'D#4 q',
  'E4 q',

  'C4 hs',
  '- q',

  'A4 q',
  '- q',
  '- h'
]

lead2 = [
  ...lead2_a,
  ...lead2_a,
  ...lead2_b,
  ...lead2_a
]


let bass2_a = [

  'A3 q',
  'E3 q',
  'A3 q',
  'C3 q',

  'E3 q',
  'G#3 q',
  'B3 q',
  'D3 q',


  'D3 q',
  'A3 q',
  'F#3 h',

  'B3 q',
  'F3 q',
  'D3 h',

  'F3 q',
  'C3 q',
  'F3 h',


  'A3 q',
  'C#3 q',
  'E3 h',

  'G3 q',
  'D3 q',
  'G3 h',

  'A3 q',
  'E3 q',
  'A3 q',
  'C3 q',


]

let bass2_b = [

  'C3 q',
  'B3 q',
  'F3 q',
  'D3 q',

  'E3 q',
  'G#3 q',
  'B3 q',
  'D3 q',

  'A3 q',
  'C3 q',
  'E3 h',

  'F3 q',
  'A3 q',
  'C3 h',

  'D3 q',
  'A3 q',
  'F3 h',

  'E3 q',
  'G#3 q',
  'B3 h',

  'A3 q',
  'E3 q',
  'A3 q',
  'C3 q',

  'A3 h',
  'A3 h',

]

bass2 = [
  ...bass2_a,
  ...bass2_a,
  ...bass2_b,
  ...bass2_a
]



export function play_music2() {
  let when = cx.currentTime
  sequence2_1.play(when);
  sequence2_3.play(when);
}

let sequence2_1 = new Sequence(cx, tempo, lead2)
let sequence2_3 = new Sequence(cx, tempo, bass2)

sequence2_1.gain.gain.value = 0.07
sequence2_3.gain.gain.value = 0.024

sequence2_1.staccato = 0.55
sequence2_3.staccato = 0.6
sequence2_3.smoothing = 0.01

