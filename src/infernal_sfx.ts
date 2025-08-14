import { cx } from './play_music'

export const sin = (i: number) => Math.sin(i);
export const saw = (i: number) => ((i % 6.28) - 3.14) / 6.28;
export const sqr = (i: number) => clamp(Math.sin(i) * 1000, -1, 1);

async function _yield() {
    return new Promise((r => setTimeout(r, 0)))
}

export async function generate(duration: number, fn: (i: number) => number) {
    let sampleRate = cx.sampleRate
    let audioBuffer = cx.createBuffer(1, sampleRate * duration, sampleRate);
    let buffer = audioBuffer.getChannelData(0);
    let N = audioBuffer.length;
    for (let i = 0; i < N; i++) {
        buffer[i] = fn(i * 44100 / sampleRate) * (1 - i / N);
    }
    await _yield()
    return audioBuffer;
}

function clamp(v: number, min: number, max: number) {
    return Math.max(Math.min(v, max), min);
}

export function play(audioBuffer: AudioBuffer) {
    let source = cx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(cx.destination);
    source.start();
};
