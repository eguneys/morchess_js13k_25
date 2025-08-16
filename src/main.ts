import './style.css'
import sprite_bg_png from '../design/sprites_with_bg_alpha_working.png'
import { Loop } from './loop_input'
import { DragHandler } from './drag'
import { play_music, stop_music } from './play_music'
import { box_intersect, type XY, type XYWH } from './util'
import { play, sounds } from './play_sounds'

import { fen_to_scontext, mor_short, parse_piece, print_a_piece, zero_attacked_by_lower, zero_attacked_by_upper, type AttackPiece, type FEN, type Pieces } from './chess/mor_short'
import type { Square } from './chess/types'
import { squareFile, squareFromCoords, squareRank } from './chess/util'

console.log(mor_short("8/8/4r3/r1n5/1k1B4/6Np/1PP1n3/2KRR3 w - - 0 1").map(print_a_piece))


function load_image(src: string) {
    let image = new Image()
    return new Promise<HTMLImageElement>(resolve => {
        image.onload = () => resolve(image)
        image.src = src
    })
}

let bg_atlas = await load_image(sprite_bg_png)

let c: HTMLCanvasElement
let cx: CanvasRenderingContext2D

let f: HTMLCanvasElement
let fx: CanvasRenderingContext2D

function init_canvas() {
    c = document.createElement('canvas')

    //c.width = 320
    //c.height = 180

    c.width = 480
    c.height = 270
    c.classList.add('pixelated')

    cx = c.getContext('2d')!
    cx.imageSmoothingEnabled = false

    cx.fillStyle = 'black'
}

function init_text() {
    f = document.createElement('canvas')

    f.width = 1920
    f.height = 1080
    

    fx = f.getContext('2d')!
}

function sspr8(s: number, ii: number, x: number, y: number) {
    for (let i = 0; i < ii; i++) {
        spr(s + i, x + i * 8 * 2, y, 2)
    }
}

function spr(i: number, x: number, y: number, scale_x = 1, scale_y = scale_x) {

    x = Math.floor(x)
    y = Math.floor(y)

    let w
    let sx
    let sy

    if (i < 4) {
        w = 32
        sx = i * 32
        sy = 0
    } else if (i < 28) {
        w = 16
        i -= 4
        sx = (i % 8) * 16
        sy = 32 + Math.floor(i / 8) * 16
    } else {
        w = 8
        i -= 28
        sx = (i % 16) * 8
        sy = 80 + Math.floor(i / 16) * 8
    }

    cx.drawImage(bg_atlas, sx, sy, w, w, x, y, w * scale_x, w * scale_y)
}

function render_info(text: [string, string]) {
    let sx = 1920 / 320
    let sy = 1080 / 160
    fx.font = '42px Arial'
    fx.shadowColor = 'black'
    fx.shadowBlur = 4
    let x = 218 * sx
    let y = 119 * sy
    wrap_text_fx(text[0], x, y, 600, 60)
    fx.font = '28px Arial'
    x = 218 * sx
    y = 154 * sy
    wrap_text_fx(text[1], x, y, 600, 60)
}

function wrap_text_fx(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    // Split the text into an array of words
    const words = text.split(' ');
    let line = '';
    let lineY = y;

    // Iterate through the words to build lines
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = fx.measureText(testLine);
        const testWidth = metrics.width;

        // Check if the next word makes the line too long
        if (testWidth > maxWidth && n > 0) {
            // Draw the current line and move to the next line
            fx.fillText(line, x, lineY);
            line = words[n] + ' ';
            lineY += lineHeight;
        } else {
            // Add the word to the current line
            line = testLine;
        }
    }

    // Draw the last line of text
    fx.fillText(line, x, lineY);
}

