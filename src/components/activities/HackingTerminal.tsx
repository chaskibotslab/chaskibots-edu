'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Terminal, Lock, Key, Wifi, Shield, Code, Copy, Check, 
  ChevronRight, ChevronDown, BookOpen, Lightbulb, Zap,
  Eye, EyeOff, Hash, RefreshCw, Download, Upload, Save, FolderOpen
} from 'lucide-react'

interface HackingTerminalProps {
  levelId: string
  userId?: string
  userName?: string
}

interface Command {
  name: string
  description: string
  usage: string
  example: string
}

interface Guide {
  title: string
  icon: React.ReactNode
  content: string
  commands: Command[]
}

const TERMINAL_GUIDES: Guide[] = [
  {
    title: '📂 Navegación de Archivos',
    icon: <Terminal className="w-4 h-4" />,
    content: 'Comandos para moverte entre carpetas y ver archivos.',
    commands: [
      { name: 'ls', description: 'Lista archivos y carpetas', usage: 'ls [directorio]', example: 'ls /home' },
      { name: 'cd', description: 'Cambia de directorio', usage: 'cd <directorio>', example: 'cd documentos' },
      { name: 'pwd', description: 'Muestra directorio actual', usage: 'pwd', example: 'pwd' },
      { name: 'cat', description: 'Muestra contenido de archivo', usage: 'cat <archivo>', example: 'cat notas.txt' },
      { name: 'mkdir', description: 'Crea un directorio', usage: 'mkdir <nombre>', example: 'mkdir proyectos' },
      { name: 'touch', description: 'Crea un archivo vacío', usage: 'touch <archivo>', example: 'touch nuevo.txt' },
    ]
  },
  {
    title: '🔍 Búsqueda y Filtros',
    icon: <Eye className="w-4 h-4" />,
    content: 'Comandos para buscar información.',
    commands: [
      { name: 'find', description: 'Busca archivos', usage: 'find <patrón>', example: 'find *.txt' },
      { name: 'grep', description: 'Busca texto en archivos', usage: 'grep <texto> <archivo>', example: 'grep password config.txt' },
      { name: 'head', description: 'Muestra primeras líneas', usage: 'head <archivo>', example: 'head log.txt' },
      { name: 'tail', description: 'Muestra últimas líneas', usage: 'tail <archivo>', example: 'tail log.txt' },
    ]
  },
  {
    title: '🌐 Red y Conexiones',
    icon: <Wifi className="w-4 h-4" />,
    content: 'Comandos de red para hackers éticos.',
    commands: [
      { name: 'ping', description: 'Prueba conexión a servidor', usage: 'ping <host>', example: 'ping google.com' },
      { name: 'nmap', description: 'Escanea puertos (simulado)', usage: 'nmap <ip>', example: 'nmap 192.168.1.1' },
      { name: 'ifconfig', description: 'Muestra configuración de red', usage: 'ifconfig', example: 'ifconfig' },
      { name: 'netstat', description: 'Muestra conexiones activas', usage: 'netstat', example: 'netstat' },
      { name: 'ssh', description: 'Conexión segura (simulada)', usage: 'ssh <usuario>@<host>', example: 'ssh admin@server' },
    ]
  },
  {
    title: '🔐 Seguridad',
    icon: <Shield className="w-4 h-4" />,
    content: 'Comandos relacionados con seguridad.',
    commands: [
      { name: 'whoami', description: 'Muestra usuario actual', usage: 'whoami', example: 'whoami' },
      { name: 'sudo', description: 'Ejecuta como administrador', usage: 'sudo <comando>', example: 'sudo ls /root' },
      { name: 'chmod', description: 'Cambia permisos', usage: 'chmod <permisos> <archivo>', example: 'chmod 755 script.sh' },
      { name: 'passwd', description: 'Cambia contraseña', usage: 'passwd', example: 'passwd' },
      { name: 'encrypt', description: 'Encripta texto (César)', usage: 'encrypt <texto> <shift>', example: 'encrypt hola 3' },
      { name: 'decrypt', description: 'Desencripta texto', usage: 'decrypt <texto> <shift>', example: 'decrypt krod 3' },
    ]
  },
  {
    title: '🛠️ Sistema',
    icon: <Code className="w-4 h-4" />,
    content: 'Comandos del sistema.',
    commands: [
      { name: 'clear', description: 'Limpia la terminal', usage: 'clear', example: 'clear' },
      { name: 'echo', description: 'Muestra texto', usage: 'echo <texto>', example: 'echo Hola Mundo' },
      { name: 'date', description: 'Muestra fecha y hora', usage: 'date', example: 'date' },
      { name: 'uptime', description: 'Tiempo encendido', usage: 'uptime', example: 'uptime' },
      { name: 'history', description: 'Historial de comandos', usage: 'history', example: 'history' },
      { name: 'help', description: 'Muestra ayuda', usage: 'help [comando]', example: 'help ls' },
    ]
  }
]

