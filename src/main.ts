import './style.css'
import sprite_bg_png from '../design/sprites_with_bg_alpha_working.png'
import { Loop } from './loop_input'
import { DragHandler } from './drag'
import play_music from './play_music'
import { box_intersect, type XY, type XYWH } from './util'
//import './play_sounds'

import { mor_short, parse_piece, print_a_piece, zero_attacked_by_lower, zero_attacked_by_upper, type AttackPiece, type FEN, type Pieces } from './chess/mor_short'
import type { Square } from './chess/types'
import { squareFromCoords } from './chess/util'

console.log(mor_short("3r4/p1p2kpp/4rn2/1p6/2N1P3/3n1P2/PB4PP/R2R2K1").map(print_a_piece))

if (false) {
    play_music()
}

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
    fx.font = '54px Arial'
    let x = 184 * sx
    let y = 122 * sy
    wrap_text_fx(text[0], x, y, 600, 60)
    fx.font = '32px Arial'
    x = 184 * sx
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

    spr(111, 270, 188, 20, 10) 

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
    }

    for (let rr of rule_renders) {
        spr(rr[0], rr[1], rr[2])
    }

    if (drag_hp) {
        spr(piece_to_i(drag_hp.piece), ...drag_hp.pos, 3)
    }


    if (info_well !== undefined) {
        let hover_y = is_hovering_next && t_flash % 500 < 200 ? 2 : 0
        sspr8(119, 5, 260, 166 + hover_y)

        if (is_hovering_next && t_flash % 500 < 200) {
            spr(123, 340, 166 + hover_y, 2)
        }
    }

    spr(28, ...cursor)
}

const next_box: XYWH = [260, 166, 80, 16]

function aa_match(a: AttackPiece, b: AttackPiece) {

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

const build_render_spr = (i: number, x: number, y: number) => rule_renders.push([i, x, y, 0])
const build_render_info = (info: [string, string], x: number, y: number, w: number, h: number) => rule_infos.push({
    info,
    bb: [x, y, w, h],
    is_hovering: false
})



function build_render_a(a: AttackPiece, x: number, y: number) {
    const spr = build_render_spr
    const ipr = build_render_info

        spr(piece_to_i(a.p1), x + 4, y + 4)
        if (a.p1.match(/2/)) {
            spr(82, x + 4, y + 4)
        }
        ipr(infos.yes_piece(a.p1), x + 2, y + 2, 12, 12)


        x += 8

        spr(39, x + 4, y + 4)
        x += 8

        if (zero_attacked_by_lower(a)) {
            spr(32, x + 4, y + 4)

            ipr(infos.zero_attacked_by_lower(a.p1), x + 2, y + 2, 12, 12)

            x += 10
        }
        if (zero_attacked_by_upper(a)) {
            spr(33, x + 4, y + 4)

            ipr(infos.zero_attacked_by_upper(a.p1), x + 2, y + 2, 12, 12)
            x += 10
        }

        for (let aa of a.attacks) {

            spr(35, x + 2, y+ 4)

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
            ipr(infos.blocked_attacked_by(a.p1, bb[1], bb[0]), x + 4, y + 2, 24, 12)
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
    welcome: ['welcome to mor chess; drag pieces on to the board, but there are some rules.', 'drag out of the board to remove a piece.'],
    welcome1: ['chess tactics; are born out of relationships.', 'entangle them is our job.'],
    well_done: ['Congratulations, you satisfied all rules. Time to go deeper.', 'Click next to continue.'],
    well_next_chapter: ['Good job, you finished a chapter. And, there\'s more', 'Click next to continue.'],
    well_end: ['chess is fascinating isn\'t it, go play some chess.', 'Thank\'s for playing'],
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

        return [`${p1} is ${attacking(piece, attacks)} ${a1}.`, ``]
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

        return [`${p1} is ${attacking(piece, a)} ${a1}, blocked by ${b1}.`, ``]
    },
    blocked_attacked_by(piece: Pieces, a: Pieces, b: Pieces) {
        let p1 = pretty_piece(piece)
        let a1 = pretty_piece(a)
        let b1 = pretty_piece(b)

        return [`${p1} is ${attacked(piece, a)} by ${a1}, blocked by ${b1}.`, ``]
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

    t_flash += delta

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


        is_hovering_next = info_well !== undefined && box_intersect(next_box, cursor_box(cursor))
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
        }


        if (is_hovering_next) {
            i_goal += 1
            is_dirty_rule_render = true
            info_well = undefined

            if (goal_attacks() === undefined) {
                i_chapter += 1
                reset_pp()

                info_welcome = infos['welcome' + i_chapter]
            }
        }
    }

    if (is_dirty_rule_render) {
        is_dirty_rule_render = false
        rule_renders = []
        rule_infos = []

        let ga = goal_attacks() ?? []

        let pa = pp_attacks()

        let all_matched = true
        let y = 2
        for (let a of ga) {
            let x = 238

                ;[x, y] = build_render_a(a, x, y)

            let a2 = pa.find(_ => _.p1 === a.p1)

            let s_match = a2 === undefined || !aa_match(a, a2) ? 29 : 30

            all_matched = all_matched && s_match === 30

            build_render_spr(s_match, x + 4, y + 4)

            x += 10

            if (a2 === undefined) {
                build_render_spr(31, x + 4, y + 4)
                build_render_info(infos['no_piece'](a.p1), x + 2, y + 2, 12, 12)
            } else {
                ;[x, y] = build_render_a(a2, x, y)
            }

            y += 12
            x = 182
        }

        if (ga.length === 0) {
            if (i_chapter === nb_chapters) {
                info_end = infos['well_end']
            } else {
                info_well = infos['well_next_chapter']
            }
        } else if (all_matched) {
            info_well = infos['well_done']
        } else {
            info_well = undefined
        }
    }
    
    info_call = rule_infos.find(_ => _.is_hovering)?.info

    drag.update(delta)
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
}

