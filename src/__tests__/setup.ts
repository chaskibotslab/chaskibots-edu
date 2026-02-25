// ============================================
// TEST SETUP - ChaskiBots EDU
// ============================================

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock de fetch global
global.fetch = vi.fn()

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock de console para tests silenciosos
vi.spyOn(console, 'error').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})

// Reset mocks antes de cada test
beforeEach(() => {
  vi.clearAllMocks()
})
