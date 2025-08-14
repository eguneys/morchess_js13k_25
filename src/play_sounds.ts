import { generate, play, sin, } from "./infernal_sfx";

const rnd = () => Math.random()

export let attack_sound = await generate(10, (i: number) => {
    return rnd() * sin(-i/ 500)
});


export { play } from './infernal_sfx'
play(attack_sound)