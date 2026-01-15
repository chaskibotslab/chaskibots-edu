'use client'

import { useState, useRef } from 'react'
import { 
  Play, RotateCcw, Copy, Check, ChevronRight, ChevronDown,
  BookOpen, Code, Gamepad2, Lightbulb, Zap, Box, Users, Sparkles
} from 'lucide-react'

interface RobloxEditorProps {
  levelId: string
}

interface Example {
  title: string
  code: string
  description: string
  category: 'basico' | 'intermedio' | 'avanzado'
}

interface Guide {
  title: string
  icon: string
  content: string
  examples: Example[]
}

const ROBLOX_GUIDES: Guide[] = [
  {
    title: '🎮 Fundamentos de Lua',
    icon: '📚',
    content: 'Aprende los conceptos básicos del lenguaje Lua usado en Roblox.',
    examples: [
      {
        title: 'Variables y print',
        code: `-- Variables en Lua
local nombre = "Jugador1"
local nivel = 10
local esVIP = true
local monedas = 500.50

print("¡Bienvenido, " .. nombre .. "!")
print("Tu nivel es: " .. nivel)
print("Monedas: " .. monedas)

if esVIP then
    print("🌟 Eres jugador VIP!")
end`,
        description: 'Crea variables y muestra mensajes',
        category: 'basico'
      },
      {
        title: 'Funciones básicas',
        code: `-- Definir funciones
local function saludar(nombre)
    print("¡Hola, " .. nombre .. "!")
end

local function sumar(a, b)
    return a + b
end

local function calcularDaño(ataque, defensa)
    local daño = ataque - (defensa / 2)
    if daño < 0 then
        daño = 0
    end
    return daño
end

-- Usar las funciones
saludar("Guerrero")
print("5 + 3 = " .. sumar(5, 3))
print("Daño causado: " .. calcularDaño(50, 20))`,
        description: 'Define y usa funciones',
        category: 'basico'
      },
      {
        title: 'Tablas (Arrays)',
        code: `-- Tablas en Lua (como arrays)
local inventario = {"Espada", "Escudo", "Poción", "Llave"}

print("=== INVENTARIO ===")
for i, item in ipairs(inventario) do
    print(i .. ". " .. item)
end

-- Agregar item
table.insert(inventario, "Armadura")
print("\\nNuevo item agregado!")

-- Diccionario
local jugador = {
    nombre = "Héroe",
    vida = 100,
    mana = 50,
    nivel = 5
}

print("\\n=== STATS ===")
print("Nombre: " .. jugador.nombre)
print("Vida: " .. jugador.vida)
print("Nivel: " .. jugador.nivel)`,
        description: 'Trabaja con tablas y diccionarios',
        category: 'basico'
      }
    ]
  },
  {
    title: '🏗️ Partes y Objetos',
    icon: '🧱',
    content: 'Aprende a crear y manipular partes en el mundo de Roblox.',
    examples: [
      {
        title: 'Crear una parte',
        code: `-- Crear una parte nueva
local parte = Instance.new("Part")
parte.Name = "MiBloque"
parte.Size = Vector3.new(4, 4, 4)
parte.Position = Vector3.new(0, 10, 0)
parte.BrickColor = BrickColor.new("Bright red")
parte.Material = Enum.Material.Neon
parte.Anchored = true
parte.Parent = workspace

print("¡Parte creada en el mundo!")

-- Cambiar propiedades después
wait(2)
parte.BrickColor = BrickColor.new("Bright blue")
print("Color cambiado a azul")

wait(2)
parte.Transparency = 0.5
print("Ahora es semi-transparente")`,
        description: 'Crea y modifica partes con código',
        category: 'intermedio'
      },
      {
        title: 'Efectos visuales',
        code: `-- Crear parte con efectos
local parte = Instance.new("Part")
parte.Name = "ParteConEfectos"
parte.Size = Vector3.new(3, 3, 3)
parte.Position = Vector3.new(0, 5, 0)
parte.Anchored = true
parte.Parent = workspace

-- Agregar luz
local luz = Instance.new("PointLight")
luz.Color = Color3.fromRGB(255, 200, 0)
luz.Brightness = 2
luz.Range = 20
luz.Parent = parte

-- Agregar partículas
local particulas = Instance.new("ParticleEmitter")
particulas.Color = ColorSequence.new(Color3.fromRGB(255, 100, 0))
particulas.Size = NumberSequence.new(0.5)
particulas.Lifetime = NumberRange.new(1, 2)
particulas.Rate = 20
particulas.Parent = parte

print("¡Parte con efectos creada!")`,
        description: 'Agrega luces y partículas',
        category: 'intermedio'
      },
      {
        title: 'Mover partes',
        code: `-- Animación de movimiento
local parte = Instance.new("Part")
parte.Name = "ParteMovil"
parte.Size = Vector3.new(4, 1, 4)
parte.Position = Vector3.new(0, 3, 0)
parte.BrickColor = BrickColor.new("Lime green")
parte.Anchored = true
parte.Parent = workspace

-- Mover arriba y abajo
local posicionInicial = parte.Position.Y
local amplitud = 3
local velocidad = 2

while true do
    for i = 0, 360, velocidad do
        local offset = math.sin(math.rad(i)) * amplitud
        parte.Position = Vector3.new(
            parte.Position.X,
            posicionInicial + offset,
            parte.Position.Z
        )
        wait(0.03)
    end
end`,
        description: 'Crea plataformas móviles',
        category: 'intermedio'
      }
    ]
  },
  {
    title: '👤 Scripts de Jugador',
    icon: '🎭',
    content: 'Interactúa con los jugadores y sus personajes.',
    examples: [
      {
        title: 'Detectar jugador',
        code: `-- Script en ServerScriptService
local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(jugador)
    print("¡" .. jugador.Name .. " se unió al juego!")
    
    -- Esperar a que cargue el personaje
    jugador.CharacterAdded:Connect(function(personaje)
        print(jugador.Name .. " apareció en el mundo")
        
        -- Obtener humanoid
        local humanoid = personaje:WaitForChild("Humanoid")
        humanoid.MaxHealth = 200
        humanoid.Health = 200
        
        print("Vida aumentada a 200")
    end)
end)

Players.PlayerRemoving:Connect(function(jugador)
    print(jugador.Name .. " salió del juego")
end)`,
        description: 'Detecta cuando entran/salen jugadores',
        category: 'intermedio'
      },
      {
        title: 'Dar herramienta',
        code: `-- Dar espada al jugador
local Players = game:GetService("Players")

local function darEspada(jugador)
    -- Crear herramienta
    local espada = Instance.new("Tool")
    espada.Name = "Espada Épica"
    espada.RequiresHandle = true
    
    -- Crear el mango
    local handle = Instance.new("Part")
    handle.Name = "Handle"
    handle.Size = Vector3.new(1, 4, 0.3)
    handle.BrickColor = BrickColor.new("Dark stone grey")
    handle.Parent = espada
    
    -- Poner en mochila del jugador
    espada.Parent = jugador.Backpack
    
    print("¡Espada dada a " .. jugador.Name .. "!")
end

Players.PlayerAdded:Connect(function(jugador)
    wait(3) -- Esperar que cargue
    darEspada(jugador)
end)`,
        description: 'Crea y da herramientas a jugadores',
        category: 'avanzado'
      },
      {
        title: 'Sistema de puntos',
        code: `-- Sistema de puntos con leaderstats
local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(jugador)
    -- Crear carpeta de stats
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = jugador
    
    -- Crear valores
    local monedas = Instance.new("IntValue")
    monedas.Name = "Monedas"
    monedas.Value = 100
    monedas.Parent = leaderstats
    
    local nivel = Instance.new("IntValue")
    nivel.Name = "Nivel"
    nivel.Value = 1
    nivel.Parent = leaderstats
    
    print(jugador.Name .. " - Stats creados")
    
    -- Dar monedas cada 10 segundos
    spawn(function()
        while wait(10) do
            if jugador.Parent then
                monedas.Value = monedas.Value + 10
                print(jugador.Name .. " recibió 10 monedas")
            end
        end
    end)
end)`,
        description: 'Crea tabla de puntuación',
        category: 'avanzado'
      }
    ]
  },
  {
    title: '🎯 Eventos y Toques',
    icon: '✨',
    content: 'Detecta interacciones y crea mecánicas de juego.',
    examples: [
      {
        title: 'Bloque que da puntos',
        code: `-- Bloque coleccionable
local parte = script.Parent -- Asume que está dentro de una parte
local puntosValor = 50
local tiempoRespawn = 5

local function alTocar(otroObjeto)
    local humanoid = otroObjeto.Parent:FindFirstChild("Humanoid")
    if humanoid then
        local jugador = game.Players:GetPlayerFromCharacter(otroObjeto.Parent)
        if jugador then
            -- Dar puntos
            local leaderstats = jugador:FindFirstChild("leaderstats")
            if leaderstats then
                local monedas = leaderstats:FindFirstChild("Monedas")
                if monedas then
                    monedas.Value = monedas.Value + puntosValor
                    print(jugador.Name .. " obtuvo " .. puntosValor .. " monedas!")
                end
            end
            
            -- Desaparecer y reaparecer
            parte.Transparency = 1
            parte.CanCollide = false
            wait(tiempoRespawn)
            parte.Transparency = 0
            parte.CanCollide = true
        end
    end
end

parte.Touched:Connect(alTocar)`,
        description: 'Crea coleccionables',
        category: 'intermedio'
      },
      {
        title: 'Trampolín',
        code: `-- Plataforma de salto
local trampolin = script.Parent
trampolin.BrickColor = BrickColor.new("Bright yellow")

local fuerzaSalto = 100
local debounce = false

trampolin.Touched:Connect(function(hit)
    if debounce then return end
    
    local humanoid = hit.Parent:FindFirstChild("Humanoid")
    if humanoid then
        debounce = true
        
        -- Aplicar fuerza hacia arriba
        local rootPart = hit.Parent:FindFirstChild("HumanoidRootPart")
        if rootPart then
            local bodyVelocity = Instance.new("BodyVelocity")
            bodyVelocity.Velocity = Vector3.new(0, fuerzaSalto, 0)
            bodyVelocity.MaxForce = Vector3.new(0, math.huge, 0)
            bodyVelocity.Parent = rootPart
            
            -- Efecto visual
            trampolin.BrickColor = BrickColor.new("Bright orange")
            
            wait(0.2)
            bodyVelocity:Destroy()
            
            wait(0.3)
            trampolin.BrickColor = BrickColor.new("Bright yellow")
            debounce = false
        end
    end
end)

print("Trampolín listo!")`,
        description: 'Crea plataforma de salto',
        category: 'avanzado'
      },
      {
        title: 'Puerta con llave',
        code: `-- Sistema de puerta con llave
local puerta = script.Parent
local llaveNecesaria = "LlaveDorada"

puerta.BrickColor = BrickColor.new("Bright red")
local estaAbierta = false

local function verificarLlave(jugador)
    local mochila = jugador:FindFirstChild("Backpack")
    if mochila then
        for _, item in pairs(mochila:GetChildren()) do
            if item.Name == llaveNecesaria then
                return true
            end
        end
    end
    -- También verificar si la tiene equipada
    local personaje = jugador.Character
    if personaje then
        if personaje:FindFirstChild(llaveNecesaria) then
            return true
        end
    end
    return false
end

puerta.Touched:Connect(function(hit)
    if estaAbierta then return end
    
    local humanoid = hit.Parent:FindFirstChild("Humanoid")
    if humanoid then
        local jugador = game.Players:GetPlayerFromCharacter(hit.Parent)
        if jugador then
            if verificarLlave(jugador) then
                -- Abrir puerta
                estaAbierta = true
                puerta.BrickColor = BrickColor.new("Bright green")
                puerta.CanCollide = false
                puerta.Transparency = 0.7
                print("¡Puerta abierta para " .. jugador.Name .. "!")
                
                wait(5)
                
                -- Cerrar puerta
                puerta.CanCollide = true
                puerta.Transparency = 0
                puerta.BrickColor = BrickColor.new("Bright red")
                estaAbierta = false
            else
                print(jugador.Name .. " necesita: " .. llaveNecesaria)
            end
        end
    end
end)`,
        description: 'Puerta que requiere item',
        category: 'avanzado'
      }
    ]
  },
  {
    title: '⚔️ Sistemas de Combate',
    icon: '🗡️',
    content: 'Crea mecánicas de combate y daño.',
    examples: [
      {
        title: 'Zona de daño',
        code: `-- Zona que hace daño
local zonaDaño = script.Parent
zonaDaño.BrickColor = BrickColor.new("Really red")
zonaDaño.Material = Enum.Material.Neon
zonaDaño.Transparency = 0.3

local dañoPorSegundo = 10
local jugadoresEnZona = {}

zonaDaño.Touched:Connect(function(hit)
    local humanoid = hit.Parent:FindFirstChild("Humanoid")
    if humanoid then
        local nombre = hit.Parent.Name
        if not jugadoresEnZona[nombre] then
            jugadoresEnZona[nombre] = true
            print(nombre .. " entró a zona de daño")
            
            -- Hacer daño continuo
            spawn(function()
                while jugadoresEnZona[nombre] and humanoid.Health > 0 do
                    humanoid:TakeDamage(dañoPorSegundo)
                    print(nombre .. " recibió " .. dañoPorSegundo .. " de daño")
                    wait(1)
                end
            end)
        end
    end
end)

zonaDaño.TouchEnded:Connect(function(hit)
    local nombre = hit.Parent.Name
    if jugadoresEnZona[nombre] then
        jugadoresEnZona[nombre] = nil
        print(nombre .. " salió de zona de daño")
    end
end)`,
        description: 'Crea áreas peligrosas',
        category: 'avanzado'
      },
      {
        title: 'Espada con daño',
        code: `-- Script para herramienta espada
local espada = script.Parent
local daño = 25
local cooldown = 0.5
local puedeAtacar = true

espada.Activated:Connect(function()
    if not puedeAtacar then return end
    puedeAtacar = false
    
    local jugador = game.Players:GetPlayerFromCharacter(espada.Parent)
    if jugador then
        print(jugador.Name .. " atacó con la espada!")
    end
    
    -- Detectar golpe
    local handle = espada:FindFirstChild("Handle")
    if handle then
        local conexion
        conexion = handle.Touched:Connect(function(hit)
            local humanoid = hit.Parent:FindFirstChild("Humanoid")
            if humanoid and hit.Parent ~= espada.Parent then
                humanoid:TakeDamage(daño)
                print("¡Golpe! " .. daño .. " de daño a " .. hit.Parent.Name)
                conexion:Disconnect()
            end
        end)
        
        -- Desconectar después del swing
        wait(0.3)
        if conexion then
            conexion:Disconnect()
        end
    end
    
    wait(cooldown)
    puedeAtacar = true
end)`,
        description: 'Espada funcional con daño',
        category: 'avanzado'
      }
    ]
  }
]