function _render() {

    fx.clearRect(0, 0, 1920, 1080)

    cx.fillRect(0, 0, 320, 180)


    spr(110, 0, 0, 320)


    let off_x = 10
    let off_y = 3 * 8
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let black = (i + j) % 2 === 1 ? 1 : 0;
            spr(108 + black, off_x + i * 3.5 * 8, off_y + j * 3.5 * 8, 3.5)
        }
    }

    off_x = 10
    off_y = 0

    spr(111, off_x, off_y, 3.5 * 8, 3)

    off_y = 3 * 8 + 8 * 3.5 * 8

    spr(111, off_x, off_y, 3.5 * 8, 3)

    for (let p of pp) {
        spr(piece_to_i(p.piece), ...p.pos, 3)
        if (p.piece.match(/2/)) {
            spr(82, ...p.pos, 3)
        }



        if (p.is_hovering) {
            spr(112, ...p.pos, 3)
        }
    }

    spr(111, 318, 188, 20, 10) 

    if (info_end) {
        render_info(info_end)
    } else if (info_well) {
        render_info(info_well)
    } else if (info_call) {
        render_info(info_call)
    } else {
        render_info(info_welcome)
    }


    spr(111, 238, 2, 30, 23)

    let ih = rule_infos.find(_ => _.is_hovering)
    if (ih) {
        let [x, y, w, h] = ih.bb
        cx.strokeRect(x, y, w, h)


        for (let xy of ih.circles) {
            spr(112, ...xy, 3)
        }

        for (let ab of ih.no_arrows) {
            s_line(ab[0], ab[1], 'red')
        }
        for (let ab of ih.yes_arrows) {
            s_line(ab[0], ab[1], 'green')
        }

    }

    for (let rr of rule_renders) {
        spr(rr[0], rr[1], rr[2])
    }

    if (drag_hp) {
        spr(piece_to_i(drag_hp.piece), ...drag_hp.pos, 3)
    }

    if (info_well !== undefined) {
        let hover_y = is_hovering_next && t_flash % 500 < 200 ? 2 : 0
        sspr8(119, 5, 400, 246 + hover_y)
    }


    render_nav()


    spr(28, ...cursor)

    if (is_game_over) {

        let wiggle = Math.sin(t_flash * 0.008) * 80
        let wiggle_y1 = Math.sin(t_flash * 0.008) * 80
        let wiggle_y2 = Math.sin(t_flash * 0.003) * 80

        fx.font = 'bold 180px Arial'
        fx.shadowColor = 'purple'
        fx.shadowBlur = 10
        fx.lineWidth = 4
        fx.strokeStyle = 'purple'
        fx.strokeText('Mor', 200 + wiggle, 400 + wiggle_y1)
        fx.strokeText('Chess', 1000 - wiggle, 400 + wiggle_y1)

        fx.fillStyle= 'white'
        fx.shadowBlur = 0
        fx.fillText('Mor', 200 + wiggle, 400 + wiggle_y1)
        fx.fillText('Chess', 1000 - wiggle, 400 + wiggle_y1)


        fx.fillStyle= 'black'

        fx.fillText('Black', 200, 800 - wiggle_y2 * 0.1)
        fx.fillText('Cat', 800, 800 - wiggle_y2 * 0.1)
    }
}

function render_nav() {
    let sx = scale_x
    let sy = scale_y
    spr(111, 238, 188, 9.8, 10) 

    let level = levels[i_level]
    fx.font = 'bold 64px Arial'
    fx.fillText(`${level.chapter}-${level.level}`, 265 * sx, 204 * sy)

    let edge = t_flash % 500 < 250 ? 3 : 0
    let left_edge = is_hovering_left ? edge : 0
    let right_edge = is_hovering_right ? edge : 0

    spr(117, 242 - left_edge, 190, 2)
    spr(118, 296 + right_edge, 190, 2)


    spr(i_expr + (levels[i_level].is_revealed ? 16 : levels[i_level].is_solved ? 8 : 0), 250, 214, 3)

    spr(is_muted === undefined || is_muted ? 116 : 115, 298, 214, 2)
}


let cat_box: XYWH = [250, 214, 48, 48]
let audio_box: XYWH = [298, 214, 16, 16]

let nb_matched0: number
let t_neutral: number
let i_expr: number

let t_reveal: number

const Exprs = {
    neutral: 4,
    happy: 5,
    sad: 6,
    angry: 7,
    surprised: 8,
    sleepy: 9,
    playful: 10,
} as const;

const left_box: XYWH = [242, 190, 16, 16]
const right_box: XYWH = [296, 190, 16, 16]

const scale_x = 1920 / 480
const scale_y = 1080 / 270
function s_line(a: XY, b: XY, color: string) {
    fx.lineWidth = 10
    fx.strokeStyle = color
    fx.lineCap = 'round'
    fx.beginPath()
    fx.moveTo(a[0] * scale_x, a[1] * scale_y)
    fx.lineTo(b[0] * scale_x, b[1] * scale_y)
    fx.stroke()
}

const next_box: XYWH = [400, 246, 80, 16]

function aa_match(a: AttackPiece, b: AttackPiece) {
    return print_a_piece(a) === print_a_piece(b)
}

/*
function aa_match_old(a: AttackPiece, b: AttackPiece) {

    if (a.p1 !== b.p1) {
        return false
    }

    if (a.attacks.length !== b.attacks.length) {
        return false
    }
    for (let aa of a.attacks) {
        if (!a.attacks.find(_ => _ === aa)) {
            return false
        }
    }
    if (a.attacked_by.length !== b.attacked_by.length) {
        return false
    }
    for (let aa of a.attacked_by) {
        if (!a.attacked_by.find(_ => _ === aa)) {
            return false
        }
    }

    if (a.blocks.length !== b.blocks.length) {
        return false
    }
    for (let bb of a.blocks) {
        if (!b.blocks.find(_ => _[0] === bb[0] && _[1] === bb[1])) {
            return false
        }
    }
    if (a.blocked_attacks.length !== b.blocked_attacks.length) {
        return false
    }
    for (let bb of a.blocked_attacks) {
        if (!b.blocked_attacks.find(_ => _[0] === bb[0] && _[1] === bb[1])) {
            return false
        }
    }
    if (a.blocked_attacked_by.length !== b.blocked_attacked_by.length) {
        return false
    }
    for (let bb of a.blocked_attacked_by) {
        if (!b.blocked_attacked_by.find(_ => _[0] === bb[0] && _[1] === bb[1])) {
            return false
        }
    }

    return true
}
    */

