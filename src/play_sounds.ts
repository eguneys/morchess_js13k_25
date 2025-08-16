import { generate, play, saw, sin, sqr, } from "./infernal_sfx";

const rnd = () => Math.random()

let chapter = await generate(.30, (i: number) => {
    return sin(i / 44100 * 2 * Math.PI * 440 * saw(i/44100 * 2 * Math.PI * 440) * 0.1) * 0.1; 
});

let next = await generate(.20, (i: number) => {
    return sqr(i / 44100 * 2 * Math.PI * 440 * saw(i/44100 * 2 * Math.PI * 440 * i / 100) * 0.1) * 0.1; 
});

let correct = await generate(3, (i: number) => {
    if (i / 44100 % 0.2 < 0.1) {
        return sin(rnd() * 0.05 + i * 2 * Math.PI * 140 / 44100) * 0.5
    } else if (i / 44100 < 0.6) {
        return sin(saw(i / 44100 * 2 * Math.PI * 840) * 2 * Math.PI * 340 / 44100) * 0.2
    } else {
        return sin(i * 2 * Math.PI * 840 / 44100) * 0.1
    }
});

let drop = await generate(.12, (i: number) => {
    if (i / 44100 % 0.2 < 0.1) {
        return sin(rnd() * 0.05 + i * 2 * Math.PI * 140 / 44100) * 0.5
    } else if (i / 44100 < 0.6) {
        return sin(i / 44100 * 2 * Math.PI * (100 + i * 0.1)) * 0.2
    } else {
        return sin(i * 2 * Math.PI * 840 / 44100) * 0.1
    }
});



export const sounds = {
    drop,
    correct,
    next,
    chapter
}

export { play } from './infernal_sfx'
