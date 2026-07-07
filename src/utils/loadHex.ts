
export function loadHex(source: string, target: Uint8Array) {
  for (const line of source.split('\n')) {
    if (line[0] === ':' && line.substring(7, 9) === '00') {
      const bytes = parseInt(line.substring(1, 3), 16);
      const addr = parseInt(line.substring(3, 7), 16);
      for (let i = 0; i < bytes; i++) {
        target[addr + i] = parseInt(line.substring(9 + i * 2, 11 + i * 2), 16);
      }
    }
  }
}