export default function RobloxEditor({ levelId }: RobloxEditorProps) {
  const [code, setCode] = useState(`-- ¡Bienvenido al Editor Roblox Lua!
-- Escribe tu código aquí

print("¡Hola desde Roblox!")

local jugador = "Héroe"
local nivel = 1

print("Jugador: " .. jugador)
print("Nivel: " .. nivel)`)
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeGuide, setActiveGuide] = useState<number | null>(null)
  const [showGuides, setShowGuides] = useState(true)
  const [filterCategory, setFilterCategory] = useState<'todos' | 'basico' | 'intermedio' | 'avanzado'>('todos')

  const getLevel = (): 'basico' | 'intermedio' | 'avanzado' => {
    if (['primero-bach', 'segundo-bach', 'tercero-bach'].includes(levelId)) return 'avanzado'
    if (['octavo-egb', 'noveno-egb', 'decimo-egb'].includes(levelId)) return 'intermedio'
    return 'basico'
  }

  const simulateLua = (sourceCode: string): string[] => {
    const results: string[] = []
    const variables: Record<string, any> = {}
    
    const lines = sourceCode.split('\n')
    
    const evaluateExpression = (expr: string): any => {
      expr = expr.trim()
      
      // String
      if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
        return expr.slice(1, -1)
      }
      
      // Number
      if (!isNaN(Number(expr))) {
        return Number(expr)
      }
      
      // Boolean
      if (expr === 'true') return true
      if (expr === 'false') return false
      if (expr === 'nil') return null
      
      // Variable
      if (variables[expr] !== undefined) {
        return variables[expr]
      }
      
      // String concatenation
      if (expr.includes('..')) {
        const parts = expr.split('..')
        return parts.map(p => String(evaluateExpression(p.trim()))).join('')
      }
      
      // Math operations
      if (expr.includes('+') || expr.includes('-') || expr.includes('*') || expr.includes('/')) {
        try {
          let evalExpr = expr
          Object.keys(variables).forEach(v => {
            evalExpr = evalExpr.replace(new RegExp(`\\b${v}\\b`, 'g'), String(variables[v]))
          })
          return eval(evalExpr)
        } catch {
          return expr
        }
      }
      
      return expr
    }
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('--')) continue
      
      // print statement
      if (trimmed.startsWith('print(')) {
        const content = trimmed.slice(6, -1)
        const value = evaluateExpression(content)
        results.push(String(value))
        continue
      }
      
      // Local variable
      if (trimmed.startsWith('local ')) {
        const rest = trimmed.slice(6)
        if (rest.includes('=')) {
          const [varName, ...valueParts] = rest.split('=')
          const value = valueParts.join('=').trim()
          variables[varName.trim()] = evaluateExpression(value)
        }
        continue
      }
      
      // Variable assignment (without local)
      if (trimmed.includes('=') && !trimmed.includes('==')) {
        const [varName, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').trim()
        variables[varName.trim()] = evaluateExpression(value)
      }
    }
    
    return results.length > 0 ? results : ['(Sin salida - usa print() para ver resultados)']
  }

  const runCode = () => {
    setIsRunning(true)
    setOutput(['⏳ Simulando código Lua...'])
    
    setTimeout(() => {
      const results = simulateLua(code)
      setOutput(results)
      setIsRunning(false)
    }, 500)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const loadExample = (example: Example) => {
    setCode(example.code)
    setOutput([])
  }

  const filteredGuides = ROBLOX_GUIDES.map(guide => ({
    ...guide,
    examples: filterCategory === 'todos' 
      ? guide.examples 
      : guide.examples.filter(ex => ex.category === filterCategory)
  })).filter(guide => guide.examples.length > 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-red-400" />
          <h3 className="font-bold text-white">Editor Roblox Lua</h3>
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
            {getLevel().charAt(0).toUpperCase() + getLevel().slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
          >
            <option value="todos">Todos los niveles</option>
            <option value="basico">Básico</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
          <button
            onClick={() => setShowGuides(!showGuides)}
            className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
          >
            <BookOpen className="w-4 h-4" />
            {showGuides ? 'Ocultar' : 'Mostrar'} Guías
          </button>
        </div>
      </div>

      {/* Guides */}
      {showGuides && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 max-h-96 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Guías de Roblox Studio</span>
          </div>
          <div className="space-y-2">
            {filteredGuides.map((guide, idx) => (
              <div key={idx} className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveGuide(activeGuide === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-white">{guide.title}</span>
                  {activeGuide === idx ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {activeGuide === idx && (
                  <div className="p-3 bg-gray-900/50 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-3">{guide.content}</p>
                    <div className="grid gap-2">
                      {guide.examples.map((example, exIdx) => (
                        <button
                          key={exIdx}
                          onClick={() => loadExample(example)}
                          className="flex items-center justify-between p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{example.title}</span>
                              <span className={`px-1.5 py-0.5 text-xs rounded ${
                                example.category === 'basico' ? 'bg-green-500/20 text-green-400' :
                                example.category === 'intermedio' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {example.category}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">{example.description}</div>
                          </div>
                          <Zap className="w-4 h-4 text-red-400 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-sm text-gray-400">script.lua</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyCode}
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="Copiar código"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setCode('-- Escribe tu código Lua aquí\n')}
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="Limpiar"
              >
                <RotateCcw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-4 bg-gray-900 text-blue-400 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
            placeholder="-- Escribe tu código Lua aquí"
          />
        </div>

        {/* Output */}
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Output</span>
            </div>
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Ejecutando...' : 'Simular'}
            </button>
          </div>
          <div className="h-64 p-4 overflow-y-auto font-mono text-sm">
            {output.map((line, idx) => (
              <div key={idx} className="text-white">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-red-400 mt-0.5" />
          <div className="text-sm text-red-300">
            <strong>Tip:</strong> Este simulador ejecuta código Lua básico. Para funciones avanzadas de Roblox 
            (Instance.new, eventos, etc.), copia el código a Roblox Studio. ¡Los ejemplos están listos para usar!
          </div>
        </div>
      </div>
    </div>
  )
}
