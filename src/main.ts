import './style.css'
import sprite_bg_png from '../design/sprites_with_bg_alpha_working.png'
import { Loop } from './loop_input'
import { DragHandler } from './drag'
import play_music from './play_music'
import { box_intersect, type XY, type XYWH } from './util'
//import './play_sounds'

import { mor_short, parse_piece, print_a_piece, type Pieces } from './chess/mor_short'

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

    c.width = 320
    c.height = 180
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
    let y = 124 * sy
    wrap_text_fx(text[0], x, y, 600, 60)
    fx.font = '32px Arial'
    x = 184 * sx
    y = 156 * sy
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
    cx.fillRect(0, 0, 320, 180)


    spr(110, 0, 0, 320)


    let off_x = 50
    let off_y = 25 
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let black = (i + j) % 2 === 1 ? 1 : 0;
            spr(108 + black, off_x + i * 16, off_y + j * 16, 2)
        }
    }

    off_x = 60
    off_y = 8

    spr(111, off_x - 10, off_y - 8, 16, 3)

    off_y = 25 + 8 * 16 + 8

    spr(111, off_x - 10, off_y - 8, 16, 3)

    for (let p of pp) {
        spr(piece_to_i(p.piece), ...p.pos)
        if (p.is_hovering) {
            spr(112, ...p.pos, 2)
        }
    }

    spr(111, 180, 130, 16, 6) 

    render_info(infos['welcome'])

    spr(108, ...cursor)
}

const infos: Record<string, [string, string]> = {
    welcome: ['welcome to mor chess; drag pieces on to the board, but there are some rules.', 'drag out of the board to remove a piece.']
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

    return 14+ role_to_i[p1.role] + (p1.color === 'white' ? 0 : 8)
}


function _update(delta: number) {

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

    }

    drag.update(delta)
}

function cursor_box(cursor: XY): XYWH {
    return [cursor[0], cursor[1], 4, 4]
}

function pp_box(p: PieceOnPos): XYWH {
    let [x, y] = p.pos

    return [x, y, 16, 16]
}

type PieceOnPos = {
    piece: Pieces,
    pos: XY
    is_hovering: boolean
}

function make_pp(piece: Pieces, pos: XY) {
    return {
        piece,
        pos,
        is_hovering: false
    }
}

let pp: PieceOnPos[]

let drag: DragHandler
let cursor: XY

function _init() {

    let off_x = 55
    let off_y = 8
    let off_y2 = 8 + 8 * 16 + 25
    pp = [
        make_pp('p', [off_x + 20 * 0, off_y + 0]),
        make_pp('n', [off_x + 20 * 1, off_y + 0]),
        make_pp('b', [off_x + 20 * 2, off_y + 0]),
        make_pp('r', [off_x + 20 * 3, off_y + 0]),
        make_pp('q', [off_x + 20 * 4, off_y + 0]),
        make_pp('k', [off_x + 20 * 5, off_y + 0]),

        make_pp('P', [off_x + 20 * 0, off_y2 + 0]),
        make_pp('N', [off_x + 20 * 1, off_y2 + 0]),
        make_pp('B', [off_x + 20 * 2, off_y2 + 0]),
        make_pp('R', [off_x + 20 * 3, off_y2 + 0]),
        make_pp('Q', [off_x + 20 * 4, off_y2 + 0]),
        make_pp('K', [off_x + 20 * 5, off_y2 + 0]),
    ]

    drag = DragHandler(c)
    cursor = [0, 0]
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