const FILE_SYSTEM: Record<string, any> = {
  '/': {
    type: 'dir',
    children: ['home', 'etc', 'var', 'root', 'tmp']
  },
  '/home': {
    type: 'dir',
    children: ['usuario', 'guest']
  },
  '/home/usuario': {
    type: 'dir',
    children: ['documentos', 'descargas', 'notas.txt', 'secreto.txt']
  },
  '/home/usuario/documentos': {
    type: 'dir',
    children: ['proyecto.py', 'readme.md']
  },
  '/home/usuario/notas.txt': {
    type: 'file',
    content: 'Mis notas secretas:\n- Aprender hacking ético\n- Practicar Python\n- Estudiar ciberseguridad'
  },
  '/home/usuario/secreto.txt': {
    type: 'file',
    content: '🔐 ARCHIVO CLASIFICADO\nContraseña del servidor: ********\n(Solo bromeaba, esto es educativo!)'
  },
  '/home/usuario/documentos/proyecto.py': {
    type: 'file',
    content: '# Mi primer proyecto\nprint("Hola Mundo!")\n\ndef hackear():\n    print("Soy un hacker ético!")'
  },
  '/home/usuario/documentos/readme.md': {
    type: 'file',
    content: '# Proyecto Educativo\n\nEste es un simulador de terminal para aprender comandos básicos.'
  },
  '/etc': {
    type: 'dir',
    children: ['passwd', 'hosts', 'config']
  },
  '/etc/passwd': {
    type: 'file',
    content: 'root:x:0:0:root:/root:/bin/bash\nusuario:x:1000:1000:Usuario:/home/usuario:/bin/bash\nguest:x:1001:1001:Guest:/home/guest:/bin/bash'
  },
  '/etc/hosts': {
    type: 'file',
    content: '127.0.0.1   localhost\n192.168.1.1 router\n10.0.0.1    servidor'
  },
  '/var': {
    type: 'dir',
    children: ['log', 'www']
  },
  '/var/log': {
    type: 'dir',
    children: ['system.log', 'access.log']
  },
  '/var/log/system.log': {
    type: 'file',
    content: '[INFO] Sistema iniciado\n[INFO] Usuario conectado\n[WARN] Intento de acceso fallido\n[INFO] Backup completado'
  },
  '/root': {
    type: 'dir',
    children: ['admin_notes.txt'],
    protected: true
  },
  '/tmp': {
    type: 'dir',
    children: []
  }
}