const build_render_spr = (i: number, x: number, y: number) => rule_renders.push([i, x, y, 0])
const build_render_info = (info: [string, string], x: number, y: number, w: number, h: number, circles: XY[], yes_arrows: [XY, XY][], no_arrows: [XY, XY][]) => rule_infos.push({
    info,
    bb: [x, y, w, h],
    is_hovering: false,
    circles,
    yes_arrows,
    no_arrows
})



function build_render_a(a: AttackPiece, x: number, y: number) {

    const find_circle_for_p = (p: Pieces) =>  pp.filter(_ => _.piece === p && pos2board_file_rank(_.pos) !== undefined).map(_ => _.pos)
    const find_arrow_for_pq = (p: Pieces, q: Pieces) => {
        let a = pp.filter(_ => _.piece === p && pos2board_file_rank(_.pos) !== undefined).map(_ => _.pos)[0]
        let b = pp.filter(_ => _.piece === q && pos2board_file_rank(_.pos) !== undefined).map(_ => _.pos)[0]
        if (a && b) {
            let res: [XY, XY] = [[a[0] + 1.5 * 8, a[1] + 1.5 * 8], [b[0] + 1.5 * 8, b[1] + 1.5 * 8]]
            return [res]
        }
        return []
    }


    let circles: XY[] = []
    let yes_arrows: [XY, XY][] = []
    let no_arrows: [XY, XY][] = []

    const ipr = (info: [string, string], x: number, y: number, w: number, h: number) => {
        build_render_info(info, x, y, w, h, circles, yes_arrows, no_arrows)
        circles = []
        yes_arrows = []
        no_arrows = []
    }

    const spr = build_render_spr

        spr(piece_to_i(a.p1), x + 4, y + 4)
        if (a.p1.match(/2/)) {
            spr(82, x + 4, y + 4)
        }
        circles = find_circle_for_p(a.p1)
        ipr(infos.yes_piece(a.p1), x + 2, y + 2, 12, 12)


        x += 8

        spr(39, x + 4, y + 4)
        x += 8

        let aaa = pp_attacks()

        if (zero_attacked_by_lower(a)) {

            let aa = aaa.find(_ => _.p1 === a.p1)
            let abb = aa?.attacked_by.filter(_ => _.toLowerCase() === _) ?? []
            abb = abb.concat(aa?.blocks.map(_ => _[0]).filter(_ => _.toLowerCase() === _) ?? [])
            no_arrows = [...abb.flatMap(b => find_arrow_for_pq(a.p1, b))]

            if (a.p1.toLowerCase() === a.p1) {
                spr(33, x + 4, y + 4)

            } else {
                spr(32, x + 4, y + 4)
            }

            circles = find_circle_for_p(a.p1)
            ipr(infos.zero_attacked_by_lower(a.p1), x + 2, y + 2, 12, 12)

            x += 12
        }

        if (zero_attacked_by_upper(a)) {
            let aa = aaa.find(_ => _.p1 === a.p1)
            let abb = aa?.attacked_by.filter(_ => _.toLowerCase() !== _) ?? []
            abb = abb.concat(aa?.blocks.map(_ => _[0]).filter(_ => _.toLowerCase() !== _) ?? [])
            no_arrows = [...abb.flatMap(b => find_arrow_for_pq(a.p1, b))]
            if (a.p1.toLowerCase() === a.p1) {
                spr(32, x + 4, y + 4)

            } else {
                spr(33, x + 4, y + 4)
            }


            circles = find_circle_for_p(a.p1)
            ipr(infos.zero_attacked_by_upper(a.p1), x + 2, y + 2, 12, 12)
            x += 12
        }

        for (let aa of a.attacks) {

            spr(35, x + 2, y+ 4)

            let _aa = aaa.find(_ => _.p1 === a.p1)
            let abb = _aa?.attacks.filter(_ => _ === aa) ?? []
            if (abb.length === 0) {
                no_arrows = [...find_arrow_for_pq(a.p1, aa)]
            } else {
                yes_arrows = [...find_arrow_for_pq(a.p1, aa)]
            }


            ipr(infos.attacks(a.p1, aa), x + 4, y + 2, 14, 12)
            x += 5
            spr(piece_to_i(aa), x + 4, y + 4)
            if (aa.match(/2/)) {
                spr(82, x + 4, y + 4)
            }
            x += 5 + 4
        }


        for (let aa of a.attacked_by) {

            spr(piece_to_i(aa), x + 4, y + 4)
            if (aa.match(/2/)) {
                spr(82, x + 4, y + 4)
            }

            let _aa = aaa.find(_ => _.p1 === a.p1)
            let abb = _aa?.attacked_by.filter(_ => _ === aa) ?? []
            if (abb.length === 0) {
                no_arrows = [...find_arrow_for_pq(a.p1, aa)]
            } else {
                yes_arrows = [...find_arrow_for_pq(a.p1, aa)]
            }



            circles = find_circle_for_p(a.p1)
            ipr(infos.attacked_by(a.p1, aa), x + 4, y + 2, 14, 12)
            x += 5 + 4
            spr(34, x + 2, y+ 4)

            x += 5
        }

        for (let bb of a.blocks) {
            spr(piece_to_i(bb[1]), x + 4, y + 4)
            if (bb[1].match(/2/)) {
                spr(82, x + 4, y + 4)
            }

            let _aa = aaa.find(_ => _.p1 === a.p1)
            let abb = _aa?.blocks.filter(_ => _[0] === bb[0] && _[1] === bb[1]) ?? []
            if (abb.length === 0) {
                no_arrows = [...find_arrow_for_pq(bb[0], bb[1]), ...find_arrow_for_pq(a.p1, bb[1])]
            } else {
                yes_arrows = [...find_arrow_for_pq(bb[0], bb[1])]
            }



            ipr(infos.blocks(a.p1, ...bb), x + 4, y + 2, 24, 12)
            x += 5 + 4
            spr(36, x + 2, y + 4)
            x += 5
            spr(piece_to_i(bb[0]), x + 4, y + 4)
            if (bb[0].match(/2/)) {
                spr(82, x + 4, y + 4)
            }
            x += 5 + 4
        }


        for (let bb of a.blocked_attacks) {
            spr(piece_to_i(bb[1]), x + 4, y + 4)
            if (bb[0].match(/2/)) {
                spr(82, x + 4, y + 4)
            }

            let _aa = aaa.find(_ => _.p1 === a.p1)
            let abb = _aa?.blocked_attacks.filter(_ => _[0] === bb[0] && _[1] === bb[1]) ?? []
            if (abb.length === 0) {
                no_arrows = [...find_arrow_for_pq(bb[0], bb[1]), ...find_arrow_for_pq(a.p1, bb[1])]
            } else {
                yes_arrows = [...find_arrow_for_pq(a.p1, bb[1])]
            }



            ipr(infos.blocked_attacks(a.p1, bb[1], bb[0]), x + 4, y + 2, 24, 12)
            x += 5 + 4
            spr(37, x + 2, y + 4)
            x += 5
            spr(piece_to_i(bb[0]), x + 4, y + 4)
            if (bb[0].match(/2/)) {
                spr(82, x + 4, y + 4)
            }
            x += 5 + 4
        }

        for (let bb of a.blocked_attacked_by) {
            spr(piece_to_i(bb[1]), x + 4, y + 4)
            if (bb[1].match(/2/)) {
                spr(82, x + 4, y + 4)
            }


            let _aa = aaa.find(_ => _.p1 === a.p1)
            let abb = _aa?.blocked_attacked_by.filter(_ => _[0] === bb[0] && _[1] === bb[1]) ?? []
            if (abb.length === 0) {
                no_arrows = [...find_arrow_for_pq(bb[0], bb[1]), ...find_arrow_for_pq(a.p1, bb[0])]
            } else {
                yes_arrows = [...find_arrow_for_pq(a.p1, bb[0])]
            }

            abb = _aa?.attacked_by.filter(_ => _ === bb[0]).map(_ => [_, _]) ?? []
            abb = abb.concat(_aa?.blocks.filter(_ => _[0] === bb[0]) ?? [])

            if (abb.length > 0) {
                no_arrows = [...find_arrow_for_pq(a.p1, bb[0])]
            }


            ipr(infos.blocked_attacked_by(a.p1, bb[0], bb[1]), x + 4, y + 2, 24, 12)
            x += 5 + 4
            spr(38, x + 2, y + 4)
            x += 5
            spr(piece_to_i(bb[0]), x + 4, y + 4)
            if (bb[0].match(/2/)) {
                spr(82, x + 4, y + 4)
            }
            x += 5 + 4
        }

        return [x, y]
}