let is_dirty_rule_render: boolean
let rule_renders: RuleRender[]

let rule_infos: RuleInfo[]

let drag_hp: PieceOnPos | undefined
let pp: PieceOnPos[]

let drag: DragHandler
let cursor: XY

let i_goal: number
let i_chapter: number

let goals: (FEN | undefined)[] = [
    "5k2/8/8/8/8/8/8/4K3 w - - 0 1",
    "8/5k2/8/8/8/8/6PP/6K1 w - - 0 1",
    "8/5k2/4rn2/8/8/8/6PP/6K1 w - - 0 1",
    "8/5k2/8/8/8/8/8/R2R2K1 w - - 0 1",
    "3r4/5k2/8/8/3n4/8/8/3R2K1 w - - 0 1",
    "3r4/6k1/5rn1/8/3n4/8/6PP/3R2K1 w - - 0 1",
    "3r4/6k1/5rn1/1p6/2Nn4/8/6PP/R2R2K1 w - - 0 1",
    "3r4/5k2/4rn2/1p6/2N5/3n4/1B4PP/R2R2K1",
    undefined,
    "5k2/8/8/8/8/8/8/4K3 w - - 0 1",
]

const nb_chapters = goals.filter(_ => _ === undefined).length

const goal_attacks = () => {
    let res = goals[i_goal]
    if (res) {
        return short_short(res)
    }
}

let info_welcome: [string, string]
let info_well: [string, string] | undefined
let info_call: [string, string] | undefined
let info_end: [string, string] | undefined

let t_flash: number

let is_hovering_next: boolean

function _init() {
    is_hovering_next = false
    t_flash = 0
    info_end = undefined
    info_well = undefined
    info_call = undefined
    info_welcome = infos['welcome']

    is_dirty_rule_render = true
    rule_renders = []
    rule_infos = []

    i_goal = 0
    i_chapter = 0

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