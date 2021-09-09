import { line } from './wasm4';

function point(x: i32, y: i32): void {
    line(x, y, x, y);
}

// fill oval
// https://github.com/tuupola/hagl/blob/master/src/hagl.c#L618

export function oval(x0: i32, y0: i32, width: u32, height: u32): void {
    const a = width / 2;
    const b = height / 2;

    x0 = x0 + a;
    y0 = y0 + b;

    let wx: i32;
    let wy: i32;
    let xa: i32;
    let ya: i32;
    let t: i32;
    let asq: u32 = a * a;
    let bsq: u32 = b * b;

    point(x0, y0 + b);
    point(x0, y0 - b);

    wx = 0;
    wy = b;
    xa = 0;
    ya = asq * 2 * b;
    t = asq / 4 - asq * b;

    while (1) {
        t += xa + bsq;

        if (t >= 0) {
            ya -= asq * 2;
            t -= ya;
            wy--;
        }

        xa += bsq * 2;
        wx++;

        if (xa >= ya) {
            break;
        }

        line(x0 - wx, y0 - wy, x0 + wx, y0 - wy);
        line(x0 - wx, y0 + wy, x0 + wx, y0 + wy);
    }

    line(x0 - a, y0, x0 + a, y0);

    wx = a;
    wy = 0;
    xa = bsq * 2 * a;

    ya = 0;
    t = bsq / 4 - bsq * a;

    while (1) {
        t += ya + asq;

        if (t >= 0) {
            xa -= bsq * 2;
            t = t - xa;
            wx--;
        }

        ya += asq * 2;
        wy++;

        if (ya > xa) {
            break;
        }

        line(x0 - wx, y0 - wy, x0 + wx, y0 - wy);
        line(x0 - wx, y0 + wy, x0 + wx, y0 + wy);
    }
}