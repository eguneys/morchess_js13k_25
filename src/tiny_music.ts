/* https://github.com/kevincennis/TinyMusic */
type NoteName = string

let enharmonics = 'B#-C|C#-Db|D|D#-Eb|E-Fb|E#-F|F#-Gb|G|G#-Ab|A|A#-Bb|B-Cb',
    middleC = 440 * Math.pow(Math.pow(2, 1 / 12), -9),
    numeric = /^[0-9.]+$/,
    octaveOffset = 4,
    space = /\s+/,
    num = /(\d+)/,
    offsets: Record<NoteName, number> = {};

// populate the offset lookup (note distance from C, in semitones)
enharmonics.split('|').forEach(function (val, i) {
    val.split('-').forEach(function (note) {
        offsets[note] = i;
    });
});


/*
 * Note class
 *
 * new Note ('A4 q') === 440Hz, quarter note
 * new Note ('- e') === 0Hz (basically a rest), eigth note
 * new Note ('A4 es') === 440Hz, dotted eighth note (eighth + sixteenth)
 * new Note ('A4 0.0125') === 440Hz, 32nd note (or any arbitrary
 * divisor/multiple of 1 beat)
 *
 */
export class Note {

    frequency: number
    duration: number

    constructor(str: string) {
        let couple = str.split(space)

        this.frequency = get_frequency(couple[0]) || 0

        this.duration = get_duration(couple[1]) || 0
    }
}


function get_frequency(name: string) {
    var couple = name.split(num),
        distance = offsets[couple[0]],
        octaveDiff = (parseInt(couple[1]) || octaveOffset) - octaveOffset,
        freq = middleC * Math.pow(Math.pow(2, 1 / 12), distance);
    return freq * Math.pow(2, octaveDiff);
}


function get_duration(symbol: string) {
    return numeric.test(symbol) ? parseFloat(symbol) :
        symbol.toLowerCase().split('').reduce(function (prev, curr) {
            return prev + (curr === 'w' ? 4 : curr === 'h' ? 2 :
                curr === 'q' ? 1 : curr === 'e' ? 0.5 :
                    curr === 's' ? 0.25 : 0);
        }, 0);
}

type EQConfig = 'bass' | 'mid' | 'treble'
type WaveType = 'square' | 'sine' | 'sawtooth'

export class Sequence {

    cx: AudioContext;
    tempo: number;
    notes: Note[];

    loop: boolean
    smoothing: number
    staccato: number

    eqs!: Record<EQConfig, BiquadFilterNode | undefined>
    gain!: GainNode

    osc: OscillatorNode | null
    wave_type?: WaveType

    constructor(
        cx: AudioContext, 
        tempo: number = 120, 
        notes: NoteName[] = [],
        loop = true) {
        this.cx = cx;
        this.tempo = tempo;
        this.osc = null

        this.create_fx_nodes()

        this.loop = loop
        this.smoothing = 0
        this.staccato = 0
        this.notes = []

        this.push(notes)

    }


    push(notes: NoteName[]) {
        this.notes.push(...notes.map(_ => new Note(_)))
    }

    create_fx_nodes() {
        var eq: [EQConfig, number][] = [['bass', 100], ['mid', 1000], ['treble', 2500]],
            prev = this.gain = this.cx.createGain();

        this.eqs  = { bass: undefined, mid: undefined, treble: undefined}
        eq.forEach((config) => {
            let filter = this.eqs[config[0]] = this.cx.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = config[1];
            prev.connect(prev = filter);
        });
        prev.connect(this.cx.destination);
        return this;
    }

    create_oscillator() {
        this.stop()
        this.osc = this.cx.createOscillator()

        this.osc.type = this.wave_type || 'square'

        this.osc.connect(this.gain)

        return this
    }

    private schedule_note(index: number, when: number) {
        var duration = 60 / this.tempo * this.notes[index].duration,
            cutoff = duration * (1 - (this.staccato || 0));

        this.set_frequency(this.notes[index].frequency, when);

        if (this.smoothing && this.notes[index].frequency) {
            this.slide(index, when, cutoff);
        }

        this.set_frequency(0, when + cutoff);
        return when + duration;
    }

    private get_next_note(index: number) {
        return this.notes[index < this.notes.length - 1 ? index + 1 : 0];
    }

    private get_slide_start_delay(duration: number) {
        return duration - Math.min(duration, 60 / this.tempo * this.smoothing);
    }

    private slide(index: number, when: number, cutoff: number) {
        var next = this.get_next_note(index),
            start = this.get_slide_start_delay(cutoff);
        this.set_frequency(this.notes[index].frequency, when + start);
        this.ramp_frequency(next.frequency, when + cutoff);
        return this;
    }

    private set_frequency(freq: number, when: number) {
        this.osc!.frequency.setValueAtTime(freq, when);
        return this;
    }

    private ramp_frequency(freq: number, when: number) {
        this.osc!.frequency.linearRampToValueAtTime(freq, when);
        return this;
    }

    play(when: number) {
        when = typeof when === 'number' ? when : this.cx.currentTime;

        this.create_oscillator();
        this.osc!.start(when);

        this.notes.forEach((_note: Note, i: number) => {
            when = this.schedule_note(i, when);
        });

        this.osc!.stop(when);
        this.osc!.onended = this.loop ? () => this.play(when) : null;

        return this;
    }

    stop() {
        if (this.osc) {
            this.osc.onended = null
            this.osc.disconnect()
            this.osc = null
        }
        return this
    }

}