const infos: Record<string, any> = {
    welcome0: ['welcome to mor chess; drag pieces onto the board, but there are some rules above. hover over them for details.', 'drag a piece off the board to remove it.'],
    welcome1: ['each chapter; proressively reveals more pieces of a single position.', 'call out the cat 3 times, if you get in a mess ;)'],
    welcome2: ['chess tactics; are born out of relationships.', 'our job is to entangle them.'],
    welcome3: ['rules are tools to an end.', 'look here, just enough to keep the cats happy.'],
    well_done: ['Congratulations, you satisfied all rules. Time to go deeper.', 'Click Next to continue.'],
    well_end: ['the end; chess is fascinating isn\'t it, go play some chess.', 'Thank\'s for playing'],
    equals(matched: boolean) {
        let has_matched = matched ? 'has matched correctly.' : 'has not been matched yet.'
        return ['left side is the goal, right side is the board; your goal is to match them equal.', `this rule ${has_matched}`]
    },
    no_piece(piece: Pieces) {
        let p1 = pretty_piece(piece)
        return [`${p1} hasn't been placed yet.`, '']
    },
    yes_piece(piece: Pieces) {
        let p1 = pretty_piece(piece)
        return [`A ${p1} on the board.`, '']
    },
    zero_attacked_by_lower(piece: Pieces) {
        let attackers = piece.toLowerCase() === piece ? 'defenders' : 'attackers'
        let p1 = pretty_piece(piece)
        return [`${p1} has zero ${attackers}.`, '']
    },
    zero_attacked_by_upper(piece: Pieces) {
        let attackers = piece.toLowerCase() === piece ? 'attackers' : 'defenders'
        let p1 = pretty_piece(piece)
        return [`${p1} has zero ${attackers}.`, '']
    },
    attacks(piece: Pieces, attacks: Pieces) {

        let p1 = pretty_piece(piece)
        let a1 = pretty_piece(attacks)

        return [`${p1} is ${attacking(piece, attacks)} ${a1}.`, `${a1} shouldn't be blocking an attack of ${p1}.`]
    },
    attacked_by(piece: Pieces, attacks: Pieces) {

        let p1 = pretty_piece(piece)
        let a1 = pretty_piece(attacks)

        return [`${p1} is ${attacked(piece, attacks)} by ${a1}.`, ``]
    },
    blocks(piece: Pieces, a: Pieces, b: Pieces) {

        let p1 = pretty_piece(piece)
        let a1 = pretty_piece(a)
        let b1 = pretty_piece(b)

        return [`${p1} blocks ${a1} ${attacking(a, b)} ${b1}.`, ``]

    },
    blocked_attacks(piece: Pieces, a: Pieces, b: Pieces) {
        let p1 = pretty_piece(piece)
        let a1 = pretty_piece(a)
        let b1 = pretty_piece(b)

        return [`${p1} is ${attacking(piece, a)} ${a1}, but that's blocked by ${b1}.`, ``]
    },
    blocked_attacked_by(piece: Pieces, a: Pieces, b: Pieces) {
        let p1 = pretty_piece(piece)
        let a1 = pretty_piece(a)
        let b1 = pretty_piece(b)

        return [`${p1} is ${attacked(piece, a)} by ${a1}, but that's blocked by ${b1}.`, ``]
    }
}

