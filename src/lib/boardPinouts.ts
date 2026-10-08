// Distribución real de pines de las placas de los kits, vistas desde arriba
// con el conector USB hacia arriba. `left` y `right` van de arriba hacia abajo.
// La usa WiringDiagram para dibujar cada cable saliendo del pin correcto.

export interface BoardPinout {
  id: string
  label: string
  color: string
  left: string[]
  right: string[]
}

const NANO: BoardPinout = {
  id: 'nano',
  label: 'Arduino Nano',
  color: '#0E6B7A',
  left: ['D13', '3V3', 'AREF', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', '5V', 'RST', 'GND', 'VIN'],
  right: ['D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'GND', 'RST', 'RX0', 'TX1'],
}

const UNO: BoardPinout = {
  id: 'uno',
  label: 'Arduino UNO',
  color: '#0E6B7A',
  left: ['IOREF', 'RST', '3V3', '5V', 'GND', 'GND', 'VIN', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
  right: ['AREF', 'GND', 'D13', 'D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'TX1', 'RX0'],
}

const ESP32_DEVKIT: BoardPinout = {
  id: 'esp32',
  label: 'ESP32 DevKit',
  color: '#1F2937',
  left: ['EN', 'GPIO36', 'GPIO39', 'GPIO34', 'GPIO35', 'GPIO32', 'GPIO33', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO14', 'GPIO12', 'GPIO13', 'GND', 'VIN'],
  right: ['GPIO23', 'GPIO22', 'GPIO1', 'GPIO3', 'GPIO21', 'GPIO19', 'GPIO18', 'GPIO5', 'GPIO17', 'GPIO16', 'GPIO4', 'GPIO2', 'GPIO15', 'GND', '3V3'],
}

const ESP32_C3: BoardPinout = {
  id: 'esp32c3',
  label: 'ESP32-C3 Super Mini',
  color: '#1F2937',
  left: ['5V', 'GND', '3V3', 'GPIO4', 'GPIO3', 'GPIO2', 'GPIO1', 'GPIO0'],
  right: ['GPIO5', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO20', 'GPIO21'],
}

export function pinoutForBoard(boardName: string | null | undefined): BoardPinout {
  const n = (boardName || '').toLowerCase()
  if (n.includes('c3')) return ESP32_C3
  if (n.includes('esp32')) return ESP32_DEVKIT
  if (n.includes('uno')) return UNO
  return NANO
}

// "VIN (5V)" → "VIN", "d9" → "D9", "GPIO 4" → "GPIO4"
export function normalizePin(raw: string): string {
  return raw.replace(/\(.*?\)/g, '').replace(/\s+/g, '').toUpperCase().replace(/^3\.3V$/, '3V3').replace(/^3V$/, '3V3')
}

export const isPowerPin = (pin: string) => ['5V', '3V3', 'VIN'].includes(pin)
export const isGroundPin = (pin: string) => pin === 'GND'
