'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  Terminal, ChevronRight, ChevronDown, Shield, Code,
  Loader2, Maximize2, Minimize2, X, Trash2, Copy, Download, Send,
  Check, GraduationCap, Trophy, CheckCircle2, Circle, BookOpen,
  Zap, Skull
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

// ============================================================
// ACADEMY API TYPES (backed by Supabase: simulator_courses/modules/lessons)
// ============================================================
interface ApiExample {
  title: string
  code: string
  explanation: string
}

interface ApiChallenge {
  title: string
  description: string
  starter_code: string
  expected_output: string
  hints: string[]
}

interface ApiLessonStub {
  id: string
  slug: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimated_minutes: number
  sort_order: number
}

interface ApiLessonFull extends ApiLessonStub {
  theory: string
  examples: ApiExample[]
  challenges: ApiChallenge[]
}

interface ApiModule {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  lessons: ApiLessonStub[]
}

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'fácil', medium: 'medio', hard: 'difícil' }
const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'bg-green-500/15 text-green-400 border border-green-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  hard: 'bg-red-500/15 text-red-400 border border-red-500/30',
}

// ============================================================
// VIRTUAL FILE SYSTEM — Laboratorio de pentest "Target Corp"
// ============================================================
const FILE_SYSTEM: Record<string, any> = {
  '/': { type: 'dir', children: ['home', 'etc', 'var', 'root', 'tmp', 'usr', 'opt'] },
  '/home': { type: 'dir', children: ['hacker', 'guest'] },
  '/home/hacker': { type: 'dir', children: ['documentos', 'wordlists', 'notas.txt', 'informe_pentest.md', '.ssh'] },
  '/home/hacker/documentos': { type: 'dir', children: ['target_recon.txt', 'metodologia.md'] },
  '/home/hacker/documentos/target_recon.txt': { type: 'file', content: 'OBJETIVO: target-corp.com\nIP principal: 10.0.0.10\nServidor DB interno: 10.0.0.5\nCVEs conocidos: pendiente de escaneo\nEstado: Autorizado por contrato de pentest #2024-118' },
  '/home/hacker/documentos/metodologia.md': { type: 'file', content: '# Metodología PTES\n\n1. Pre-engagement (contrato, alcance)\n2. Reconocimiento (OSINT, whois, dns)\n3. Escaneo (nmap, enumeración)\n4. Explotación (sqli, xss, etc)\n5. Post-explotación (escalada, persistencia)\n6. Reporte (hallazgos, remediación)' },
  '/home/hacker/wordlists': { type: 'dir', children: ['common_passwords.txt', 'subdomains.txt'] },
  '/home/hacker/wordlists/common_passwords.txt': { type: 'file', content: '123456\npassword\nadmin\nqwerty\nletmein\nP@ssw0rd\ntarget2024\nadmin123\nwelcome1\nchangeme' },
  '/home/hacker/wordlists/subdomains.txt': { type: 'file', content: 'www\nadmin\napi\ndev\nstaging\nvpn\nmail\nftp\ndb' },
  '/home/hacker/notas.txt': { type: 'file', content: '╔═══════════════════════════════════╗\n║  CÓDIGO DE ÉTICA DEL HACKER       ║\n╠═══════════════════════════════════╣\n║ 1. Siempre pedir autorización      ║\n║ 2. Documentar cada paso            ║\n║ 3. No dañar sistemas ni datos      ║\n║ 4. Reportar responsablemente       ║\n║ 5. Nunca explotar sin permiso      ║\n╚═══════════════════════════════════╝' },
  '/home/hacker/informe_pentest.md': { type: 'file', content: '# Informe de Pentest — Target Corp\n\n## Alcance\ntarget-corp.com y subred 10.0.0.0/24\n\n## Hallazgos (completar durante la práctica)\n- [ ] Reconocimiento\n- [ ] Puertos y servicios abiertos\n- [ ] Vulnerabilidades web\n- [ ] Credenciales débiles\n- [ ] Acceso obtenido' },
  '/home/hacker/.ssh': { type: 'dir', children: ['id_rsa.pub', 'known_hosts'] },
  '/home/hacker/.ssh/id_rsa.pub': { type: 'file', content: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7... hacker@chaskibots-lab' },
  '/home/hacker/.ssh/known_hosts': { type: 'file', content: '10.0.0.10 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...\n10.0.0.5 ssh-rsa AAAAB3NzaC...' },
  '/etc': { type: 'dir', children: ['passwd', 'shadow', 'hosts', 'ssh'] },
  '/etc/passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nhacker:x:1000:1000:Hacker Ético:/home/hacker:/bin/bash\nwww-data:x:33:33:Web Server:/var/www:/usr/sbin/nologin\nmysql:x:112:118:MySQL Server:/nonexistent:/bin/false' },
  '/etc/shadow': { type: 'file', content: '[ACCESO DENEGADO] Necesitas permisos de root (usa: sudo cat /etc/shadow)', protected: true },
  '/etc/hosts': { type: 'file', content: '127.0.0.1        localhost\n10.0.0.10        target-corp.com www.target-corp.com\n10.0.0.5         db.internal\n10.0.0.99        atacante-desconocido' },
  '/etc/ssh': { type: 'dir', children: ['sshd_config'] },
  '/etc/ssh/sshd_config': { type: 'file', content: 'Port 22\nPermitRootLogin yes\nPasswordAuthentication yes\nPubkeyAuthentication yes\nMaxAuthTries 6' },
  '/var': { type: 'dir', children: ['log', 'www'] },
  '/var/log': { type: 'dir', children: ['auth.log', 'access.log', 'error.log', 'syslog'] },
  '/var/log/auth.log': { type: 'file', content: 'Jun 15 03:11:02 target sshd[2201]: Failed password for root from 10.0.0.99 port 51223\nJun 15 03:11:04 target sshd[2201]: Failed password for root from 10.0.0.99 port 51224\nJun 15 03:11:05 target sshd[2201]: Failed password for root from 10.0.0.99 port 51225\nJun 15 03:11:07 target sshd[2201]: Failed password for root from 10.0.0.99 port 51226\nJun 15 03:11:09 target sshd[2201]: Failed password for admin from 10.0.0.99 port 51227\nJun 15 03:11:11 target sshd[2201]: Failed password for admin from 10.0.0.99 port 51228\nJun 15 03:12:45 target sshd[2201]: Accepted password for admin from 10.0.0.99 port 51260\nJun 15 09:00:01 target sshd[5678]: Accepted publickey for hacker from 192.168.1.50' },
  '/var/log/access.log': { type: 'file', content: '10.0.0.99 - - [15/Jun/2024:03:10:01] "POST /wp-login.php HTTP/1.1" 403 128\n10.0.0.99 - - [15/Jun/2024:03:10:05] "POST /admin/login HTTP/1.1" 403 128\n10.0.0.99 - - [15/Jun/2024:03:12:50] "POST /admin/login HTTP/1.1" 200 1044\n192.168.1.50 - - [15/Jun/2024:10:00:01] "GET / HTTP/1.1" 200 4523\n192.168.1.50 - - [15/Jun/2024:10:00:03] "GET /api/users HTTP/1.1" 200 1024' },
  '/var/log/error.log': { type: 'file', content: '[error] ModSecurity: Access denied [id "942100"] [msg "SQL Injection Attack Detected"] [uri "/login"]\n[error] ModSecurity: Access denied [id "941100"] [msg "XSS Attack Detected"] [uri "/search"]\n[error] ModSecurity: Access denied [id "930100"] [msg "Path Traversal Attack"] [uri "/download"]' },
  '/var/log/syslog': { type: 'file', content: 'Jun 15 00:00:01 target systemd[1]: Started Target Corp Web Platform\nJun 15 03:12:50 target kernel: New session opened for user admin\nJun 15 03:13:10 target su: pam_unix(su:session): session opened for user root' },
  '/var/www': { type: 'dir', children: ['html'] },
  '/var/www/html': { type: 'dir', children: ['index.html', 'robots.txt'] },
  '/var/www/html/index.html': { type: 'file', content: '<!DOCTYPE html>\n<html>\n<head><title>Target Corp</title></head>\n<body><h1>Bienvenido a Target Corp</h1><p>Login de empleados abajo.</p></body>\n</html>' },
  '/var/www/html/robots.txt': { type: 'file', content: 'User-agent: *\nDisallow: /admin\nDisallow: /backup\nDisallow: /.git\nDisallow: /admin-panel-x7' },
  '/root': { type: 'dir', children: ['flag.txt'], protected: true },
  '/root/flag.txt': { type: 'file', content: '🏴 FLAG{p3n7357_c0mpl3t0_ch4sk1b0ts_2024}\n\n¡Felicidades! Completaste la escalada de privilegios.\nDocumenta este hallazgo en tu informe de pentest.' },
  '/tmp': { type: 'dir', children: [] },
  '/usr': { type: 'dir', children: ['bin'] },
  '/usr/bin': { type: 'dir', children: ['nmap', 'sqlmap', 'hydra', 'john', 'hashcat', 'curl', 'ssh'] },
  '/opt': { type: 'dir', children: ['targetcorp'] },
  '/opt/targetcorp': { type: 'dir', children: ['config.yml'] },
  '/opt/targetcorp/config.yml': { type: 'file', content: 'db:\n  host: 10.0.0.5\n  user: admin\n  password: "T@rg3tDB2024!"\n  name: production\napp:\n  debug: true\n  secret_key: "dev-key-not-for-production"' },
}