const attacking = (a: Pieces, b: Pieces) => (a.toLowerCase() === a) === (b.toLowerCase() === b) ? 'defending' : 'attacking'
const attacked = (a: Pieces, b: Pieces) => (a.toLowerCase() === a) === (b.toLowerCase() === b) ? 'defended' : 'attacked'

function pretty_piece(p: Pieces) {

    let p1 = parse_piece(p)
    let two = p.match(/2/) ? '2' :''

    return p1.role[0].toUpperCase() + p1.role.slice(1) + two
}

function piece_to_i(p: Pieces) {
    let p1 = parse_piece(p)

    let role_to_i = {
        'pawn': 0,
        'rook': 1,
        'bishop': 2,
        'knight': 3,
        'queen': 4,
        'king': 5
    }

    return 76+ role_to_i[p1.role] + (p1.color === 'white' ? 16 : 0)
}

function _update(delta: number) {

    t_reveal -= delta
    if (t_reveal < 0) {
        t_reveal = 0
    }
    if (t_reveal > 1000) {
        t_reveal = 0
        if (!levels[i_level].is_revealed) {
            levels[i_level].is_revealed = true
            pp_reveal_level()
        }
    }

    t_neutral -= delta
    t_flash += delta

    if (t_neutral < 0) {

        if (t_flash % 10000 < 2000) {
            i_expr = Exprs['sleepy']
        } else {
            i_expr = Exprs['neutral']
        }
    }

    if (drag.is_hovering) {
        cursor = drag.is_hovering

        for (let p of pp) {
            p.is_hovering = false
        }

        for (let p of pp) {
            if (box_intersect(pp_box(p), cursor_box(cursor))) {
                p.is_hovering = true
                break
            }
        }

        if (drag_hp !== undefined) {
            drag_hp.pos = [cursor[0] - 4, cursor[1] - 4]
        } else {

            for (let i of rule_infos) {
                i.is_hovering = false
            }

            for (let i of rule_infos) {
                if (box_intersect(i.bb, cursor_box(cursor))) {
                    i.is_hovering = true
                }
            }

        }


        is_hovering_cat = box_intersect(cat_box, cursor_box(cursor))

        is_hovering_next = info_well !== undefined && box_intersect(next_box, cursor_box(cursor))

        is_hovering_left = box_intersect(left_box, cursor_box(cursor))
        is_hovering_right = box_intersect(right_box, cursor_box(cursor))


        if (is_hovering_cat) {
            if (t_neutral < 0) {
                i_expr = Exprs['playful']
                t_neutral = 260
            }
        }
    }

    if (drag.is_just_down) {
        let hp = pp.find(_ => _.is_hovering)
        if (hp) {
            hp.is_dragging = true
            drag_hp = make_pp(hp.piece, hp.pos)
            let xy = pos2board_file_rank(hp.pos)
            if (xy) {
                drag_hp.orig = hp
            }
        }
    }

    if (drag.is_up) {
        if (is_muted === undefined && !is_music_playing) {
            is_muted = false
            play_music()
        }
        if (drag_hp) {

            if (drag_hp.orig) {
                let xy = drag_hp.orig.pos
                pp = pp.filter(_ => !(_.pos[0] === xy[0] && _.pos[1] === xy[1]))
            }


            let fr = pos2board_file_rank(drag.is_up)
            if (fr) {
                let xy = pos_from_fr(fr)

                pp = pp.filter(_ => !(_.pos[0] === xy[0] && _.pos[1] === xy[1]))
                pp.push(make_pp(drag_hp.piece, xy))



            }

            pp_fix_twos()
            drag_hp = undefined
            is_dirty_rule_render = true
            i_expr = Exprs['surprised']
            t_neutral = 3000

            play(sounds['drop'])
        }


        if (is_hovering_next) {
            
            if (i_level === levels.length - 1) {
                go_nav(0)
            } else {
                go_nav(1)
            }
        }

        if (is_hovering_left) {
            go_nav(-1)
        }
        if (is_hovering_right) {
            go_nav(1)
        }

        if (box_intersect(audio_box, cursor_box(drag.is_up))) {
            is_muted = !is_muted
            if (is_muted) {
                stop_music()
            } else {
                play_music()
            }
        }

        if (is_hovering_cat) {
            i_expr = Exprs['sad']
            t_neutral = 1000

            t_reveal += 540
        }
    }

    if (is_dirty_rule_render) {
        is_dirty_rule_render = false
        rule_renders = []
        rule_infos = []

        let ga = goal_attacks()

        let pa = pp_attacks()

        let nb_matched = 0
        let all_matched = true
        let y = 2
        for (let a of ga) {
            let x = 238

                ;[x, y] = build_render_a(a, x, y)

            let a2 = pa.find(_ => _.p1 === a.p1)

            let s_match = a2 === undefined || !aa_match(a, a2) ? 29 : 30
            if (s_match === 30) {
                nb_matched++
            }

            all_matched = all_matched && s_match === 30

            build_render_spr(s_match, x + 4, y + 4)
            build_render_info(infos['equals'](s_match === 30), x + 2, y + 2, 12, 12, [], [], [])

            x += 10

            if (a2 === undefined) {
                build_render_spr(31, x + 4, y + 4)
                build_render_info(infos['no_piece'](a.p1), x + 2, y + 2, 12, 12, [], [], [])
            } else {
                ;[x, y] = build_render_a(a2, x, y)
            }

            y += 14
            x = 182
        }

        if (nb_matched0 > nb_matched) {
            i_expr = Exprs[Math.random() < 0.8 ? 'angry' : 'sad']
            t_neutral = 1500
        }
        nb_matched0 = nb_matched

        if (all_matched) {
            go_solved()
        } else {
            info_well = undefined
        }
    }
    
    info_call = rule_infos.find(_ => _.is_hovering)?.info

    drag.update(delta)

    if (is_game_over) {
        for (let p of pp) {
            p.pos[1] -= delta * 0.1 * Math.random()
            if (p.pos[1] < -20) {
                p.pos[1] = 400
            }
        }

        if (t_flash % 500 < 17) {
            i_level += 1
            if (i_level > levels.length - 1) {
                i_level = 0
            }
            is_dirty_rule_render = true
        }
    }

}

