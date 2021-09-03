import { Texture } from "../nodes/sprite";

// 4230 - apple, leaf, trunk, bg
const tree = memory.data<u8>([ 0x00,0x01,0x40,0x00,0x00,0x05,0x50,0x00,0x00,0x15,0x54,0x00,0x00,0x17,0x54,0x00,0x00,0x55,0x75,0x00,0x01,0x55,0x55,0x40,0x05,0xd5,0x75,0x50,0x05,0x5d,0x55,0x50,0x11,0x55,0x54,0x44,0x11,0x06,0x90,0x44,0x00,0x56,0x95,0x00,0x01,0x42,0x81,0x40,0x01,0x02,0x80,0x40,0x00,0x02,0x80,0x00,0x00,0x2a,0xa8,0x00,0x00,0x8a,0xa2,0x00 ]);
export const treeTexture = new Texture(16, 16, tree, 1);
