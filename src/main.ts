import * as w4 from "./wasm4";

const COUNT = 100;
const array: StaticArray<i32> = new StaticArray(COUNT * 2);

for(let i = 0; i < array.length; i += 2) {
    array[i] = i32(Math.random() * w4.SCREEN_SIZE);
    array[i + 1] = i32(Math.random() * w4.SCREEN_SIZE);
}

export function start(): void {

}

export function update (): void {

}