function go_solved() {

    levels[i_level].is_solved = true

    let is_done_chapter = levels
        .filter(_ => _.chapter === levels[i_level].chapter)
        .every(_ => _.is_solved)

    if (is_done_chapter) {
        play(sounds['done_chapter'])
    } else {
        play(sounds['correct'])
    }
    i_expr = Exprs['playful']
    t_neutral = 5000

    if (i_level < levels.length - 1) {
        if (levels.findIndex(_ => !_.is_solved) === -1) {
            is_game_over = true
        } else {
            info_well = infos['well_done']
        }
    } else {
        if (levels.findIndex(_ => !_.is_solved) === -1) {
            is_game_over = true
        } else {
            info_well = infos['well_end']
        }
    }
}

function go_nav(delta: number) {

    if (levels[i_level].is_revealed) {
        levels[i_level].is_revealed = false
        levels[i_level].is_solved = false
    }

    let next_level = i_level + delta
    if (delta === 0) {
        next_level = levels.findIndex(_ => !_.is_solved)
    }

    if (next_level < 0 || next_level >= levels.length) {
        return
    }

    let is_next_chapter = levels[next_level].chapter !== levels[i_level].chapter

    if (is_next_chapter) {
        play(sounds['chapter'])
        reset_pp()
    } else {
        play(sounds['next'])
    }

    is_dirty_rule_render = true
    i_level = next_level

    if (is_next_chapter) {
        info_welcome = infos[`welcome${levels[i_level].chapter}`]
        i_expr = Exprs['surprised']
        t_neutral = 5000
    }
}