// ============================================================
// COMMAND PROCESSOR
// ============================================================
interface OutputLine {
  text: string
  type: 'normal' | 'error' | 'success' | 'info' | 'warning' | 'system' | 'input'
}

function simpleHash(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) { hash = ((hash << 5) - hash) + text.charCodeAt(i); hash |= 0 }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

function caesarCipher(text: string, shift: number, decrypt: boolean = false): string {
  if (decrypt) shift = -shift
  return text.split('').map(c => {
    if (c >= 'a' && c <= 'z') return String.fromCharCode(((c.charCodeAt(0) - 97 + shift + 260) % 26) + 97)
    if (c >= 'A' && c <= 'Z') return String.fromCharCode(((c.charCodeAt(0) - 65 + shift + 260) % 26) + 65)
    return c
  }).join('')
}

function processCommand(
  input: string,
  cwd: string,
  setCwd: (p: string) => void,
  history: string[],
  isSudo: boolean
): OutputLine[] {
  const parts = input.trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []
  const cmd = parts[0]?.toLowerCase()
  const args = parts.slice(1).map(a => a.replace(/^["']|["']$/g, ''))

  const resolvePath = (p: string): string => {
    if (!p) return cwd
    if (p === '~') return '/home/hacker'
    if (p.startsWith('~/')) return '/home/hacker/' + p.slice(2)
    if (p.startsWith('/')) return p
    if (p === '..') {
      const segs = cwd.split('/').filter(Boolean)
      segs.pop()
      return '/' + segs.join('/')
    }
    if (p === '.') return cwd
    return cwd === '/' ? `/${p}` : `${cwd}/${p}`
  }

  const getNode = (path: string) => FILE_SYSTEM[path]

  switch (cmd) {
    case 'ls': {
      const filteredArgs = args.filter(a => !a.startsWith('-'))
      const target = resolvePath(filteredArgs[0] || '')
      const node = getNode(target)
      if (!node) return [{ text: `ls: no se puede acceder a '${filteredArgs[0] || target}': No existe`, type: 'error' }]
      if (node.protected && !isSudo) return [{ text: `ls: permiso denegado: ${target}`, type: 'error' }]
      if (node.type !== 'dir') return [{ text: target.split('/').pop() || '', type: 'normal' }]
      const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al')
      let children = node.children || []
      if (args.includes('-a') || args.includes('-la') || args.includes('-al')) children = ['.', '..', ...children]
      if (showLong) {
        const lines: OutputLine[] = [{ text: `total ${children.length * 4}`, type: 'normal' }]
        children.forEach((c: string) => {
          const childPath = target === '/' ? `/${c}` : `${target}/${c}`
          const childNode = getNode(childPath)
          const isDir = c === '.' || c === '..' || (childNode && childNode.type === 'dir')
          const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--'
          const size = childNode?.content ? childNode.content.length : 4096
          lines.push({ text: `${perms} 1 hacker hacker ${String(size).padStart(6)} Jun 15 10:00 ${c}${isDir ? '/' : ''}`, type: 'normal' })
        })
        return lines
      }
      const colored = children.map((c: string) => {
        const childPath = target === '/' ? `/${c}` : `${target}/${c}`
        const childNode = getNode(childPath)
        return (childNode && childNode.type === 'dir') ? `${c}/` : c
      })
      return [{ text: colored.join('  '), type: 'normal' }]
    }

    case 'cd': {
      const target = resolvePath(args[0] || '~')
      const node = getNode(target)
      if (!node) return [{ text: `cd: ${args[0]}: No existe el directorio`, type: 'error' }]
      if (node.type !== 'dir') return [{ text: `cd: ${args[0]}: No es un directorio`, type: 'error' }]
      if (node.protected && !isSudo) return [{ text: `cd: ${args[0]}: Permiso denegado`, type: 'error' }]
      setCwd(target)
      return []
    }

    case 'pwd':
      return [{ text: cwd, type: 'normal' }]

    case 'cat': {
      if (!args[0]) return [{ text: 'cat: falta operando de archivo', type: 'error' }]
      const target = resolvePath(args[0])
      const node = getNode(target)
      if (!node) return [{ text: `cat: ${args[0]}: No existe el archivo`, type: 'error' }]
      if (node.type === 'dir') return [{ text: `cat: ${args[0]}: Es un directorio`, type: 'error' }]
      if (node.protected && !isSudo) return [{ text: node.content || 'Permiso denegado', type: 'error' }]
      return node.content.split('\n').map((l: string) => ({ text: l, type: 'normal' as const }))
    }

    case 'mkdir':
      return args[0] ? [{ text: `Directorio '${args[0]}' creado`, type: 'success' }] : [{ text: 'mkdir: falta operando', type: 'error' }]

    case 'touch':
      return args[0] ? [{ text: `Archivo '${args[0]}' creado`, type: 'success' }] : [{ text: 'touch: falta operando', type: 'error' }]

    case 'rm':
      if (!args[0]) return [{ text: 'rm: falta operando', type: 'error' }]
      if (args[0] === '-rf' && args[1] === '/') return [{ text: '⚠️ ¡Operación bloqueada! rm -rf / destruiría todo el sistema.', type: 'warning' }]
      return [{ text: `'${args[args.length - 1]}' eliminado`, type: 'success' }]

    case 'whoami':
      return [{ text: isSudo ? 'root' : 'hacker', type: 'normal' }]

    case 'id':
      return [{ text: isSudo ? 'uid=0(root) gid=0(root) groups=0(root)' : 'uid=1000(hacker) gid=1000(hacker) groups=1000(hacker),27(sudo)', type: 'normal' }]

    case 'sudo': {
      if (args.length === 0) return [{ text: 'uso: sudo <comando>', type: 'error' }]
      const sudoCmd = args.join(' ')
      return [
        { text: '[sudo] contraseña para hacker: ********', type: 'system' },
        ...processCommand(sudoCmd, cwd, setCwd, history, true)
      ]
    }

    case 'find': {
      if (args.includes('-mmin')) {
        return [
          { text: 'Buscando archivos modificados en la última hora...', type: 'info' },
          { text: '/tmp/.hidden_shell.sh', type: 'warning' },
          { text: '/var/www/html/uploads/shell.php', type: 'warning' },
          { text: '2 archivos sospechosos encontrados — posible actividad maliciosa', type: 'error' },
        ]
      }
      const pattern = args.find(a => !a.startsWith('/')) || '*'
      const results: OutputLine[] = [{ text: `Buscando "${pattern}" desde ${cwd}...`, type: 'info' }]
      Object.keys(FILE_SYSTEM).forEach(path => {
        if (path.startsWith(cwd) && path.includes(pattern.replace('*', ''))) {
          results.push({ text: path, type: 'normal' })
        }
      })
      if (results.length === 1) results.push({ text: 'No se encontraron resultados', type: 'warning' })
      return results
    }

    case 'grep': {
      if (args.length < 2) return [{ text: 'uso: grep <patrón> <archivo>', type: 'error' }]
      const pattern = args[0]
      const target = resolvePath(args[1])
      const node = getNode(target)
      if (!node || node.type === 'dir') return [{ text: `grep: ${args[1]}: No es un archivo`, type: 'error' }]
      const lines = node.content.split('\n').filter((l: string) => l.toLowerCase().includes(pattern.toLowerCase()))
      if (lines.length === 0) return [{ text: '(sin coincidencias)', type: 'warning' }]
      return lines.map((l: string) => ({ text: l.replace(new RegExp(`(${pattern})`, 'gi'), '[$1]'), type: 'success' as const }))
    }

    case 'head': {
      const target = resolvePath(args[0] || '')
      const node = getNode(target)
      if (!node || node.type === 'dir') return [{ text: `head: ${args[0] || ''}: error`, type: 'error' }]
      return node.content.split('\n').slice(0, 5).map((l: string) => ({ text: l, type: 'normal' as const }))
    }

    case 'tail': {
      const target = resolvePath(args[0] || '')
      const node = getNode(target)
      if (!node || node.type === 'dir') return [{ text: `tail: ${args[0] || ''}: error`, type: 'error' }]
      return node.content.split('\n').slice(-5).map((l: string) => ({ text: l, type: 'normal' as const }))
    }

    case 'chmod':
      return args.length >= 2 ? [{ text: `Permisos de '${args[1]}' cambiados a ${args[0]}`, type: 'success' }] : [{ text: 'uso: chmod <permisos> <archivo>', type: 'error' }]

    case 'history':
      return history.slice(-15).map((h, i) => ({ text: `  ${i + 1}  ${h}`, type: 'normal' as const }))

    case 'clear':
      return [{ text: '__CLEAR__', type: 'system' }]

    case 'echo':
      return [{ text: args.join(' '), type: 'normal' }]

    case 'date':
      return [{ text: new Date().toLocaleString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }), type: 'normal' }]

    case 'uptime':
      return [{ text: `${new Date().toLocaleTimeString('es-EC')} up ${Math.floor(Math.random() * 30 + 1)} days, 3 users, load average: 0.42, 0.38, 0.35`, type: 'normal' }]

    case 'uname':
      return [{ text: args.includes('-a') ? 'Linux target-corp 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux' : 'Linux', type: 'normal' }]

    case 'df':
      return [
        { text: 'Filesystem     Size  Used  Avail Use% Mounted on', type: 'info' },
        { text: '/dev/sda1       50G   12G   35G   26% /', type: 'normal' },
      ]

    case 'free':
      return [
        { text: '              total        used        free      shared  buff/cache   available', type: 'info' },
        { text: 'Mem:       16384000     8234000     4150000      256000     4000000     7894000', type: 'normal' },
      ]

    case 'ps':
      return [
        { text: '  PID TTY          TIME CMD', type: 'info' },
        { text: '    1 ?        00:00:03 systemd', type: 'normal' },
        { text: ' 1234 ?        00:00:01 sshd', type: 'normal' },
        { text: ' 5678 ?        00:00:05 nginx', type: 'normal' },
        { text: ' 6021 ?        00:00:02 mysqld', type: 'normal' },
        { text: ' 9012 pts/0    00:00:00 bash', type: 'normal' },
      ]

    case 'top':
      return [
        { text: `top - ${new Date().toLocaleTimeString('es-EC')} up 15 days, load: 0.42, 0.38, 0.35`, type: 'info' },
        { text: 'Tasks: 127 total, 2 running, 125 sleeping', type: 'normal' },
        { text: '%Cpu(s): 12.5 us, 3.2 sy, 0.0 ni, 83.1 id', type: 'normal' },
        { text: '', type: 'normal' },
        { text: '  PID USER      %CPU %MEM    COMMAND', type: 'info' },
        { text: ' 5678 www-data  15.2  4.5    nginx', type: 'normal' },
        { text: ' 6021 mysql      8.7  12.3   mysqld', type: 'normal' },
      ]

    case 'netstat':
    case 'ss':
      return [
        { text: 'Proto  Local Address       Foreign Address     State', type: 'info' },
        { text: 'tcp    0.0.0.0:22          0.0.0.0:*           LISTEN', type: 'normal' },
        { text: 'tcp    0.0.0.0:80          0.0.0.0:*           LISTEN', type: 'normal' },
        { text: 'tcp    0.0.0.0:3306        0.0.0.0:*           LISTEN', type: 'normal' },
        { text: 'tcp    10.0.0.10:22        10.0.0.99:51260     ESTABLISHED', type: 'warning' },
      ]

    case 'ifconfig':
    case 'ip':
      return [
        { text: 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500', type: 'info' },
        { text: '        inet 10.0.0.10  netmask 255.255.255.0  broadcast 10.0.0.255', type: 'normal' },
        { text: '        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000  (Ethernet)', type: 'normal' },
      ]

    case 'man': {
      if (!args[0]) return [{ text: '¿Qué manual deseas? Uso: man <comando>', type: 'error' }]
      return [
        { text: `╔══════════════════════════════════════╗`, type: 'info' },
        { text: `║  MANUAL: ${args[0].padEnd(26)}║`, type: 'info' },
        { text: `╠══════════════════════════════════════╣`, type: 'info' },
        { text: `║  Herramienta de hacking ético         ║`, type: 'normal' },
        { text: `║  Usa 'help' para ver todos los comandos║`, type: 'normal' },
        { text: `╚══════════════════════════════════════╝`, type: 'info' },
      ]
    }

    case '':
      return []

    default:
      return [{ text: `bash: ${cmd}: comando no encontrado. Escribe 'help' para ver comandos disponibles.`, type: 'error' }]
  }
}

// ============================================================
// RENDER THEORY (markdown mini)
// ============================================================
function renderTheory(text: string) {
  const formatInline = (s: string) => {
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    s = s.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-700/50 text-green-300 rounded text-[10px] font-mono">$1</code>')
    return <span dangerouslySetInnerHTML={{ __html: s }} />
  }
  return text.split('\n').map((line, i) => {
    if (line.startsWith('```')) return null
    if (line.startsWith('# ')) return <h1 key={i} className="text-gray-100 text-sm font-bold mt-3 mb-1.5">{line.slice(2)}</h1>
    if (line.startsWith('## ')) return <h2 key={i} className="text-gray-200 text-[13px] font-bold mt-3 mb-1">{line.slice(3)}</h2>
    if (line.startsWith('### ')) return <h3 key={i} className="text-gray-300 text-xs font-semibold mt-2 mb-1">{line.slice(4)}</h3>
    if (line.startsWith('| ')) return <div key={i} className="text-gray-400 text-[10px] font-mono mb-0.5">{line}</div>
    if (line.startsWith('- ')) return <li key={i} className="text-gray-400 text-[11px] ml-3 mb-0.5 list-disc">{formatInline(line.slice(2))}</li>
    if (line.trim() === '') return <div key={i} className="h-1.5" />
    return <p key={i} className="text-gray-400 text-[11px] leading-relaxed mb-1">{formatInline(line)}</p>
  })
}

// ============================================================
// MAIN COMPONENT
// ============================================================
interface HackingTerminalProps {
  levelId: string
  userId?: string
  userName?: string
}

export default function HackingTerminal({ levelId, userId, userName }: HackingTerminalProps) {
  const { user } = useAuth()

  const [output, setOutput] = useState<OutputLine[]>([
    { text: '╔══════════════════════════════════════════════════════════╗', type: 'system' },
    { text: '║   🛡️  Hacking Terminal Professional — ChaskiBots Lab     ║', type: 'system' },
    { text: '║   Objetivo autorizado: target-corp.com (10.0.0.10)       ║', type: 'system' },
    { text: '╚══════════════════════════════════════════════════════════╝', type: 'system' },
    { text: '', type: 'normal' },
    { text: "Escribe 'help' para ver los comandos disponibles.", type: 'info' },
    { text: "🎯 Reto: escala privilegios y captura la flag en /root/flag.txt", type: 'warning' },
    { text: '', type: 'normal' },
  ])
  const [inputValue, setInputValue] = useState('')
  const [cwd, setCwd] = useState('/home/hacker')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showCurriculum, setShowCurriculum] = useState(true)
  const [showLessonPanel, setShowLessonPanel] = useState(false)

  const [modules, setModules] = useState<ApiModule[]>([])
  const [curriculumLoading, setCurriculumLoading] = useState(true)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [activeLesson, setActiveLesson] = useState<ApiLessonFull | null>(null)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())

  const [studentName, setStudentName] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/academy?course=hacking')
      .then(r => r.json())
      .then(data => setModules(data.modules || []))
      .catch(() => {})
      .finally(() => setCurriculumLoading(false))
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hacking-terminal-progress')
      if (saved) setCompletedLessons(new Set(JSON.parse(saved)))
      const savedName = localStorage.getItem('hacking-terminal-student')
      if (savedName) setStudentName(savedName)
      else if (user?.name) setStudentName(user.name)
    } catch {}
  }, [user?.name])

  useEffect(() => {
    try {
      localStorage.setItem('hacking-terminal-progress', JSON.stringify(Array.from(completedLessons)))
      if (studentName) localStorage.setItem('hacking-terminal-student', studentName)
    } catch {}
  }, [completedLessons, studentName])

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [output])

  const focusInput = () => inputRef.current?.focus()

  const executeCommand = (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return

    setCommandHistory(prev => [...prev, trimmed])
    setHistoryIndex(-1)

    const promptLine: OutputLine = { text: `hacker@chaskibots-lab:${cwd}$ ${trimmed}`, type: 'input' }
    const result = processCommand(trimmed, cwd, setCwd, [...commandHistory, trimmed], false)

    if (result.length === 1 && result[0].text === '__CLEAR__') {
      setOutput([])
    } else {
      setOutput(prev => [...prev, promptLine, ...result])
    }
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(inputValue)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIdx)
        setInputValue(commandHistory[newIdx])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex >= 0) {
        const newIdx = historyIndex + 1
        if (newIdx >= commandHistory.length) {
          setHistoryIndex(-1)
          setInputValue('')
        } else {
          setHistoryIndex(newIdx)
          setInputValue(commandHistory[newIdx])
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const node = FILE_SYSTEM[cwd]
      if (node && node.type === 'dir') {
        const parts = inputValue.split(' ')
        const last = parts[parts.length - 1]
        const match = node.children.find((c: string) => c.startsWith(last))
        if (match) {
          parts[parts.length - 1] = match
          setInputValue(parts.join(' '))
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setOutput([])
    }
  }

  const loadLesson = async (lesson: ApiLessonStub) => {
    setLessonLoading(true)
    setShowLessonPanel(true)
    try {
      const res = await fetch(`/api/academy?lesson=${lesson.id}`)
      const data = await res.json()
      if (data) {
        if (typeof data.examples === 'string') data.examples = JSON.parse(data.examples)
        if (typeof data.challenges === 'string') data.challenges = JSON.parse(data.challenges)
        setActiveLesson(data)
        setOutput(prev => [
          ...prev,
          { text: '', type: 'normal' },
          { text: `📚 Lección: ${data.title}`, type: 'info' },
          { text: `─────────────────────────────────────`, type: 'system' },
          { text: data.description, type: 'normal' },
          { text: '', type: 'normal' },
          { text: '💡 Usa los ejemplos del panel derecho para practicar', type: 'success' },
        ])
      }
    } catch {
      setOutput(prev => [...prev, { text: '❌ Error cargando lección', type: 'error' }])
    }
    setLessonLoading(false)
  }

  const markLessonComplete = () => {
    if (!activeLesson) return
    const newCompleted = new Set(completedLessons)
    newCompleted.add(activeLesson.id)
    setCompletedLessons(newCompleted)
    setOutput(prev => [...prev, { text: '', type: 'normal' }, { text: '🎉 ¡Lección completada! +⭐', type: 'success' }])

    if (user?.id) {
      fetch('/api/academy/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, lessonId: activeLesson.id, completed: true, score: 100 }),
      }).catch(() => {})
    }
  }

  const handleSendToTeacher = async () => {
    if (!studentName.trim()) {
      setOutput(prev => [...prev, { text: '⚠️ Escribe tu nombre para enviar', type: 'warning' }])
      return
    }
    setIsSending(true)
    try {
      const lastCommands = commandHistory.slice(-20).join('\n')
      const lastOutput = output.slice(-30).map(o => o.text).join('\n')
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: `HACK-${Date.now().toString(36).toUpperCase()}`,
          studentName,
          studentEmail: user?.email || undefined,
          code: `# Historial de comandos:\n${lastCommands}`,
          output: lastOutput,
          levelId: user?.levelId || levelId || undefined,
          lessonId: activeLesson?.id || undefined,
        })
      })
      if (res.ok) {
        setSendSuccess(true)
        setOutput(prev => [...prev, { text: '✅ Sesión enviada al profesor', type: 'success' }])
        setTimeout(() => setSendSuccess(false), 4000)
      }
    } catch {
      setOutput(prev => [...prev, { text: '❌ Error de conexión al enviar', type: 'error' }])
    }
    setIsSending(false)
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const progressPct = totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0

  return (
    <div className={`flex flex-col bg-[#0d1117] rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[750px]'}`}>
      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-[#0d1117] via-[#1a0d0d] to-[#0d1117] border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:brightness-125" onClick={() => setIsFullscreen(false)} />
            <div className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer hover:brightness-125" />
            <div className="w-3 h-3 rounded-full bg-green-500 cursor-pointer hover:brightness-125" onClick={() => setIsFullscreen(!isFullscreen)} />
          </div>
          <div className="flex items-center gap-2">
            <Image src="/chaski.png" alt="ChaskiBots" width={24} height={24} className="rounded-md" />
            <div className="flex flex-col">
              <span className="text-gray-200 text-sm font-bold leading-tight">Hacking Terminal</span>
              <span className="text-[9px] text-gray-500 leading-tight">by ChaskiBots Lab</span>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
            <Skull className="w-3 h-3" /> Sesión Activa
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => navigator.clipboard.writeText(output.map(o => o.text).join('\n'))} className="p-2 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Copiar salida">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={() => {
            const blob = new Blob([output.map(o => o.text).join('\n')], { type: 'text/plain' })
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hacking-session.log'; a.click()
          }} className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Descargar log">
            <Download className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-700/50 mx-0.5" />
          <button onClick={() => setShowCurriculum(!showCurriculum)} className={`p-2 rounded-lg transition-colors ${showCurriculum ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title="Curriculum">
            <GraduationCap className="w-4 h-4" />
          </button>
          <button onClick={() => setShowLessonPanel(!showLessonPanel)} className={`p-2 rounded-lg transition-colors ${showLessonPanel ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title="Panel de Lección">
            <BookOpen className="w-4 h-4" />
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── LEFT: CURRICULUM SIDEBAR ─── */}
        {showCurriculum && (
          <div className="w-72 bg-[#0d1117] border-r border-gray-700/50 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  Plan de Pentest
                </h3>
                <span className="text-[11px] text-gray-500">{completedLessons.size}/{totalLessons}</span>
              </div>
              <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
              {completedLessons.size > 0 && (
                <p className="text-[11px] text-gray-500 mt-1">⭐ {completedLessons.size} lecciones completadas</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {curriculumLoading && (
                <div className="flex items-center justify-center gap-2 py-8 text-gray-500 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando plan de pentest...
                </div>
              )}
              {!curriculumLoading && modules.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-[11px]">Plan no disponible</p>
                  <p className="text-gray-600 text-[10px] mt-1">Practica con los comandos de la terminal</p>
                </div>
              )}
              {modules.map((module) => {
                const moduleDone = module.lessons.filter(l => completedLessons.has(l.id)).length
                return (
                  <div key={module.id}>
                    <button
                      onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                      disabled={module.lessons.length === 0}
                      className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-700/30 transition-colors text-left group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {activeModule === module.id ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
                      <span className="text-sm flex-shrink-0">{module.icon || '🛡️'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-300 text-xs font-medium truncate">{module.title}</div>
                        <div className="text-[10px] text-gray-600">
                          {module.lessons.length === 0 ? 'Próximamente' : `${moduleDone}/${module.lessons.length} completadas`}
                        </div>
                      </div>
                    </button>

                    {activeModule === module.id && (
                      <div className="ml-5 mt-1 space-y-0.5 pb-2">
                        {module.lessons.map((lesson) => {
                          const isComplete = completedLessons.has(lesson.id)
                          const isActive = activeLesson?.id === lesson.id
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => loadLesson(lesson)}
                              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                                isActive ? 'bg-red-500/20 border border-red-500/40 shadow-sm shadow-red-500/10' : 'hover:bg-gray-700/30'
                              }`}
                            >
                              {isComplete ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className={`text-[11px] truncate ${isActive ? 'text-red-300 font-medium' : 'text-gray-400'}`}>
                                  {lesson.title}
                                </div>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                lesson.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                                lesson.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                'bg-red-500/10 text-red-400'
                              }`}>
                                {(DIFFICULTY_LABEL[lesson.difficulty] || lesson.difficulty).slice(0, 4)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="p-3 border-t border-gray-700/50">
              <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Comandos rápidos
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {['help', 'whois target-corp.com', 'nmap -sV 10.0.0.10', "sqli login admin' OR 1=1 --", 'cat /var/log/auth.log', 'sudo cat /root/flag.txt'].map(cmdStr => (
                  <button
                    key={cmdStr}
                    onClick={() => { executeCommand(cmdStr) }}
                    className="text-[10px] px-2 py-1 rounded-md bg-gray-700/50 text-gray-400 hover:bg-red-500/15 hover:text-red-400 border border-gray-600/50 hover:border-red-500/30 transition-all"
                  >
                    $ {cmdStr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── CENTER: TERMINAL ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div
            ref={terminalRef}
            onClick={focusInput}
            className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed bg-[#0d1117] cursor-text"
          >
            {output.map((line, idx) => (
              <div key={idx} className={`whitespace-pre-wrap ${
                line.type === 'error' ? 'text-red-400' :
                line.type === 'success' ? 'text-green-400' :
                line.type === 'info' ? 'text-cyan-400' :
                line.type === 'warning' ? 'text-yellow-400' :
                line.type === 'system' ? 'text-red-500/70' :
                line.type === 'input' ? 'text-gray-300' :
                'text-gray-400'
              }`}>
                {line.text || ' '}
              </div>
            ))}

            <div className="flex items-center text-gray-300 mt-1">
              <span className="text-red-400 font-bold mr-1">hacker</span>
              <span className="text-gray-500">@</span>
              <span className="text-cyan-400">chaskibots-lab</span>
              <span className="text-gray-500">:</span>
              <span className="text-blue-400">{cwd === '/home/hacker' ? '~' : cwd}</span>
              <span className="text-gray-300 mr-2">$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-gray-200 caret-red-400"
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOutput([])}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpiar
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(output.map(o => o.text).join('\n'))}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Copiar"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {activeLesson && (
                <>
                  <div className="w-px h-5 bg-gray-700 mx-1" />
                  <button onClick={markLessonComplete} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/80 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completar Lección
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Tu nombre..."
                className="px-3 py-1.5 bg-gray-800/80 border border-gray-600/50 rounded-lg text-xs text-gray-300 w-32 placeholder:text-gray-600 focus:border-red-500/50 focus:outline-none transition-colors"
              />
              <button
                onClick={handleSendToTeacher}
                disabled={isSending || sendSuccess || !studentName.trim()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sendSuccess ? 'bg-green-600 text-white' : 'bg-emerald-600/80 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
                }`}
              >
                {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : sendSuccess ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                {sendSuccess ? 'Enviado ✓' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: LESSON PANEL ─── */}
        {showLessonPanel && (activeLesson || lessonLoading) && (
          <div className="w-80 bg-[#0d1117] border-l border-gray-700/50 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-700/50">
              <h3 className="text-white text-sm font-bold truncate">{activeLesson?.title || 'Cargando...'}</h3>
              <button onClick={() => setShowLessonPanel(false)} className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-700/50">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {lessonLoading && (
              <div className="flex-1 flex items-center justify-center gap-2 text-gray-500 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando lección...
              </div>
            )}

            {!lessonLoading && activeLesson && (
              <div className="flex-1 overflow-y-auto">
                <div className="px-3 pt-3 pb-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${DIFFICULTY_COLOR[activeLesson.difficulty]}`}>
                    {DIFFICULTY_LABEL[activeLesson.difficulty] || activeLesson.difficulty}
                  </span>
                  <span className="text-[10px] text-gray-600 ml-2">⏱ {activeLesson.estimated_minutes} min</span>
                  <p className="text-gray-500 text-xs mt-2">{activeLesson.description}</p>
                </div>

                <div className="p-3 border-t border-gray-700/30">
                  <h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-red-400" /> Teoría
                  </h4>
                  <div className="leading-relaxed">
                    {renderTheory(activeLesson.theory)}
                  </div>
                </div>

                {activeLesson.examples?.length > 0 && (
                  <div className="p-3 border-t border-gray-700/30">
                    <h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Code className="w-3 h-3 text-cyan-400" /> Ejemplos ({activeLesson.examples.length})
                    </h4>
                    <div className="space-y-1.5">
                      {activeLesson.examples.map((ex, idx) => (
                        <button
                          key={idx}
                          onClick={() => executeCommand(ex.code)}
                          className="w-full text-left px-2.5 py-2 rounded-lg bg-gray-700/20 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors"
                        >
                          <div className="text-[11px] text-red-300 font-mono break-all">$ {ex.code}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{ex.explanation}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeLesson.challenges?.length > 0 && (
                  <div className="p-3 border-t border-gray-700/30">
                    <h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Trophy className="w-3 h-3 text-orange-400" /> Desafíos
                    </h4>
                    <div className="space-y-2">
                      {activeLesson.challenges.map((ch, idx) => (
                        <div key={idx} className="rounded-lg p-2.5 border bg-gray-700/20 border-gray-700/40">
                          <div className="text-[11px] text-orange-300 font-medium">{ch.title}</div>
                          <p className="text-gray-400 text-[11px] leading-relaxed mt-1">{ch.description}</p>
                          {ch.hints?.length > 0 && (
                            <ul className="mt-1.5 space-y-1">
                              {ch.hints.map((hint, hi) => (
                                <li key={hi} className="text-gray-500 text-[10px] flex items-start gap-1">
                                  <span className="text-red-500/70 flex-shrink-0">▸</span>
                                  <span>{hint}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {ch.starter_code && (
                            <button
                              onClick={() => executeCommand(ch.starter_code)}
                              className="mt-2 flex items-center gap-1 px-2.5 py-1 bg-red-600/70 hover:bg-red-500 text-white rounded-md text-[10px] font-medium transition-colors"
                            >
                              <Terminal className="w-3 h-3" /> Ejecutar en terminal
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