export default function HackingTerminal({ levelId, userId, userName }: HackingTerminalProps) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '╔══════════════════════════════════════════════════════════╗',
    '║  🖥️  SIMULADOR DE TERMINAL - HACKING ÉTICO              ║',
    '║  Escribe "help" para ver comandos disponibles           ║',
    '║  Comandos nuevos: save, load, export, myfiles           ║',
    '╚══════════════════════════════════════════════════════════╝',
    ''
  ])
  const [terminalInput, setTerminalInput] = useState('')
  const [currentDir, setCurrentDir] = useState('/home/usuario')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isSudo, setIsSudo] = useState(false)
  const [showGuides, setShowGuides] = useState(true)
  const [activeGuide, setActiveGuide] = useState<number | null>(null)
  
  // Crypto tools state
  const [showCrypto, setShowCrypto] = useState(false)
  const [encryptText, setEncryptText] = useState('')
  const [encryptShift, setEncryptShift] = useState(3)
  const [encryptedResult, setEncryptedResult] = useState('')
  const [cryptoMode, setCryptoMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  
  // Password checker state
  const [showPasswordChecker, setShowPasswordChecker] = useState(false)
  const [passwordToCheck, setPasswordToCheck] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    label: string
    tips: string[]
  } | null>(null)

  // Sistema de archivos virtuales (base de datos)
  const [userFiles, setUserFiles] = useState<any[]>([])
  const [showFileManager, setShowFileManager] = useState(false)
  const [editingFile, setEditingFile] = useState<any>(null)
  const [fileContent, setFileContent] = useState('')

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cargar archivos del usuario desde la base de datos
  const loadUserFiles = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/virtual-files?userId=${userId}`)
      if (res.ok) {
        const files = await res.json()
        setUserFiles(files)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  // Guardar archivo en la base de datos
  const saveFileToDb = async (name: string, content: string, path: string) => {
    if (!userId) {
      return { success: false, error: 'Debes iniciar sesión para guardar archivos' }
    }
    try {
      const res = await fetch('/api/virtual-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName: userName || 'Usuario',
          path,
          name,
          type: 'file',
          content,
          mimeType: name.endsWith('.py') ? 'text/x-python' : 'text/plain'
        })
      })
      if (res.ok) {
        await loadUserFiles()
        return { success: true }
      }
      return { success: false, error: 'Error al guardar' }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    }
  }

  // Exportar archivo (descargar)
  const exportFile = (name: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (userId) loadUserFiles()
  }, [userId])

  const caesarCipher = (text: string, shift: number, decrypt: boolean = false): string => {
    if (decrypt) shift = -shift
    return text.split('').map(char => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0)
        const base = code >= 65 && code <= 90 ? 65 : 97
        return String.fromCharCode(((code - base + shift + 26) % 26) + base)
      }
      return char
    }).join('')
  }

  const checkPasswordStrength = (password: string) => {
    let score = 0
    const tips: string[] = []

    if (password.length >= 8) score += 1
    else tips.push('Usa al menos 8 caracteres')

    if (password.length >= 12) score += 1

    if (/[a-z]/.test(password)) score += 1
    else tips.push('Agrega letras minúsculas')

    if (/[A-Z]/.test(password)) score += 1
    else tips.push('Agrega letras mayúsculas')

    if (/[0-9]/.test(password)) score += 1
    else tips.push('Agrega números')

    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    else tips.push('Agrega símbolos especiales (!@#$%)')

    if (!/(.)\1{2,}/.test(password)) score += 1
    else tips.push('Evita caracteres repetidos')

    const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte', 'Excelente']
    
    setPasswordStrength({
      score,
      label: labels[Math.min(score, labels.length - 1)],
      tips
    })
  }

  const processCommand = (input: string) => {
    const parts = input.trim().split(' ')
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)
    
    let output: string[] = []

    const resolvePath = (path: string): string => {
      if (path.startsWith('/')) return path
      if (path === '..') {
        const parts = currentDir.split('/')
        parts.pop()
        return parts.join('/') || '/'
      }
      if (path === '.') return currentDir
      return `${currentDir}/${path}`.replace('//', '/')
    }

    switch (command) {
      case 'help':
        if (args[0]) {
          const allCommands = TERMINAL_GUIDES.flatMap(g => g.commands)
          const cmd = allCommands.find(c => c.name === args[0])
          if (cmd) {
            output = [
              `📖 ${cmd.name.toUpperCase()}`,
              `   ${cmd.description}`,
              `   Uso: ${cmd.usage}`,
              `   Ejemplo: ${cmd.example}`
            ]
          } else {
            output = [`Comando no encontrado: ${args[0]}`]
          }
        } else {
          output = [
            '📚 COMANDOS DISPONIBLES:',
            '',
            '  Navegación: ls, cd, pwd, cat, mkdir, touch',
            '  Búsqueda:   find, grep, head, tail',
            '  Red:        ping, nmap, ifconfig, netstat, ssh',
            '  Seguridad:  whoami, sudo, chmod, encrypt, decrypt',
            '  Sistema:    clear, echo, date, uptime, history',
            '',
            '  � Python:',
            '    python <archivo.py> - Ejecuta archivo Python',
            '    run <archivo>       - Ejecuta archivo',
            '    edit <archivo>      - Info para editar',
            '',
            '  �📁 Archivos en la nube:',
            '    save <nombre> <contenido> - Guarda archivo',
            '    myfiles    - Lista tus archivos guardados',
            '    open <nombre>  - Abre un archivo',
            '    export <nombre> - Descarga archivo',
            '    rm <nombre>    - Elimina archivo',
            '',
            '  🔧 Herramientas especiales:',
            '    crypto    - Herramienta de cifrado',
            '    passcheck - Verificador de contraseñas',
            '',
            'Escribe "help <comando>" para más detalles'
          ]
        }
        break

      case 'ls':
        const lsPath = args[0] ? resolvePath(args[0]) : currentDir
        const lsNode = FILE_SYSTEM[lsPath]
        if (lsNode && lsNode.type === 'dir') {
          if (lsNode.protected && !isSudo) {
            output = ['Permiso denegado. Usa sudo.']
          } else {
            output = lsNode.children.length > 0 
              ? lsNode.children.map((c: string) => {
                  const childPath = `${lsPath}/${c}`.replace('//', '/')
                  const isDir = FILE_SYSTEM[childPath]?.type === 'dir'
                  return isDir ? `📁 ${c}/` : `📄 ${c}`
                })
              : ['(directorio vacío)']
          }
        } else {
          output = [`No existe: ${lsPath}`]
        }
        break

      case 'cd':
        if (!args[0]) {
          setCurrentDir('/home/usuario')
          output = ['']
        } else {
          const newPath = resolvePath(args[0])
          const node = FILE_SYSTEM[newPath]
          if (node && node.type === 'dir') {
            if (node.protected && !isSudo) {
              output = ['Permiso denegado']
            } else {
              setCurrentDir(newPath)
              output = ['']
            }
          } else {
            output = [`No es un directorio: ${args[0]}`]
          }
        }
        break

      case 'pwd':
        output = [currentDir]
        break

      case 'cat':
        if (!args[0]) {
          output = ['Uso: cat <archivo>']
        } else {
          const filePath = resolvePath(args[0])
          const file = FILE_SYSTEM[filePath]
          if (file && file.type === 'file') {
            output = file.content.split('\n')
          } else {
            output = [`No existe: ${args[0]}`]
          }
        }
        break

      case 'mkdir':
        if (!args[0]) {
          output = ['Uso: mkdir <nombre>']
        } else {
          output = [`Directorio creado: ${args[0]}`]
        }
        break

      case 'touch':
        if (!args[0]) {
          output = ['Uso: touch <archivo>']
        } else {
          output = [`Archivo creado: ${args[0]}`]
        }
        break

      case 'find':
        const pattern = args[0] || '*'
        output = [
          `Buscando: ${pattern}`,
          '',
          '/home/usuario/notas.txt',
          '/home/usuario/secreto.txt',
          '/home/usuario/documentos/proyecto.py',
          '/home/usuario/documentos/readme.md',
          '',
          `4 archivos encontrados`
        ]
        break

      case 'grep':
        if (args.length < 2) {
          output = ['Uso: grep <texto> <archivo>']
        } else {
          output = [
            `Buscando "${args[0]}" en ${args[1]}...`,
            `Línea 3: ...${args[0]}...`,
            '1 coincidencia encontrada'
          ]
        }
        break

      case 'ping':
        if (!args[0]) {
          output = ['Uso: ping <host>']
        } else {
          output = [
            `PING ${args[0]}:`,
            `64 bytes from ${args[0]}: time=12ms`,
            `64 bytes from ${args[0]}: time=11ms`,
            `64 bytes from ${args[0]}: time=13ms`,
            '',
            '--- estadísticas ---',
            '3 paquetes transmitidos, 3 recibidos, 0% pérdida'
          ]
        }
        break

      case 'nmap':
        if (!args[0]) {
          output = ['Uso: nmap <ip>']
        } else {
          output = [
            `🔍 Escaneando ${args[0]}...`,
            '',
            'PORT     STATE    SERVICE',
            '22/tcp   open     ssh',
            '80/tcp   open     http',
            '443/tcp  open     https',
            '3306/tcp filtered mysql',
            '',
            '4 puertos escaneados'
          ]
        }
        break

      case 'ifconfig':
        output = [
          'eth0: flags=4163<UP,BROADCAST,RUNNING>',
          '      inet 192.168.1.100  netmask 255.255.255.0',
          '      ether 00:1a:2b:3c:4d:5e',
          '',
          'lo: flags=73<UP,LOOPBACK,RUNNING>',
          '    inet 127.0.0.1  netmask 255.0.0.0'
        ]
        break

      case 'netstat':
        output = [
          'Conexiones activas:',
          '',
          'Proto  Local           Remote          Estado',
          'TCP    192.168.1.100   google.com:443  ESTABLISHED',
          'TCP    192.168.1.100   github.com:443  ESTABLISHED',
          'UDP    192.168.1.100   dns.server:53   CONNECTED'
        ]
        break

      case 'ssh':
        if (!args[0]) {
          output = ['Uso: ssh usuario@host']
        } else {
          output = [
            `Conectando a ${args[0]}...`,
            '🔐 Autenticación requerida',
            'Conexión simulada exitosa!',
            `Bienvenido a ${args[0].split('@')[1] || 'servidor'}`
          ]
        }
        break

      case 'whoami':
        output = [isSudo ? 'root' : 'usuario']
        break

      case 'sudo':
        if (args.length === 0) {
          output = ['Uso: sudo <comando>']
        } else {
          setIsSudo(true)
          output = ['🔓 Modo administrador activado']
          setTimeout(() => setIsSudo(false), 30000)
        }
        break

      case 'chmod':
        if (args.length < 2) {
          output = ['Uso: chmod <permisos> <archivo>']
        } else {
          output = [`Permisos de ${args[1]} cambiados a ${args[0]}`]
        }
        break

      case 'encrypt':
        if (args.length < 1) {
          output = ['Uso: encrypt <texto> [shift]']
        } else {
          const text = args.slice(0, -1).join(' ') || args[0]
          const shift = parseInt(args[args.length - 1]) || 3
          const encrypted = caesarCipher(text, shift)
          output = [
            `Texto original: ${text}`,
            `Desplazamiento: ${shift}`,
            `Texto cifrado: ${encrypted}`
          ]
        }
        break

      case 'decrypt':
        if (args.length < 1) {
          output = ['Uso: decrypt <texto> [shift]']
        } else {
          const text = args.slice(0, -1).join(' ') || args[0]
          const shift = parseInt(args[args.length - 1]) || 3
          const decrypted = caesarCipher(text, shift, true)
          output = [
            `Texto cifrado: ${text}`,
            `Desplazamiento: ${shift}`,
            `Texto descifrado: ${decrypted}`
          ]
        }
        break

      case 'clear':
        setTerminalOutput([])
        return
        
      case 'echo':
        output = [args.join(' ')]
        break

      case 'date':
        output = [new Date().toLocaleString('es-EC')]
        break

      case 'uptime':
        output = ['Sistema activo: 2 días, 5 horas, 32 minutos']
        break

      case 'history':
        output = commandHistory.length > 0
          ? commandHistory.map((cmd, i) => `  ${i + 1}  ${cmd}`)
          : ['(sin historial)']
        break

      case 'crypto':
        setShowCrypto(true)
        output = ['🔐 Abriendo herramienta de cifrado...']
        break

      case 'passcheck':
        setShowPasswordChecker(true)
        output = ['🔑 Abriendo verificador de contraseñas...']
        break

      // === NUEVOS COMANDOS DE ARCHIVOS ===
      case 'save':
        if (args.length < 2) {
          output = ['Uso: save <nombre_archivo> <contenido>']
        } else {
          const fileName = args[0]
          const content = args.slice(1).join(' ')
          if (!userId) {
            output = ['⚠️ Debes iniciar sesión para guardar archivos']
          } else {
            saveFileToDb(fileName, content, currentDir).then(result => {
              if (result.success) {
                setTerminalOutput(prev => [...prev, `✅ Archivo "${fileName}" guardado en la nube`])
              } else {
                setTerminalOutput(prev => [...prev, `❌ ${result.error}`])
              }
            })
            output = [`💾 Guardando "${fileName}"...`]
          }
        }
        break

      case 'myfiles':
        setShowFileManager(true)
        if (userFiles.length === 0) {
          output = ['📂 No tienes archivos guardados aún', 'Usa: save <nombre> <contenido> para crear uno']
        } else {
          output = [
            '📂 TUS ARCHIVOS EN LA NUBE:',
            '',
            ...userFiles.map(f => `  📄 ${f.name} (${f.size} bytes) - ${f.path}`),
            '',
            `Total: ${userFiles.length} archivo(s)`,
            'Usa: open <nombre> para ver contenido',
            'Usa: export <nombre> para descargar'
          ]
        }
        break

      case 'open':
        if (!args[0]) {
          output = ['Uso: open <nombre_archivo>']
        } else {
          const fileToOpen = userFiles.find(f => f.name === args[0])
          if (fileToOpen) {
            output = [
              `📄 ${fileToOpen.name}`,
              '─'.repeat(40),
              ...fileToOpen.content.split('\n'),
              '─'.repeat(40)
            ]
          } else {
            // Buscar en sistema de archivos local
            const localPath = `${currentDir}/${args[0]}`.replace('//', '/')
            const localFile = FILE_SYSTEM[localPath]
            if (localFile && localFile.type === 'file') {
              output = localFile.content.split('\n')
            } else {
              output = [`Archivo no encontrado: ${args[0]}`]
            }
          }
        }
        break

      case 'export':
        if (!args[0]) {
          output = ['Uso: export <nombre_archivo>']
        } else {
          const fileToExport = userFiles.find(f => f.name === args[0])
          if (fileToExport) {
            exportFile(fileToExport.name, fileToExport.content)
            output = [`📥 Descargando "${fileToExport.name}"...`]
          } else {
            // Exportar archivo del sistema local
            const localPath = `${currentDir}/${args[0]}`.replace('//', '/')
            const localFile = FILE_SYSTEM[localPath]
            if (localFile && localFile.type === 'file') {
              exportFile(args[0], localFile.content)
              output = [`📥 Descargando "${args[0]}"...`]
            } else {
              output = [`Archivo no encontrado: ${args[0]}`]
            }
          }
        }
        break

      case 'rm':
        if (!args[0]) {
          output = ['Uso: rm <nombre_archivo>']
        } else {
          const fileToDelete = userFiles.find(f => f.name === args[0])
          if (fileToDelete) {
            fetch(`/api/virtual-files?recordId=${fileToDelete.recordId}`, { method: 'DELETE' })
              .then(() => {
                loadUserFiles()
                setTerminalOutput(prev => [...prev, `🗑️ Archivo "${args[0]}" eliminado`])
              })
            output = [`Eliminando "${args[0]}"...`]
          } else {
            output = [`Archivo no encontrado en tus archivos: ${args[0]}`]
          }
        }
        break

      case 'python':
      case 'python3':
        if (!args[0]) {
          output = [
            '🐍 Python 3.10.0 (simulado)',
            'Uso: python <archivo.py>',
            'Ejemplo: python proyecto.py'
          ]
        } else {
          const pyFileName = args[0]
          // Buscar en archivos del usuario
          let pyFile = userFiles.find(f => f.name === pyFileName)
          let pyContent = pyFile?.content
          
          // Si no está en archivos del usuario, buscar en sistema local
          if (!pyContent) {
            const localPath = pyFileName.startsWith('/') 
              ? pyFileName 
              : `${currentDir}/${pyFileName}`.replace('//', '/')
            const localFile = FILE_SYSTEM[localPath]
            if (localFile && localFile.type === 'file') {
              pyContent = localFile.content
            }
          }
          
          if (pyContent) {
            // Simular ejecución de Python
            output = ['🐍 Ejecutando Python...', '─'.repeat(40)]
            const lines = pyContent.split('\n')
            const variables: Record<string, any> = {}
            
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || trimmed.startsWith('#')) continue
              
              // Simular print()
              const printMatch = trimmed.match(/print\s*\(\s*["'](.*)["']\s*\)/)
              if (printMatch) {
                output.push(printMatch[1])
                continue
              }
              
              // print con variables
              const printVarMatch = trimmed.match(/print\s*\(\s*(.+)\s*\)/)
              if (printVarMatch) {
                const content = printVarMatch[1]
                // Evaluar contenido simple
                if (content.startsWith('"') || content.startsWith("'")) {
                  output.push(content.replace(/["']/g, ''))
                } else if (variables[content] !== undefined) {
                  output.push(String(variables[content]))
                } else {
                  output.push(content)
                }
                continue
              }
              
              // Asignación de variable simple
              const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/)
              if (assignMatch) {
                const [, varName, value] = assignMatch
                if (value.startsWith('"') || value.startsWith("'")) {
                  variables[varName] = value.replace(/["']/g, '')
                } else if (!isNaN(Number(value))) {
                  variables[varName] = Number(value)
                }
              }
              
              // def function (solo mostrar que se definió)
              if (trimmed.startsWith('def ')) {
                const funcMatch = trimmed.match(/def\s+(\w+)/)
                if (funcMatch) {
                  output.push(`[Función ${funcMatch[1]}() definida]`)
                }
              }
            }
            
            output.push('─'.repeat(40), '✅ Ejecución completada')
          } else {
            output = [`❌ Archivo no encontrado: ${pyFileName}`, 'Usa "ls" para ver archivos disponibles']
          }
        }
        break

      case 'edit':
      case 'nano':
      case 'vim':
        if (!args[0]) {
          output = ['Uso: edit <archivo>', 'Crea o edita un archivo']
        } else {
          const editFileName = args[0]
          output = [
            `📝 Editor de texto: ${editFileName}`,
            '─'.repeat(40),
            'Para crear/editar archivos usa:',
            `  save ${editFileName} <contenido>`,
            '',
            'Ejemplo:',
            `  save ${editFileName} print("Hola Mundo!")`,
            '─'.repeat(40)
          ]
        }
        break

      case 'run':
        if (!args[0]) {
          output = ['Uso: run <archivo>', 'Ejecuta un archivo (detecta tipo automáticamente)']
        } else {
          const runFile = args[0]
          if (runFile.endsWith('.py')) {
            // Redirigir a python
            processCommand(`python ${runFile}`)
            return
          } else {
            output = [`Tipo de archivo no soportado: ${runFile}`, 'Archivos soportados: .py']
          }
        }
        break

      case '':
        return

      default:
        output = [`Comando no reconocido: ${command}. Escribe "help" para ayuda.`]
    }

    setTerminalOutput(prev => [
      ...prev,
      `${isSudo ? '# ' : '$ '}${input}`,
      ...output,
      ''
    ])
    setCommandHistory(prev => [...prev, input])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processCommand(terminalInput)
      setTerminalInput('')
      setHistoryIndex(-1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setTerminalInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setTerminalInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else {
        setHistoryIndex(-1)
        setTerminalInput('')
      }
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  const handleCryptoSubmit = () => {
    const result = cryptoMode === 'encrypt'
      ? caesarCipher(encryptText, encryptShift)
      : caesarCipher(encryptText, encryptShift, true)
    setEncryptedResult(result)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-400" />
          <h3 className="font-bold text-gray-900">Terminal Hacking Ético</h3>
          {isSudo && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded animate-pulse">
              ROOT
            </span>
          )}
        </div>
        <button
          onClick={() => setShowGuides(!showGuides)}
          className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
        >
          <BookOpen className="w-4 h-4" />
          {showGuides ? 'Ocultar' : 'Mostrar'} Guías
        </button>
      </div>

      {/* Guides */}
      {showGuides && (
        <div className="bg-[#1a3a3a] rounded-xl p-4 border border-[#2d5a5a] max-h-64 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-[#7dd3c0]">Guía de Comandos</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {TERMINAL_GUIDES.map((guide, idx) => (
              <div key={idx} className="border border-[#2d5a5a] rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveGuide(activeGuide === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-2 bg-[#1e4545] hover:bg-[#2a5555] transition-colors text-sm"
                >
                  <span className="font-medium text-white">{guide.title}</span>
                  {activeGuide === idx ? (
                    <ChevronDown className="w-3 h-3 text-[#7dd3c0]" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-[#7dd3c0]" />
                  )}
                </button>
                {activeGuide === idx && (
                  <div className="p-2 bg-[#0f2828] border-t border-[#2d5a5a] text-xs">
                    {guide.commands.map((cmd, cmdIdx) => (
                      <div key={cmdIdx} className="py-1 border-b border-[#1a3a3a] last:border-0">
                        <code className="text-green-400">{cmd.name}</code>
                        <span className="text-[#9ca3af] ml-2">{cmd.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal */}
      <div 
        className="bg-black rounded-xl overflow-hidden border border-green-900"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-green-900">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-sm text-green-400 font-mono">
              {currentDir}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCrypto(!showCrypto)}
              className="p-1.5 hover:bg-gray-800 rounded transition-colors"
              title="Cifrado César"
            >
              <Lock className="w-4 h-4 text-green-400" />
            </button>
            <button
              onClick={() => setShowPasswordChecker(!showPasswordChecker)}
              className="p-1.5 hover:bg-gray-800 rounded transition-colors"
              title="Verificar contraseña"
            >
              <Key className="w-4 h-4 text-green-400" />
            </button>
            <button
              onClick={() => setTerminalOutput([])}
              className="p-1.5 hover:bg-gray-800 rounded transition-colors"
              title="Limpiar"
            >
              <RefreshCw className="w-4 h-4 text-green-400" />
            </button>
          </div>
        </div>
        
        <div 
          ref={terminalRef}
          className="h-64 p-4 overflow-y-auto font-mono text-sm"
        >
          {terminalOutput.map((line, idx) => (
            <div key={idx} className="text-green-400 whitespace-pre-wrap">
              {line}
            </div>
          ))}
          <div className="flex items-center text-green-400">
            <span>{isSudo ? '# ' : '$ '}</span>
            <input
              ref={inputRef}
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none ml-1"
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Crypto Tool */}
      {showCrypto && (
        <div className="bg-[#1a3a3a] rounded-xl p-4 border border-[#2d5a5a]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-white">Cifrado César</span>
            </div>
            <button
              onClick={() => setShowCrypto(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setCryptoMode('encrypt')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  cryptoMode === 'encrypt' 
                    ? 'bg-purple-600 text-gray-900' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Encriptar
              </button>
              <button
                onClick={() => setCryptoMode('decrypt')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  cryptoMode === 'decrypt' 
                    ? 'bg-purple-600 text-gray-900' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Desencriptar
              </button>
            </div>
            
            <input
              type="text"
              value={encryptText}
              onChange={(e) => setEncryptText(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="w-full px-3 py-2 bg-[#0f2828] border border-[#2d5a5a] rounded-lg text-white placeholder-gray-500"
            />
            
            <div className="flex items-center gap-3">
              <label className="text-sm text-[#7dd3c0]">Desplazamiento:</label>
              <input
                type="range"
                min="1"
                max="25"
                value={encryptShift}
                onChange={(e) => setEncryptShift(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-mono w-8">{encryptShift}</span>
            </div>
            
            <button
              onClick={handleCryptoSubmit}
              className="w-full py-2 bg-[#558C89] hover:bg-[#4a7a78] text-white rounded-lg transition-colors font-medium"
            >
              {cryptoMode === 'encrypt' ? '🔒 Encriptar' : '🔓 Desencriptar'}
            </button>
            
            {encryptedResult && (
              <div className="p-3 bg-[#0f2828] rounded-lg">
                <div className="text-xs text-[#7dd3c0] mb-1">Resultado:</div>
                <div className="text-green-400 font-mono break-all">{encryptedResult}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Checker */}
      {showPasswordChecker && (
        <div className="bg-[#1a3a3a] rounded-xl p-4 border border-[#2d5a5a]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-yellow-400" />
              <span className="font-medium text-white">Verificador de Contraseñas</span>
            </div>
            <button
              onClick={() => setShowPasswordChecker(false)}
              className="text-[#7dd3c0] hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordToCheck}
                onChange={(e) => {
                  setPasswordToCheck(e.target.value)
                  if (e.target.value) checkPasswordStrength(e.target.value)
                  else setPasswordStrength(null)
                }}
                placeholder="Escribe una contraseña para verificar..."
                className="w-full px-3 py-2 pr-10 bg-[#0f2828] border border-[#2d5a5a] rounded-lg text-white placeholder-gray-500"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7dd3c0] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {passwordStrength && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#1e4545] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        passwordStrength.score <= 2 ? 'bg-red-500' :
                        passwordStrength.score <= 4 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${
                    passwordStrength.score <= 2 ? 'text-red-400' :
                    passwordStrength.score <= 4 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                
                {passwordStrength.tips.length > 0 && (
                  <div className="text-sm">
                    <div className="text-[#7dd3c0] mb-1">Sugerencias:</div>
                    {passwordStrength.tips.map((tip, i) => (
                      <div key={i} className="text-yellow-400 text-xs">• {tip}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-[#1a3a3a] border border-[#2d5a5a] rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-green-400 mt-0.5" />
          <div className="text-sm text-green-300">
            <strong>Hacking Ético:</strong> Usa estos conocimientos solo para aprender y proteger sistemas. 
            Nunca intentes acceder a sistemas sin autorización. ¡Sé un hacker del bien! 🛡️
          </div>
        </div>
      </div>
    </div>
  )
}