function pp_reveal_level() {

    reset_pp()


    let sx = fen_to_scontext(levels[i_level].fen)

    for (let key of Object.keys(sx)) {
        let file = squareFile(sx[key])
        let rank = squareRank(sx[key])

        pp.push(make_pp(key, pos_from_fr([file, 7 - rank])))
    }

    is_dirty_rule_render = true
}

function pp_fix_twos() {
    for (let p of pp) {
        let fr = pos2board_file_rank(p.pos)
        if (!fr) {
            continue
        }
        let two = pp.find(_ => {
            if (_ !== p && _.piece[0] === p.piece[0]) {
                let fr2 = pos2board_file_rank(_.pos)
                if (fr2) {
                    let sq1 = squareFromCoords(...fr)!
                    let sq2 = squareFromCoords(...fr2)!

                    if (sq2 < sq1) {
                        return true
                    }
                }
            }
        }) ? '2' : ''

        p.piece = p.piece[0] + two
    }
}

function pos_from_fr(fr: XY) {
    let res: XY =  [10 + fr[0] * 3.5 * 8 + 2, 3 * 8 + fr[1] * 3.5 * 8 + 4]

    return res
}

function pos2board_file_rank(pos: XY) {
    let [x, y] = pos

    x = x - 10
    y = y - 3 * 8

    if (x < 0 || x >= 3.5 * 8 * 8 || y < 0 || y >= 3.5 * 8 * 8) {
        return undefined
    }

    x = Math.floor(x / (3.5 * 8))
    y = Math.floor(y / (3.5 * 8))

    let res: XY =  [x, y]

    return res
}

function short_short(fen: FEN) {
    return mor_short(fen)
    /*
    let res = mor_short(fen)

    res.map(res => {
        let bb = []
        outer: for (let i = 0; i < res.blocks.length; i++) {

            for (let j = i + 1; j < res.blocks.length; j++) {
                let a = res.blocks[i]
                let b= res.blocks[j]

                if (a[0] === b[1] && a[1] === b[0]) {
                    continue outer
                }
            }
            bb.push(res.blocks[i])
        }
        res.blocks = bb
    })
    return res
    */
}

function pp_attacks() {
    return short_short(pp_fen())
}

function pp_fen() {
    let board: Record<Square, Pieces> = {}
    for (let p of pp) {

        let fr = pos2board_file_rank(p.pos)

        if (fr) {
            let p1 = p.piece
            board[squareFromCoords(...fr)!] = p1
        }
    }

    let res = ''

    for (let i = 0; i < 8; i++) {
        let spaces = 0
        for (let j = 0; j < 8; j++) {
            let sq = squareFromCoords(j, i)!

            if (board[sq]) {
                if (spaces > 0) {
                    res += spaces
                }
                res += board[sq][0]
                spaces = 0
            } else {

                spaces++;
            }
        }
        if (spaces > 0) {
            res += spaces
        }
        res += '/'
    }

    return res
}

function cursor_box(cursor: XY): XYWH {
    return [cursor[0] + 1, cursor[1] + 1, 6, 6]
}

function pp_box(p: PieceOnPos): XYWH {
    let [x, y] = p.pos

    return [x, y, 3 * 8, 3 * 8]
}

type PieceOnPos = {
    piece: Pieces,
    pos: XY
    is_hovering: boolean
    is_dragging: boolean
    orig?: PieceOnPos
}

function make_pp(piece: Pieces, pos: XY) {
    return {
        piece,
        pos,
        is_hovering: false,
        is_dragging: false
    }
}

type RuleRender = XYWH
type RuleInfo = {
    info: [string, string],
    bb: XYWH,
    is_hovering: boolean
    circles: XY[],
    yes_arrows: [XY, XY][]
    no_arrows: [XY, XY][]
}

let is_dirty_rule_render: boolean
let rule_renders: RuleRender[]

let rule_infos: RuleInfo[]

let drag_hp: PieceOnPos | undefined
let pp: PieceOnPos[]

let drag: DragHandler
let cursor: XY

type Level = {
    chapter: number,
    level: number,
    fen: FEN,
    is_solved: boolean
    is_revealed: boolean
}

