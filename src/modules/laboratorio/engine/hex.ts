// Lector de Intel HEX: el formato que produce arduino-cli (sketch.ino.hex).
// Cada línea es ":LLAAAATT<datos>CC" (longitud, dirección, tipo, datos, checksum).
// Copiamos los datos a un arreglo de bytes que luego se convierte en la
// memoria flash del ATmega emulado.

export function parseIntelHex(hex: string, flashBytes: number): Uint8Array {
  const flash = new Uint8Array(flashBytes)
  let base = 0 // dirección extendida (registros tipo 02/04)
  const lines = hex.split(/\r?\n/)
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n].trim()
    if (!line) continue
    if (line[0] !== ':') throw new Error(`HEX inválido en la línea ${n + 1}`)
    const bytes: number[] = []
    for (let i = 1; i < line.length; i += 2) bytes.push(parseInt(line.substr(i, 2), 16))
    const sum = bytes.reduce((a, b) => (a + b) & 0xff, 0)
    if (sum !== 0) throw new Error(`Checksum incorrecto en la línea ${n + 1}`)
    const len = bytes[0]
    const addr = (bytes[1] << 8) | bytes[2]
    const type = bytes[3]
    const data = bytes.slice(4, 4 + len)
    if (type === 0x00) {
      const start = base + addr
      if (start + len > flashBytes) throw new Error('El programa no cabe en la memoria flash')
      flash.set(data, start)
    } else if (type === 0x01) {
      break // fin de archivo
    } else if (type === 0x02) {
      base = ((data[0] << 8) | data[1]) << 4
    } else if (type === 0x04) {
      base = ((data[0] << 8) | data[1]) << 16
    }
  }
  return flash
}