let levels = [
    level_fen("5k2/8/8/8/8/8/8/4K3 w - - 0 1", 0, 0),
    level_fen("6k1/8/8/8/8/8/5P2/6K1 w - - 0 1", 0, 1),
    level_fen("6k1/8/8/8/8/8/6PP/6K1 w - - 0 1", 0, 2),
    level_fen("6k1/8/8/3r4/8/5B2/5P2/6K1 w - - 0 1", 0, 3),
    level_fen("6k1/b7/8/3r4/8/5B2/5P2/6K1 w - - 0 1", 0, 4),
    level_fen("1r4k1/bP6/8/8/8/5B2/5P2/6K1 w - - 0 1", 0, 5),
    level_fen("1r4k1/bP6/4p3/3r4/8/5B2/5P2/6K1 w - - 0 1", 0, 6),
    level_fen("1r4k1/bP6/4p3/p2r4/8/5B2/5P2/R5K1 w - - 0 1", 0, 7),

    level_fen("5k2/8/8/8/8/8/8/4K3 w - - 0 1", 1, 0),
    level_fen("8/1K6/4b3/8/3r4/4k3/8/8 w - - 0 1", 1, 1),
    level_fen("8/1K6/4b3/4R3/3rP3/4k3/8/8 w - - 0 1", 1, 2),

    level_fen("5k2/8/8/8/8/8/8/4K3 w - - 0 1", 2, 0),
    level_fen("8/5k2/8/8/8/8/6PP/6K1 w - - 0 1", 2, 1),
    level_fen("8/5k2/4rn2/8/8/8/6PP/6K1 w - - 0 1", 2, 2),
    level_fen("8/5k2/8/8/8/8/8/R2R2K1 w - - 0 1", 2, 3),
    level_fen("3r4/5k2/8/8/3n4/8/8/3R2K1 w - - 0 1", 2, 4),
    level_fen("3r4/6k1/5rn1/8/3n4/8/6PP/3R2K1 w - - 0 1", 2, 5),
    level_fen("3r4/6k1/5rn1/1p6/2Nn4/8/6PP/R2R2K1 w - - 0 1", 2, 6),
    level_fen("3r4/5k2/4rn2/1p6/2N5/3n4/1B4PP/R2R2K1", 2, 7),

    level_fen("5k2/8/8/8/8/8/8/4K3 w - - 0 1", 3, 0),
    level_fen("6k1/8/8/8/8/8/7q/1K1Q4 w - - 0 1", 3, 1),
    level_fen("6k1/7p/8/8/8/8/2Pr3q/1K1QR3 w - - 0 1", 3, 2),
    level_fen("6k1/7p/8/6p1/8/8/1PPr3q/1K1QR3 w - - 0 1", 3, 3),
]

let i_level: number


function level_fen(fen: FEN, chapter: number, level: number): Level {
    return {
        chapter,
        level,
        fen,
        is_solved: false,
        is_revealed: false
    }
}

const goal_attacks = () => {
    return short_short(levels[i_level].fen)
}

let info_welcome: [string, string]
let info_well: [string, string] | undefined
let info_call: [string, string] | undefined
let info_end: [string, string] | undefined

let t_flash: number

let is_hovering_cat: boolean

let is_hovering_next: boolean

let is_hovering_left: boolean
let is_hovering_right: boolean

let is_game_over: boolean

let is_music_playing: boolean

let is_muted: boolean | undefined


function _init() {


    t_reveal = 0

    if (is_music_playing) {
        stop_music()
    }

    is_music_playing = false

    nb_matched0 = 0

    i_expr = Exprs['happy']
    t_neutral = 5000

    is_game_over = false

    is_hovering_left = false
    is_hovering_right = false
    is_hovering_next = false
    t_flash = 0
    info_end = undefined
    info_well = undefined
    info_call = undefined
    info_welcome = infos['welcome0']

    is_dirty_rule_render = true
    rule_renders = []
    rule_infos = []

    i_level = 0

    drag_hp = undefined

    pp = []
    reset_pp()
    drag = DragHandler(c)
    cursor = [0, 0]
}

function reset_pp() {

    let off_x = 20
    let off_y = 0
    let off_y2 = 3 * 8 + 8 * 3.5 * 8
    let gap = 4 * 8
    pp = [
        make_pp('p', [off_x + gap * 0, off_y + 0]),
        make_pp('n', [off_x + gap * 1, off_y + 0]),
        make_pp('b', [off_x + gap * 2, off_y + 0]),
        make_pp('r', [off_x + gap * 3, off_y + 0]),
        make_pp('q', [off_x + gap * 4, off_y + 0]),
        make_pp('k', [off_x + gap * 5, off_y + 0]),

        make_pp('P', [off_x + gap * 0, off_y2 + 0]),
        make_pp('N', [off_x + gap * 1, off_y2 + 0]),
        make_pp('B', [off_x + gap * 2, off_y2 + 0]),
        make_pp('R', [off_x + gap * 3, off_y2 + 0]),
        make_pp('Q', [off_x + gap * 4, off_y2 + 0]),
        make_pp('K', [off_x + gap * 5, off_y2 + 0]),
        /*
        make_pp('k', pos_from_fr([2, 2])),
        make_pp('b', pos_from_fr([3, 3])),
        make_pp('K', pos_from_fr([5, 5])),
        */
    ]


}

function main(el: HTMLElement) {

    init_canvas()
    init_text()

    let $c = document.createElement('div')
    $c.classList.add('content')

    $c.appendChild(c)
    $c.appendChild(f)
    el.appendChild($c)

    _init()
    Loop(_update, _render)
}

main(document.getElementById('app')!)