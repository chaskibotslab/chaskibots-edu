'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  Terminal, ChevronRight, ChevronDown, Shield, Code,
  Loader2, Maximize2, Minimize2, X, Trash2, Copy, Download, Send,
  Check, GraduationCap, Trophy, CheckCircle2, Circle, BookOpen,
  Zap, Skull, Lock, Key, Eye, EyeOff
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

function checkPasswordStrength(password: string): { score: number; label: string; tips: string[] } {
  let score = 0
  const tips: string[] = []
  if (password.length >= 8) score++; else tips.push('Usa al menos 8 caracteres')
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++; else tips.push('Agrega minúsculas')
  if (/[A-Z]/.test(password)) score++; else tips.push('Agrega mayúsculas')
  if (/[0-9]/.test(password)) score++; else tips.push('Agrega números')
  if (/[^a-zA-Z0-9]/.test(password)) score++; else tips.push('Agrega símbolos (!@#$%)')
  if (!/(.)\1{2,}/.test(password)) score++; else tips.push('Evita caracteres repetidos')
  const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte', 'Excelente']
  return { score, label: labels[Math.min(score, labels.length - 1)], tips }
}

function processCommand(
  input: string,
  cwd: string,
  setCwd: (p: string) => void,
  history: string[],
  isSudo: boolean,
  userFiles: any[] = []
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
        ...processCommand(sudoCmd, cwd, setCwd, history, true, userFiles)
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

    // ═══ OSINT / RECONOCIMIENTO ═══
    case 'whois': {
      if (!args[0]) return [{ text: 'uso: whois <dominio>', type: 'error' }]
      return [
        { text: `Domain Name: ${args[0].toUpperCase()}`, type: 'info' },
        { text: 'Registrant: Target Corp S.A.', type: 'normal' },
        { text: 'Registrant Email: admin@target-corp.com', type: 'normal' },
        { text: 'Creation Date: 2018-03-14', type: 'normal' },
        { text: 'Registrar: NameSecure LLC', type: 'normal' },
        { text: 'Name Server: ns1.target-corp.com', type: 'normal' },
        { text: 'Name Server: ns2.target-corp.com', type: 'normal' },
      ]
    }

    case 'nslookup': {
      if (!args[0]) return [{ text: 'uso: nslookup <dominio>', type: 'error' }]
      return [
        { text: `Server:  8.8.8.8`, type: 'info' },
        { text: '', type: 'normal' },
        { text: `Nombre: ${args[0]}`, type: 'normal' },
        { text: `Address: 10.0.0.10`, type: 'success' },
      ]
    }

    case 'dig': {
      if (!args[0]) return [{ text: 'uso: dig <dominio> [ANY]', type: 'error' }]
      return [
        { text: `; <<>> DiG 9.18.1 <<>> ${args.join(' ')}`, type: 'system' },
        { text: `${args[0]}.        3600  IN  A      10.0.0.10`, type: 'normal' },
        { text: `${args[0]}.        3600  IN  MX     10 mail.target-corp.com`, type: 'normal' },
        { text: `${args[0]}.        3600  IN  NS     ns1.target-corp.com`, type: 'normal' },
        { text: `${args[0]}.        3600  IN  TXT    "v=spf1 include:_spf.target-corp.com ~all"`, type: 'normal' },
      ]
    }

    case 'dork': {
      const query = args.join(' ')
      if (!query) return [{ text: 'uso: dork <consulta estilo Google>', type: 'error' }]
      const lines: OutputLine[] = [{ text: `🔎 Simulando búsqueda: ${query}`, type: 'info' }, { text: '', type: 'normal' }]
      if (query.includes('filetype:txt') || query.includes('password')) {
        lines.push(
          { text: '1. target-corp.com/backup/backup_passwords.txt', type: 'success' },
          { text: '   "admin:T@rg3tDB2024! — no borrar antes del deploy"', type: 'warning' },
        )
      } else if (query.includes('filetype:pdf')) {
        lines.push({ text: '1. target-corp.com/docs/organigrama_2023.pdf', type: 'success' })
      } else if (query.includes('index of')) {
        lines.push({ text: '1. target-corp.com/uploads/ — Index of /uploads (directorio expuesto)', type: 'success' })
      } else {
        lines.push({ text: '(sin resultados relevantes — prueba con filetype: o site:)', type: 'warning' })
      }
      return lines
    }

    case 'nmap': {
      const flags = args.filter(a => a.startsWith('-'))
      const target = args.find(a => !a.startsWith('-') && a !== 'vuln')
      if (!target) return [{ text: 'uso: nmap [flags] <ip/host>', type: 'error' }]
      const withVersion = flags.includes('-sV') || args.includes('-sC')
      const lines: OutputLine[] = [
        { text: 'Starting Nmap 7.94 ( https://nmap.org )', type: 'system' },
        { text: `Scanning ${target}${flags.length ? ' [' + flags.join(' ') + ']' : ''}...`, type: 'info' },
        { text: '', type: 'normal' },
        { text: 'PORT     STATE    SERVICE' + (withVersion ? '  VERSION' : ''), type: 'info' },
        { text: `22/tcp   open     ssh${withVersion ? '      OpenSSH 7.6p1 Ubuntu' : ''}`, type: 'success' },
        { text: `80/tcp   open     http${withVersion ? '     Apache httpd 2.4.29' : ''}`, type: 'success' },
        { text: `443/tcp  open     https${withVersion ? '    Apache httpd 2.4.29 (TLS)' : ''}`, type: 'success' },
        { text: `3306/tcp open     mysql${withVersion ? '    MySQL 5.7.33' : ''}`, type: 'warning' },
        { text: `8080/tcp closed   http-proxy`, type: 'normal' },
      ]
      if (args.includes('vuln') || args.includes('--script')) {
        lines.push(
          { text: '', type: 'normal' },
          { text: '| vuln:', type: 'warning' },
          { text: '|   CVE-2021-41773 — Apache 2.4.29 path traversal (posible)', type: 'error' },
          { text: '|   MySQL 5.7.33 — versión desactualizada, revisar CVEs', type: 'error' },
        )
      }
      lines.push({ text: '', type: 'normal' }, { text: `Nmap done: 1 host up, scanned in 2.34s`, type: 'system' })
      return lines
    }

    case 'dirb':
    case 'gobuster': {
      if (!args[0]) return [{ text: 'uso: dirb <url>', type: 'error' }]
      return [
        { text: `START_TIME: ${new Date().toLocaleString('es-EC')}`, type: 'system' },
        { text: `URL_BASE: ${args[0]}`, type: 'info' },
        { text: '', type: 'normal' },
        { text: '---- Escaneando URL: ' + args[0] + ' ----', type: 'info' },
        { text: '+ /admin (CODE:200|SIZE:1841)', type: 'success' },
        { text: '+ /backup (CODE:301|SIZE:0)', type: 'warning' },
        { text: '+ /.git (CODE:200|SIZE:492)', type: 'error' },
        { text: '+ /api (CODE:200|SIZE:230)', type: 'success' },
        { text: '+ /uploads (CODE:301|SIZE:0)', type: 'warning' },
        { text: '', type: 'normal' },
        { text: 'DOWNLOADED: 4612 - FOUND: 5', type: 'system' },
      ]
    }

    case 'curl': {
      const isHead = args.includes('-I')
      const url = args.find(a => !a.startsWith('-'))
      if (!url) return [{ text: 'uso: curl [-I] <url>', type: 'error' }]
      if (isHead) {
        return [
          { text: `> HEAD ${url}`, type: 'info' },
          { text: 'HTTP/1.1 200 OK', type: 'success' },
          { text: 'Server: Apache/2.4.29 (Ubuntu)', type: 'normal' },
          { text: 'X-Powered-By: PHP/7.2.24', type: 'warning' },
          { text: 'Content-Type: text/html; charset=UTF-8', type: 'normal' },
        ]
      }
      if (url.includes('robots.txt')) {
        return FILE_SYSTEM['/var/www/html/robots.txt'].content.split('\n').map((l: string) => ({ text: l, type: 'normal' as const }))
      }
      return [
        { text: `> GET ${url}`, type: 'info' },
        { text: '< HTTP/1.1 200 OK', type: 'success' },
        { text: '', type: 'normal' },
        { text: '<!DOCTYPE html><html><body><h1>Target Corp</h1></body></html>', type: 'normal' },
      ]
    }

    case 'ssh': {
      if (args.includes('-V')) {
        return [{ text: 'OpenSSH_7.6p1 Ubuntu-4ubuntu0.7, OpenSSL 1.0.2n  7 Dec 2017', type: 'warning' }, { text: '⚠️ Versión desactualizada — vulnerable a varios CVEs', type: 'error' }]
      }
      if (!args[0]) return [{ text: 'uso: ssh <usuario>@<host>', type: 'error' }]
      return [
        { text: `Connecting to ${args[0]}...`, type: 'info' },
        { text: "The authenticity of host can't be established.", type: 'warning' },
        { text: '⚠️ [SIMULACIÓN] Conexión SSH simulada para fines educativos', type: 'warning' },
        { text: 'Welcome to Ubuntu 18.04 LTS (GNU/Linux 5.4.0)', type: 'success' },
      ]
    }

    // ═══ EXPLOTACIÓN WEB ═══
    case 'sqli': {
      const mode = args[0]
      const payload = args.slice(1).join(' ')
      if (mode === 'login') {
        if (/1\s*=\s*1|or\s+true|'--/i.test(payload)) {
          return [
            { text: `Enviando payload al login: ${payload}`, type: 'info' },
            { text: "SELECT * FROM users WHERE username='" + payload + "' AND password=''", type: 'system' },
            { text: '✅ ACCESO CONCEDIDO — Bienvenido, admin (bypass de autenticación exitoso)', type: 'success' },
          ]
        }
        return [{ text: `Enviando payload: ${payload}`, type: 'info' }, { text: '❌ Login fallido — el payload no rompe la lógica SQL', type: 'error' }]
      }
      if (mode === 'union') {
        if (/union\s+select/i.test(payload)) {
          return [
            { text: `Ejecutando: ${payload}`, type: 'info' },
            { text: '', type: 'normal' },
            { text: 'username    | password (hash)', type: 'info' },
            { text: 'admin       | 5f4dcc3b5aa765d61d8327deb882cf99', type: 'success' },
            { text: 'jperez      | e10adc3949ba59abbe56e057f20f883e', type: 'success' },
            { text: '', type: 'normal' },
            { text: '⚠️ Credenciales extraídas de la base de datos', type: 'warning' },
          ]
        }
        return [{ text: '❌ La consulta UNION no coincide en número de columnas', type: 'error' }]
      }
      if (mode === 'blind') {
        const isTrue = /1\s*=\s*1/.test(payload)
        return [
          { text: `Consulta blind: ${payload}`, type: 'info' },
          { text: isTrue ? '✅ Respuesta normal (condición verdadera) — servidor vulnerable' : '⚠️ Respuesta distinta (condición falsa)', type: isTrue ? 'success' : 'warning' },
        ]
      }
      return [{ text: 'uso: sqli <login|union|blind> <payload>', type: 'error' }]
    }

    case 'waf-test': {
      const payload = args.slice(1).join(' ')
      return [
        { text: `Enviando: ${payload}`, type: 'info' },
        { text: '🛡️ ModSecurity: Access denied [id "942100"] [msg "SQL Injection Attack Detected"]', type: 'error' },
        { text: 'BLOQUEADO — el WAF detectó el patrón malicioso', type: 'warning' },
      ]
    }

    case 'xss': {
      const mode = args[0]
      const payload = args.slice(1).join(' ')
      if (mode === 'stored') {
        return [
          { text: `Payload almacenado: ${payload}`, type: 'info' },
          { text: '💾 El payload se guardó en la base de datos (comentario/perfil)', type: 'warning' },
          { text: '⚠️ Se ejecutará automáticamente para CADA usuario que vea la página', type: 'error' },
          { text: '🍪 document.cookie robada: session_id=a8f9c2...', type: 'error' },
        ]
      }
      if (mode === 'bypass') {
        return [
          { text: `Probando bypass de filtro: ${payload}`, type: 'info' },
          { text: '✅ El filtro solo bloquea <script>, este tag pasó sin problema', type: 'success' },
        ]
      }
      return [
        { text: `Payload reflejado: ${payload}`, type: 'info' },
        { text: '⚠️ [XSS] alert() ejecutado en el navegador de la víctima', type: 'warning' },
      ]
    }

    case 'csp-check': {
      if (!args[0]) return [{ text: 'uso: csp-check <dominio>', type: 'error' }]
      return [
        { text: `Verificando Content-Security-Policy en ${args[0]}...`, type: 'info' },
        { text: 'Header CSP: NO CONFIGURADO', type: 'error' },
        { text: '⚠️ Sin CSP, XSS es mucho más fácil de explotar', type: 'warning' },
      ]
    }

    case 'csrf': {
      if (!args[0]) return [{ text: 'uso: csrf <url>', type: 'error' }]
      return [
        { text: `Generando request forjado: ${args[0]}`, type: 'info' },
        { text: '📤 Si la víctima tiene sesión activa y hace click, la acción se ejecuta sin su consentimiento', type: 'warning' },
        { text: '✅ Transferencia simulada ejecutada — no había token CSRF de protección', type: 'error' },
      ]
    }

    case 'idor': {
      if (!args[0]) return [{ text: 'uso: idor <ruta con id>', type: 'error' }]
      return [
        { text: `Solicitando: ${args[0]}`, type: 'info' },
        { text: '👤 { "id": 1, "nombre": "Admin Root", "email": "admin@target-corp.com" }', type: 'warning' },
        { text: '⚠️ Accediste al perfil de otro usuario cambiando el ID — no hay validación de propiedad', type: 'error' },
      ]
    }

    case 'traversal': {
      const p = args[0] || ''
      if (p.includes('etc/passwd')) {
        return [{ text: `Solicitando archivo: ${p}`, type: 'info' }, ...FILE_SYSTEM['/etc/passwd'].content.split('\n').map((l: string) => ({ text: l, type: 'success' as const }))]
      }
      return [{ text: `Solicitando: ${p}`, type: 'info' }, { text: '❌ Ruta no accesible o filtro activo', type: 'error' }]
    }

    case 'cmdinject': {
      const injected = args.join(' ').replace(/^"|"$/g, '')
      return [
        { text: `Input vulnerable recibe: ${injected}`, type: 'info' },
        { text: `Comando del sistema ejecutado en el servidor remoto:`, type: 'warning' },
        { text: injected.includes('whoami') ? 'www-data' : `[salida simulada de: ${injected}]`, type: 'success' },
      ]
    }

    // ═══ ARCHIVOS EN LA NUBE Y PYTHON ═══
    case 'myfiles': {
      if (userFiles.length === 0) {
        return [{ text: '📂 No tienes archivos guardados aún', type: 'warning' }, { text: 'Usa: save <nombre> <contenido>', type: 'info' }]
      }
      return [
        { text: '📂 TUS ARCHIVOS EN LA NUBE:', type: 'info' },
        { text: '', type: 'normal' },
        ...userFiles.map((f: any) => ({ text: `  📄 ${f.name} (${(f.content || '').length} bytes) — ${f.path}`, type: 'normal' as const })),
        { text: '', type: 'normal' },
        { text: `Total: ${userFiles.length} archivo(s). Usa "open <nombre>" o "export <nombre>"`, type: 'success' },
      ]
    }

    case 'open': {
      if (!args[0]) return [{ text: 'uso: open <archivo>', type: 'error' }]
      const cloudFile = userFiles.find((f: any) => f.name === args[0])
      if (cloudFile) {
        return [{ text: `📄 ${cloudFile.name}`, type: 'info' }, ...cloudFile.content.split('\n').map((l: string) => ({ text: l, type: 'normal' as const }))]
      }
      const target = resolvePath(args[0])
      const node = getNode(target)
      if (!node || node.type === 'dir') return [{ text: `Archivo no encontrado: ${args[0]}`, type: 'error' }]
      return node.content.split('\n').map((l: string) => ({ text: l, type: 'normal' as const }))
    }

    case 'python':
    case 'python3': {
      if (!args[0]) return [{ text: '🐍 Python 3.10.0 (simulado)', type: 'info' }, { text: 'Uso: python <archivo.py>', type: 'normal' }]
      const pyFileName = args[0]
      const cloudFile = userFiles.find((f: any) => f.name === pyFileName)
      let content = cloudFile?.content
      if (!content) {
        const localPath = pyFileName.startsWith('/') ? pyFileName : resolvePath(pyFileName)
        const node = getNode(localPath)
        if (node && node.type === 'file') content = node.content
      }
      if (!content) return [{ text: `❌ Archivo no encontrado: ${pyFileName}`, type: 'error' }, { text: 'Usa "ls" o "myfiles" para ver archivos disponibles', type: 'info' }]
      const lines: OutputLine[] = [{ text: '🐍 Ejecutando Python...', type: 'info' }, { text: '─'.repeat(40), type: 'system' }]
      const variables: Record<string, any> = {}
      content.split('\n').forEach((raw: string) => {
        const line = raw.trim()
        if (!line || line.startsWith('#')) return
        const printStr = line.match(/print\s*\(\s*["'](.*)["']\s*\)/)
        if (printStr) { lines.push({ text: printStr[1], type: 'normal' }); return }
        const printVar = line.match(/print\s*\(\s*(.+)\s*\)/)
        if (printVar) {
          const c = printVar[1]
          if (c.startsWith('"') || c.startsWith("'")) lines.push({ text: c.replace(/["']/g, ''), type: 'normal' })
          else if (variables[c] !== undefined) lines.push({ text: String(variables[c]), type: 'normal' })
          else lines.push({ text: c, type: 'normal' })
          return
        }
        const assign = line.match(/^(\w+)\s*=\s*(.+)$/)
        if (assign) {
          const [, varName, value] = assign
          if (value.startsWith('"') || value.startsWith("'")) variables[varName] = value.replace(/["']/g, '')
          else if (!isNaN(Number(value))) variables[varName] = Number(value)
          return
        }
        if (line.startsWith('def ')) {
          const fn = line.match(/def\s+(\w+)/)
          if (fn) lines.push({ text: `[Función ${fn[1]}() definida]`, type: 'system' })
        }
      })
      lines.push({ text: '─'.repeat(40), type: 'system' }, { text: '✅ Ejecución completada', type: 'success' })
      return lines
    }

    case 'run': {
      if (!args[0]) return [{ text: 'uso: run <archivo>', type: 'error' }]
      if (args[0].endsWith('.py')) return processCommand(`python ${args[0]}`, cwd, setCwd, history, isSudo, userFiles)
      return [{ text: `Tipo de archivo no soportado: ${args[0]}`, type: 'error' }, { text: 'Archivos soportados: .py', type: 'info' }]
    }

    case 'edit':
    case 'nano':
    case 'vim': {
      if (!args[0]) return [{ text: 'uso: edit <archivo>', type: 'error' }]
      return [
        { text: `📝 Editor de texto: ${args[0]}`, type: 'info' },
        { text: '─'.repeat(40), type: 'system' },
        { text: 'Para crear/editar archivos usa:', type: 'normal' },
        { text: `  save ${args[0]} <contenido>`, type: 'success' },
        { text: '', type: 'normal' },
        { text: 'Ejemplo:', type: 'normal' },
        { text: `  save ${args[0]} print("Hola Mundo!")`, type: 'success' },
        { text: '─'.repeat(40), type: 'system' },
      ]
    }

    // ═══ HERRAMIENTAS VISUALES ═══
    case 'crypto':
      return [{ text: '__OPEN_CRYPTO__', type: 'system' }]

    // ═══ CRIPTOGRAFÍA Y CONTRASEÑAS ═══
    case 'passcheck': {
      const pw = args.join(' ')
      if (!pw) return [{ text: '__OPEN_PASSCHECK__', type: 'system' }]
      const { score, label, tips } = checkPasswordStrength(pw)
      const lines: OutputLine[] = [
        { text: `Analizando: ${'*'.repeat(pw.length)}`, type: 'info' },
        { text: `Fortaleza: ${label} (${score}/7)`, type: score >= 5 ? 'success' : score >= 3 ? 'warning' : 'error' },
      ]
      tips.forEach(t => lines.push({ text: `  - ${t}`, type: 'warning' }))
      return lines
    }

    case 'crack-dict': {
      if (args.length < 2) return [{ text: 'uso: crack-dict <usuario> <hash>', type: 'error' }]
      const [target, hash] = args
      return [
        { text: `Cargando diccionario: rockyou.txt (14M contraseñas)`, type: 'info' },
        { text: `Probando contra hash: ${hash}`, type: 'info' },
        { text: '.'.repeat(20), type: 'system' },
        { text: `🔓 Hash crackeado! ${target}:password123`, type: 'success' },
        { text: `Tiempo: 0.8s — el hash SHA1 sin salt es débil ante diccionarios`, type: 'warning' },
      ]
    }

    case 'hash-password': {
      const text = args.join(' ')
      if (!text) return [{ text: 'uso: hash-password <texto>', type: 'error' }]
      const h = simpleHash(text)
      return [
        { text: `MD5:    ${h}${h}`, type: 'normal' },
        { text: `SHA1:   ${h}${h}${h.slice(0, 8)}`, type: 'normal' },
        { text: `SHA256: ${h}${h}${h}${h}`, type: 'normal' },
        { text: '⚠️ Usa siempre salt + bcrypt/argon2, nunca MD5/SHA1 solos para passwords', type: 'warning' },
      ]
    }

    case 'brute-force': {
      const len = parseInt(args[0]) || 4
      const combos = Math.pow(94, len)
      return [
        { text: `Alfabeto: 94 caracteres imprimibles, longitud: ${len}`, type: 'info' },
        { text: `Combinaciones posibles: ${combos.toLocaleString('es-EC')}`, type: 'normal' },
        { text: `Tiempo estimado (GPU moderna, ~10^10 hashes/s): ${(combos / 1e10).toFixed(4)}s`, type: len <= 6 ? 'error' : 'success' },
        { text: len <= 6 ? '⚠️ Contraseña corta — crackeable casi al instante' : '✅ Longitud razonable frente a fuerza bruta', type: len <= 6 ? 'warning' : 'success' },
      ]
    }

    case 'aes-encrypt': {
      if (args.length < 2) return [{ text: 'uso: aes-encrypt <texto> <clave>', type: 'error' }]
      const [text, key] = args
      const h = simpleHash(text + key)
      return [
        { text: `Cifrando "${text}" con clave AES-256...`, type: 'info' },
        { text: `Ciphertext (hex, simulado): ${h}${h}${h}`, type: 'success' },
        { text: 'A diferencia del César, AES es criptográficamente seguro con clave robusta', type: 'normal' },
      ]
    }

    case 'ssl-check': {
      if (!args[0]) return [{ text: 'uso: ssl-check <dominio>', type: 'error' }]
      return [
        { text: `Conectando a ${args[0]}:443...`, type: 'info' },
        { text: 'Certificado: CN=target-corp.com', type: 'normal' },
        { text: "Emisor: Let's Encrypt Authority X3", type: 'normal' },
        { text: 'Válido: 2024-01-10 → 2024-04-10', type: 'normal' },
        { text: 'Protocolo: TLS 1.2 (TLS 1.3 no soportado)', type: 'warning' },
        { text: 'Cipher: ECDHE-RSA-AES128-GCM-SHA256', type: 'normal' },
      ]
    }

    case 'keygen': {
      if (args[0] !== 'rsa') return [{ text: 'uso: keygen rsa <bits>', type: 'error' }]
      const bits = args[1] || '2048'
      return [
        { text: `Generando par de claves RSA de ${bits} bits...`, type: 'info' },
        { text: '-----BEGIN PUBLIC KEY-----', type: 'normal' },
        { text: `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${simpleHash(bits + 'pub')}...`, type: 'success' },
        { text: '-----END PUBLIC KEY-----', type: 'normal' },
        { text: '🔐 Clave privada guardada en ~/.ssh/id_rsa (simulado — nunca la compartas)', type: 'warning' },
      ]
    }

    case 'encrypt': {
      if (args.length < 2) return [{ text: 'uso: encrypt <texto> <shift>', type: 'error' }]
      const text = args[0]
      const shift = parseInt(args[1]) || 3
      return [
        { text: `[César cipher, shift=${shift}]`, type: 'info' },
        { text: `Original:   ${text}`, type: 'normal' },
        { text: `Encriptado: ${caesarCipher(text, shift)}`, type: 'success' },
      ]
    }

    case 'decrypt': {
      if (args.length < 2) return [{ text: 'uso: decrypt <texto> <shift>', type: 'error' }]
      const text = args[0]
      const shift = parseInt(args[1]) || 3
      return [
        { text: `[César cipher, shift=${shift}]`, type: 'info' },
        { text: `Encriptado:    ${text}`, type: 'normal' },
        { text: `Desencriptado: ${caesarCipher(text, shift, true)}`, type: 'success' },
      ]
    }

    case 'hash': {
      const text = args.join(' ')
      if (!text) return [{ text: 'uso: hash <texto>', type: 'error' }]
      const h = simpleHash(text)
      return [
        { text: `MD5 (simulado):    ${h}${h}`, type: 'normal' },
        { text: `SHA256 (simulado): ${h}${h}${h}${h}`, type: 'normal' },
      ]
    }

    // ═══ FORENSE Y RESPUESTA A INCIDENTES ═══
    case 'forensics': {
      const mode = args[0]
      if (mode === 'auth-analysis') {
        return [
          { text: '📊 Analizando /var/log/auth.log...', type: 'info' },
          { text: '', type: 'normal' },
          { text: 'IP atacante:     10.0.0.99', type: 'error' },
          { text: 'Intentos fallidos: 6 (root x4, admin x2)', type: 'warning' },
          { text: 'Ventana de tiempo: 03:11:02 - 03:11:11 (9 segundos)', type: 'warning' },
          { text: 'Resultado:        ✅ ACCESO CONCEDIDO a las 03:12:45 (usuario: admin)', type: 'error' },
          { text: '', type: 'normal' },
          { text: '🚨 Diagnóstico: Ataque de fuerza bruta SSH exitoso', type: 'error' },
          { text: '💡 Recomendación: fail2ban, MFA, deshabilitar login por contraseña', type: 'success' },
        ]
      }
      if (mode === 'timeline') {
        return [
          { text: '🕐 TIMELINE DEL INCIDENTE', type: 'info' },
          { text: '─'.repeat(50), type: 'system' },
          { text: '03:10:01  Intentos de login POST /wp-login.php (403)', type: 'warning' },
          { text: '03:11:02  Inicio de fuerza bruta SSH desde 10.0.0.99', type: 'warning' },
          { text: '03:12:45  Login SSH exitoso — cuenta "admin" comprometida', type: 'error' },
          { text: '03:12:50  POST /admin/login (200) — acceso al panel', type: 'error' },
          { text: '03:13:10  Escalada a root vía su', type: 'error' },
          { text: '─'.repeat(50), type: 'system' },
          { text: '✅ Cadena de ataque reconstruida — 3 minutos de intrusión', type: 'success' },
        ]
      }
      return [{ text: 'uso: forensics <auth-analysis|timeline>', type: 'error' }]
    }

    case 'iptables': {
      if (args.includes('-L')) {
        return [
          { text: 'Chain INPUT (policy ACCEPT)', type: 'info' },
          { text: 'target     prot opt source               destination', type: 'normal' },
          { text: 'DROP       all  --  10.0.0.99            anywhere', type: 'warning' },
        ]
      }
      if (args.includes('-A') && args.includes('-s')) {
        const ip = args[args.indexOf('-s') + 1]
        return [{ text: `Regla agregada: bloquear todo el tráfico desde ${ip}`, type: 'success' }, { text: '✅ Firewall actualizado', type: 'success' }]
      }
      return [{ text: 'uso: iptables -A INPUT -s <ip> -j DROP | iptables -L', type: 'error' }]
    }

    case 'lynis': {
      return [
        { text: '[+] Iniciando auditoría del sistema...', type: 'info' },
        { text: '', type: 'normal' },
        { text: '  - PermitRootLogin habilitado         [ADVERTENCIA]', type: 'warning' },
        { text: '  - MaxAuthTries = 6 (recomendado: 3)   [ADVERTENCIA]', type: 'warning' },
        { text: '  - Firewall activo                     [OK]', type: 'success' },
        { text: '  - Actualizaciones pendientes: 14       [ADVERTENCIA]', type: 'warning' },
        { text: '', type: 'normal' },
        { text: 'Hardening index: 58/100', type: 'warning' },
        { text: '💡 Corrige sshd_config y aplica actualizaciones para mejorar el score', type: 'info' },
      ]
    }

    case 'help':
      return [
        { text: '╔══════════════════════════════════════════════════════════╗', type: 'info' },
        { text: '║        🛡️  Hacking Terminal — ChaskiBots Lab             ║', type: 'info' },
        { text: '╠══════════════════════════════════════════════════════════╣', type: 'info' },
        { text: '║ SISTEMA:     ls, cd, pwd, cat, find, grep, sudo, whoami  ║', type: 'normal' },
        { text: '║ OSINT:       whois, nslookup, dig, dork                 ║', type: 'normal' },
        { text: '║ ESCANEO:     nmap [-sV -sC -sS --script vuln], dirb      ║', type: 'normal' },
        { text: '║ WEB:         curl, sqli, waf-test, xss, csp-check,       ║', type: 'normal' },
        { text: '║              csrf, idor, traversal, cmdinject            ║', type: 'normal' },
        { text: '║ CRYPTO:      encrypt, decrypt, hash, hash-password,      ║', type: 'normal' },
        { text: '║              aes-encrypt, keygen, ssl-check              ║', type: 'normal' },
        { text: '║ PASSWORDS:   passcheck, crack-dict, brute-force          ║', type: 'normal' },
        { text: '║ FORENSE:     forensics auth-analysis, forensics timeline ║', type: 'normal' },
        { text: '║ DEFENSA:     iptables, lynis                             ║', type: 'normal' },
        { text: '║ NUBE:        save, myfiles, open, export, rm             ║', type: 'normal' },
        { text: '║ PYTHON:      python <archivo.py>, run, edit              ║', type: 'normal' },
        { text: '║ HERRAMIENTAS: crypto (visual), passcheck (visual)        ║', type: 'normal' },
        { text: '║ OTROS:       echo, clear, history, man, help, ps, top    ║', type: 'normal' },
        { text: '╚══════════════════════════════════════════════════════════╝', type: 'info' },
        { text: '', type: 'normal' },
        { text: '💡 Tip: "help <comando>" no está disponible — usa man <comando>', type: 'success' },
        { text: '🎯 Reto final: sudo cat /root/flag.txt', type: 'warning' },
      ]

    case '':
      return []

    default:
      return [{ text: `bash: ${cmd}: comando no encontrado. Escribe 'help' para ver comandos disponibles.`, type: 'error' }]
  }
}

// ============================================================
// MISSION ENGINE — CTF interactivo con pasos, XP y estado
// ============================================================
interface MissionStep {
  id: string
  title: string
  description: string
  hint: string
  validator: (cmd: string, history: string[]) => boolean
  xp: number
  successMessage: string
}

interface Mission {
  id: string
  title: string
  briefing: string
  difficulty: 'easy' | 'medium' | 'hard'
  xpTotal: number
  steps: MissionStep[]
  completionFlag: string
  debriefing: string
}

const MISSIONS: Mission[] = [
  {
    id: 'recon-target',
    title: '🔍 Misión 1: Reconocimiento de Target Corp',
    briefing: 'Tu cliente te contrató para un pentest. Antes de atacar, necesitas INFORMACIÓN. Recopila datos sobre target-corp.com sin tocar su servidor directamente.',
    difficulty: 'easy',
    xpTotal: 150,
    steps: [
      {
        id: 'step-whois',
        title: 'Paso 1: ¿Quién es el dueño?',
        description: 'Usa whois para descubrir quién registró el dominio target-corp.com',
        hint: 'Comando: whois target-corp.com',
        validator: (cmd) => cmd.toLowerCase().includes('whois') && cmd.toLowerCase().includes('target'),
        xp: 30,
        successMessage: '✅ ¡Bien! Descubriste que el dominio pertenece a "Target Corp S.A." y el email admin@target-corp.com',
      },
      {
        id: 'step-dns',
        title: 'Paso 2: Resuelve la IP',
        description: 'Usa nslookup o dig para encontrar la dirección IP del servidor',
        hint: 'Comando: nslookup target-corp.com o dig target-corp.com',
        validator: (cmd) => (cmd.includes('nslookup') || cmd.includes('dig')) && cmd.includes('target'),
        xp: 30,
        successMessage: '✅ IP encontrada: 10.0.0.10 — Ahora sabes dónde está el servidor',
      },
      {
        id: 'step-robots',
        title: 'Paso 3: ¿Qué esconden?',
        description: 'Busca el archivo robots.txt para ver qué rutas quieren ocultar',
        hint: 'Comando: curl https://target-corp.com/robots.txt',
        validator: (cmd) => cmd.includes('curl') && cmd.includes('robots'),
        xp: 40,
        successMessage: '✅ ¡Encontraste rutas ocultas! /admin, /backup, /.git y /admin-panel-x7 — información valiosa',
      },
      {
        id: 'step-dork',
        title: 'Paso 4: Google Dorking',
        description: 'Usa técnicas de Google Dork para buscar archivos sensibles expuestos',
        hint: 'Comando: dork site:target-corp.com filetype:txt password',
        validator: (cmd) => cmd.includes('dork'),
        xp: 50,
        successMessage: '🏴 ¡EXCELENTE! Encontraste un archivo de backup con credenciales expuestas. Fase de reconocimiento completa.',
      },
    ],
    completionFlag: 'FLAG{r3c0n_m4st3r_2024}',
    debriefing: '📋 REPORTE: Reconocimiento exitoso.\n• Dueño: Target Corp S.A.\n• IP: 10.0.0.10\n• Rutas ocultas: /admin, /.git, /backup\n• Archivos expuestos: backup_passwords.txt\n• Riesgo: ALTO — datos sensibles en la web pública',
  },
  {
    id: 'scan-exploit',
    title: '⚡ Misión 2: Escaneo y Explotación Web',
    briefing: 'Ya tienes la IP del objetivo (10.0.0.10). Es hora de escanear puertos, descubrir servicios y explotar la primera vulnerabilidad web.',
    difficulty: 'medium',
    xpTotal: 250,
    steps: [
      {
        id: 'step-nmap',
        title: 'Paso 1: Escaneo de puertos',
        description: 'Usa nmap con detección de versiones (-sV) para ver qué servicios corren en 10.0.0.10',
        hint: 'Comando: nmap -sV 10.0.0.10',
        validator: (cmd) => cmd.includes('nmap') && (cmd.includes('10.0.0') || cmd.includes('target')),
        xp: 40,
        successMessage: '✅ Puertos descubiertos: SSH(22), HTTP(80), HTTPS(443), MySQL(3306). Apache 2.4.29 — versión con CVEs conocidos.',
      },
      {
        id: 'step-dirb',
        title: 'Paso 2: Enumerar directorios',
        description: 'Busca directorios ocultos en el servidor web con dirb o gobuster',
        hint: 'Comando: dirb https://target-corp.com',
        validator: (cmd) => cmd.includes('dirb') || cmd.includes('gobuster'),
        xp: 50,
        successMessage: '✅ ¡Directorio .git expuesto! Esto significa que puedes ver el código fuente del sitio.',
      },
      {
        id: 'step-sqli',
        title: 'Paso 3: SQL Injection al login',
        description: "El panel /admin tiene un formulario de login. Intenta bypassearlo con SQL Injection. Payload clásico: ' OR 1=1 --",
        hint: "Comando: sqli login admin' OR 1=1 --",
        validator: (cmd) => cmd.includes('sqli') && cmd.includes('login') && (cmd.includes('1=1') || cmd.includes('OR')),
        xp: 80,
        successMessage: '🔓 ¡ACCESO AL PANEL DE ADMIN! La consulta SQL fue manipulada. Ahora tienes acceso como administrador.',
      },
      {
        id: 'step-extract',
        title: 'Paso 4: Extrae credenciales',
        description: 'Ahora que sabes que hay SQLi, usa UNION para extraer usuarios y contraseñas de la base de datos',
        hint: "Comando: sqli union ' UNION SELECT username,password FROM users --",
        validator: (cmd) => cmd.includes('sqli') && cmd.includes('union'),
        xp: 80,
        successMessage: '🏴 ¡DATOS EXTRAÍDOS! Obtuviste los hashes de todos los usuarios. El hash de admin es crackeable.',
      },
    ],
    completionFlag: 'FLAG{sql1_m4st3r_un10n_2024}',
    debriefing: '📋 REPORTE: Explotación web exitosa.\n• Vulnerabilidad: SQL Injection en /admin/login\n• Impacto: CRÍTICO — bypass de autenticación + extracción de BD completa\n• Datos obtenidos: usernames + password hashes\n• Remediación: Usar prepared statements, WAF, input validation',
  },
  {
    id: 'forensics-incident',
    title: '🔬 Misión 3: Investigación Forense',
    briefing: 'ALERTA: El servidor fue comprometido anoche. Tu trabajo es investigar los logs, identificar al atacante y reconstruir la cadena de ataque.',
    difficulty: 'medium',
    xpTotal: 200,
    steps: [
      {
        id: 'step-auth-log',
        title: 'Paso 1: Revisa intentos de login',
        description: 'Busca intentos fallidos en /var/log/auth.log para identificar ataques de fuerza bruta',
        hint: 'Comando: grep Failed /var/log/auth.log o cat /var/log/auth.log',
        validator: (cmd) => (cmd.includes('grep') && cmd.includes('auth')) || (cmd.includes('cat') && cmd.includes('auth')),
        xp: 40,
        successMessage: '✅ ¡Encontraste el ataque! IP 10.0.0.99 hizo 6 intentos de fuerza bruta entre las 03:11 y 03:12.',
      },
      {
        id: 'step-access-log',
        title: 'Paso 2: Verifica acceso web',
        description: 'Revisa /var/log/access.log para ver si el atacante también intentó entrar por la web',
        hint: 'Comando: cat /var/log/access.log',
        validator: (cmd) => cmd.includes('access.log'),
        xp: 40,
        successMessage: '✅ Confirmado: La misma IP (10.0.0.99) atacó /wp-login.php y /admin/login. Logró entrar por /admin.',
      },
      {
        id: 'step-timeline',
        title: 'Paso 3: Reconstruye la timeline',
        description: 'Usa la herramienta forense para crear una línea temporal del ataque',
        hint: 'Comando: forensics timeline',
        validator: (cmd) => cmd.includes('forensics') && cmd.includes('timeline'),
        xp: 60,
        successMessage: '✅ Timeline reconstruida: Brute force → Login exitoso → Acceso admin → Escalada a root. Total: 3 minutos.',
      },
      {
        id: 'step-block',
        title: 'Paso 4: Bloquea al atacante',
        description: '¡Rápido! Bloquea la IP del atacante con iptables antes de que vuelva',
        hint: 'Comando: iptables -A INPUT -s 10.0.0.99 -j DROP',
        validator: (cmd) => cmd.includes('iptables') && cmd.includes('10.0.0.99') && cmd.includes('DROP'),
        xp: 60,
        successMessage: '🏴 ¡ATACANTE BLOQUEADO! IP 10.0.0.99 ya no puede acceder al servidor. Incidente contenido.',
      },
    ],
    completionFlag: 'FLAG{f0r3ns1cs_d3t3ct1v3_2024}',
    debriefing: '📋 REPORTE: Incidente investigado y contenido.\n• Atacante: 10.0.0.99\n• Método: Fuerza bruta SSH + web login\n• Tiempo del ataque: 03:10-03:13 AM\n• Acceso obtenido: root (vía escalada desde admin)\n• Acción tomada: IP bloqueada con iptables\n• Recomendación: Instalar fail2ban, deshabilitar root login SSH',
  },
  {
    id: 'hardening-defense',
    title: '🛡️ Misión 4: Fortificar el Servidor',
    briefing: 'Después del incidente, necesitas endurecer (hardening) el servidor para que no vuelva a pasar. Audita la seguridad y corrige las fallas.',
    difficulty: 'hard',
    xpTotal: 200,
    steps: [
      {
        id: 'step-audit',
        title: 'Paso 1: Auditoría de seguridad',
        description: 'Ejecuta Lynis para obtener un informe completo de vulnerabilidades del sistema',
        hint: 'Comando: lynis audit',
        validator: (cmd) => cmd.includes('lynis'),
        xp: 40,
        successMessage: '✅ Auditoría completada: Score 58/100. Hay 4 vulnerabilidades críticas por corregir.',
      },
      {
        id: 'step-ssh-config',
        title: 'Paso 2: Verifica la config SSH',
        description: 'El SSH está mal configurado. Lee /etc/ssh/sshd_config y encuentra los problemas',
        hint: 'Comando: cat /etc/ssh/sshd_config',
        validator: (cmd) => cmd.includes('sshd_config'),
        xp: 50,
        successMessage: '✅ Problemas encontrados: PermitRootLogin=yes (peligroso), MaxAuthTries=6 (muy alto). Necesitan corrección.',
      },
      {
        id: 'step-netstat',
        title: 'Paso 3: Conexiones activas',
        description: 'Verifica si hay conexiones sospechosas activas con netstat o ss',
        hint: 'Comando: netstat',
        validator: (cmd) => cmd.includes('netstat') || cmd.includes('ss'),
        xp: 50,
        successMessage: '✅ Conexión sospechosa detectada: 10.0.0.99 aún tiene una sesión ESTABLISHED en puerto 22. ¡Bloquéala!',
      },
      {
        id: 'step-firewall',
        title: 'Paso 4: Configura el firewall',
        description: 'Revisa las reglas del firewall actual y asegúrate de que esté protegido',
        hint: 'Comando: iptables -L',
        validator: (cmd) => cmd.includes('iptables') && cmd.includes('-L'),
        xp: 60,
        successMessage: '🏴 ¡Servidor auditado y fortificado! Score mejorado. El sistema está más seguro ahora.',
      },
    ],
    completionFlag: 'FLAG{h4rd3n1ng_pr0_2024}',
    debriefing: '📋 REPORTE: Hardening aplicado.\n• Score antes: 58/100 → Score después: 82/100\n• Correcciones: SSH endurecido, firewall configurado, servicios innecesarios deshabilitados\n• Monitoreo: Fail2ban instalado, logs centralizados\n• Estado: Sistema PROTEGIDO',
  },
  {
    id: 'full-pentest',
    title: '🏴 Misión FINAL: Pentest Completo — Captura la Flag',
    briefing: 'Esta es la prueba final. Debes realizar un pentest completo: reconocimiento → escaneo → explotación → escalada de privilegios → captura de flag. El objetivo está en /root/flag.txt.',
    difficulty: 'hard',
    xpTotal: 500,
    steps: [
      {
        id: 'step-final-recon',
        title: 'Paso 1: Reconocimiento inicial',
        description: 'Empieza obteniendo información del objetivo con whois y DNS',
        hint: 'Comando: whois target-corp.com',
        validator: (cmd) => cmd.includes('whois') || (cmd.includes('dig') && cmd.includes('target')),
        xp: 50,
        successMessage: '✅ Reconocimiento básico completo. Objetivo identificado.',
      },
      {
        id: 'step-final-scan',
        title: 'Paso 2: Escaneo profundo',
        description: 'Escanea todos los puertos con detección de versiones y vulnerabilidades',
        hint: 'Comando: nmap -sV 10.0.0.10',
        validator: (cmd) => cmd.includes('nmap') && cmd.includes('-sV'),
        xp: 60,
        successMessage: '✅ Servicios descubiertos. Apache 2.4.29 desactualizado + MySQL 5.7.33 expuesto.',
      },
      {
        id: 'step-final-enum',
        title: 'Paso 3: Enumeración web',
        description: 'Busca directorios y archivos de configuración expuestos',
        hint: 'Comando: dirb https://target-corp.com',
        validator: (cmd) => cmd.includes('dirb') || (cmd.includes('curl') && cmd.includes('robots')),
        xp: 60,
        successMessage: '✅ Encontraste /admin y /.git expuestos. Vector de ataque identificado.',
      },
      {
        id: 'step-final-exploit',
        title: 'Paso 4: Explota la vulnerabilidad',
        description: 'El login del panel admin es vulnerable a SQL Injection. Gana acceso.',
        hint: "Comando: sqli login admin' OR 1=1 --",
        validator: (cmd) => cmd.includes('sqli') && cmd.includes('login'),
        xp: 100,
        successMessage: '✅ ¡Acceso al panel admin obtenido! Ahora necesitas escalar a root.',
      },
      {
        id: 'step-final-config',
        title: 'Paso 5: Busca credenciales internas',
        description: 'Los desarrolladores a veces dejan credenciales en archivos de configuración. Busca en /opt/',
        hint: 'Comando: cat /opt/targetcorp/config.yml',
        validator: (cmd) => cmd.includes('config.yml') || (cmd.includes('cat') && cmd.includes('/opt')),
        xp: 80,
        successMessage: '✅ ¡Credenciales de BD encontradas! user:admin password:T@rg3tDB2024! — Posible reutilización de contraseñas.',
      },
      {
        id: 'step-final-flag',
        title: 'Paso 6: CAPTURA LA FLAG',
        description: 'Con las credenciales de admin y acceso al sistema, escala a root y lee /root/flag.txt',
        hint: 'Comando: sudo cat /root/flag.txt',
        validator: (cmd) => cmd.includes('sudo') && cmd.includes('flag'),
        xp: 150,
        successMessage: '🏴🏴🏴 ¡FLAG CAPTURADA! FLAG{p3n7357_c0mpl3t0_ch4sk1b0ts_2024} — ¡ERES UN PENTESTER!',
      },
    ],
    completionFlag: 'FLAG{p3n7357_c0mpl3t0_ch4sk1b0ts_2024}',
    debriefing: '📋 REPORTE FINAL DE PENTEST:\n═══════════════════════════\n• Cliente: Target Corporation S.A.\n• Alcance: target-corp.com + red interna 10.0.0.0/24\n\n• HALLAZGOS CRÍTICOS:\n  1. [CRÍTICO] SQL Injection en /admin/login\n  2. [ALTO] Código fuente expuesto (/.git)\n  3. [ALTO] Credenciales en config.yml sin cifrar\n  4. [MEDIO] Apache 2.4.29 desactualizado\n  5. [BAJO] robots.txt revela rutas internas\n\n• IMPACTO: Acceso root completo al servidor\n• REMEDIACIÓN: Prepared statements, hardening SSH, cifrar configs, actualizar software\n\n¡FELICIDADES! Has completado todas las misiones. 🎓',
  },
]

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
    { text: "Escribe 'help' para ver comandos. 'missions' para ver misiones CTF.", type: 'info' },
    { text: '', type: 'normal' },
    { text: '🏴 MISIONES CTF: Escenarios reales paso a paso con XP', type: 'warning' },
    { text: '   mission start 1  → Inicia la primera misión de reconocimiento', type: 'normal' },
    { text: '   mission status   → Ver tu progreso actual', type: 'normal' },
    { text: '', type: 'normal' },
    { text: '🎯 Reto libre: escala privilegios y captura /root/flag.txt', type: 'info' },
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

  // Cloud file manager
  const [userFiles, setUserFiles] = useState<any[]>([])

  // Crypto tool panel
  const [showCrypto, setShowCrypto] = useState(false)
  const [cryptoMode, setCryptoMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [encryptText, setEncryptText] = useState('')
  const [encryptShift, setEncryptShift] = useState(3)
  const [encryptedResult, setEncryptedResult] = useState('')

  // Password checker panel
  const [showPasswordChecker, setShowPasswordChecker] = useState(false)
  const [passwordToCheck, setPasswordToCheck] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: string; tips: string[] } | null>(null)

  // ═══ MISSION ENGINE STATE ═══
  const [activeMission, setActiveMission] = useState<Mission | null>(null)
  const [missionStep, setMissionStep] = useState(0)
  const [totalXP, setTotalXP] = useState(0)
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set())
  const [showMissions, setShowMissions] = useState(true)
  const [missionLog, setMissionLog] = useState<string[]>([])

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/academy?course=hacking')
      .then(r => r.json())
      .then(data => setModules(data.modules || []))
      .catch(() => {})
      .finally(() => setCurriculumLoading(false))
  }, [])

  // Cloud files (Supabase-backed virtual filesystem)
  const loadUserFiles = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/virtual-files?userId=${userId}`)
      if (res.ok) setUserFiles(await res.json())
    } catch {}
  }

  const saveFileToDb = async (name: string, content: string, path: string) => {
    if (!userId) return { success: false, error: 'Debes iniciar sesión para guardar archivos' }
    try {
      const res = await fetch('/api/virtual-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, userName: userName || 'Hacker', path, name, type: 'file', content,
          mimeType: name.endsWith('.py') ? 'text/x-python' : 'text/plain',
        }),
      })
      if (res.ok) { await loadUserFiles(); return { success: true } }
      return { success: false, error: 'Error al guardar' }
    } catch {
      return { success: false, error: 'Error de conexión' }
    }
  }

  const exportFile = (name: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = name
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => { if (userId) loadUserFiles() }, [userId])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hacking-terminal-progress')
      if (saved) setCompletedLessons(new Set(JSON.parse(saved)))
      const savedName = localStorage.getItem('hacking-terminal-student')
      if (savedName) setStudentName(savedName)
      else if (user?.name) setStudentName(user.name)
      // Load mission progress
      const savedXP = localStorage.getItem('hacking-xp')
      if (savedXP) setTotalXP(parseInt(savedXP))
      const savedMissions = localStorage.getItem('hacking-missions-done')
      if (savedMissions) setCompletedMissions(new Set(JSON.parse(savedMissions)))
    } catch {}
  }, [user?.name])

  useEffect(() => {
    try {
      localStorage.setItem('hacking-terminal-progress', JSON.stringify(Array.from(completedLessons)))
      if (studentName) localStorage.setItem('hacking-terminal-student', studentName)
      localStorage.setItem('hacking-xp', String(totalXP))
      localStorage.setItem('hacking-missions-done', JSON.stringify(Array.from(completedMissions)))
    } catch {}
  }, [completedLessons, studentName, totalXP, completedMissions])

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [output])

  const focusInput = () => inputRef.current?.focus()

  const executeCommand = (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return

    setCommandHistory(prev => [...prev, trimmed])
    setHistoryIndex(-1)
    setInputValue('')

    const promptLine: OutputLine = { text: `hacker@chaskibots-lab:${cwd}$ ${trimmed}`, type: 'input' }
    const parts = trimmed.split(/\s+/)
    const cmdName = parts[0]?.toLowerCase()

    // save: requiere fetch async, se intercepta antes del procesador puro
    if (cmdName === 'save') {
      const fileName = parts[1]
      const content = parts.slice(2).join(' ')
      if (!fileName || !content) {
        setOutput(prev => [...prev, promptLine, { text: 'Uso: save <nombre_archivo> <contenido>', type: 'error' }])
      } else if (!userId) {
        setOutput(prev => [...prev, promptLine, { text: '⚠️ Debes iniciar sesión para guardar archivos', type: 'error' }])
      } else {
        setOutput(prev => [...prev, promptLine, { text: `💾 Guardando "${fileName}"...`, type: 'info' }])
        saveFileToDb(fileName, content, cwd).then(result => {
          setOutput(prev => [...prev, { text: result.success ? `✅ Archivo "${fileName}" guardado en la nube` : `❌ ${result.error}`, type: result.success ? 'success' : 'error' }])
        })
      }
      return
    }

    // export: necesita Blob/document, se intercepta siempre
    if (cmdName === 'export') {
      const fileName = parts[1]
      const cloudFile = userFiles.find((f: any) => f.name === fileName)
      if (cloudFile) {
        exportFile(cloudFile.name, cloudFile.content)
        setOutput(prev => [...prev, promptLine, { text: `📥 Descargando "${cloudFile.name}"...`, type: 'success' }])
      } else {
        const localPath = fileName?.startsWith('/') ? fileName : `${cwd === '/' ? '' : cwd}/${fileName}`
        const node = fileName ? FILE_SYSTEM[localPath] : null
        if (node && node.type === 'file') {
          exportFile(fileName, node.content)
          setOutput(prev => [...prev, promptLine, { text: `📥 Descargando "${fileName}"...`, type: 'success' }])
        } else {
          setOutput(prev => [...prev, promptLine, { text: fileName ? `Archivo no encontrado: ${fileName}` : 'Uso: export <archivo>', type: 'error' }])
        }
      }
      return
    }

    // rm: si es un archivo en la nube, requiere DELETE async; si no, cae al procesador puro
    if (cmdName === 'rm' && userFiles.find((f: any) => f.name === parts[1])) {
      const cloudFile = userFiles.find((f: any) => f.name === parts[1])
      setOutput(prev => [...prev, promptLine, { text: `Eliminando "${cloudFile.name}"...`, type: 'info' }])
      fetch(`/api/virtual-files?recordId=${cloudFile.recordId}`, { method: 'DELETE' }).then(() => {
        loadUserFiles()
        setOutput(prev => [...prev, { text: `🗑️ Archivo "${cloudFile.name}" eliminado`, type: 'success' }])
      })
      return
    }

    // ── Mission command shortcuts ──
    if (cmdName === 'missions' || cmdName === 'mission') {
      const sub = parts[1]
      if (sub === 'list' || !sub) {
        setOutput(prev => [...prev, promptLine,
          { text: '', type: 'normal' },
          { text: '╔══════════════════════════════════════════════════════════╗', type: 'info' },
          { text: '║        🏴  MISIONES CTF DISPONIBLES                      ║', type: 'info' },
          { text: '╠══════════════════════════════════════════════════════════╣', type: 'info' },
          ...MISSIONS.map((m, i) => ({
            text: `║ ${completedMissions.has(m.id) ? '✅' : '  '} ${i + 1}. ${m.title.padEnd(45)}║`,
            type: (completedMissions.has(m.id) ? 'success' : 'normal') as OutputLine['type'],
          })),
          { text: '╚══════════════════════════════════════════════════════════╝', type: 'info' },
          { text: '', type: 'normal' },
          { text: `Tu XP: ${totalXP} | Misiones completadas: ${completedMissions.size}/${MISSIONS.length}`, type: 'warning' },
          { text: 'Usa: mission start <número> para iniciar una misión', type: 'info' },
        ])
        return
      }
      if (sub === 'start' && parts[2]) {
        const idx = parseInt(parts[2]) - 1
        if (idx >= 0 && idx < MISSIONS.length) {
          const m = MISSIONS[idx]
          setActiveMission(m)
          setMissionStep(0)
          setMissionLog([])
          setOutput(prev => [...prev, promptLine,
            { text: '', type: 'normal' },
            { text: '═'.repeat(56), type: 'warning' },
            { text: `  ${m.title}`, type: 'info' },
            { text: `  Dificultad: ${DIFFICULTY_LABEL[m.difficulty]} | XP: ${m.xpTotal}`, type: 'normal' },
            { text: '═'.repeat(56), type: 'warning' },
            { text: '', type: 'normal' },
            { text: `📋 BRIEFING: ${m.briefing}`, type: 'normal' },
            { text: '', type: 'normal' },
            { text: `▶ ${m.steps[0].title}`, type: 'info' },
            { text: `  ${m.steps[0].description}`, type: 'normal' },
            { text: `  💡 Pista: ${m.steps[0].hint}`, type: 'warning' },
            { text: '', type: 'normal' },
          ])
          return
        }
        setOutput(prev => [...prev, promptLine, { text: '❌ Número de misión inválido', type: 'error' }])
        return
      }
      if (sub === 'status') {
        if (!activeMission) {
          setOutput(prev => [...prev, promptLine, { text: '⚠️ No hay misión activa. Usa: mission start <número>', type: 'warning' }])
          return
        }
        const step = activeMission.steps[missionStep]
        setOutput(prev => [...prev, promptLine,
          { text: `🎯 Misión: ${activeMission.title}`, type: 'info' },
          { text: `   Progreso: ${missionStep}/${activeMission.steps.length} pasos`, type: 'normal' },
          { text: `   Paso actual: ${step?.title || 'Completada'}`, type: 'warning' },
          { text: `   ${step?.description || ''}`, type: 'normal' },
          { text: `   💡 ${step?.hint || ''}`, type: 'info' },
        ])
        return
      }
      if (sub === 'abort') {
        setActiveMission(null)
        setMissionStep(0)
        setOutput(prev => [...prev, promptLine, { text: '⛔ Misión abortada.', type: 'warning' }])
        return
      }
      if (sub === 'report' && activeMission && completedMissions.has(activeMission.id)) {
        setOutput(prev => [...prev, promptLine, { text: '', type: 'normal' }, ...activeMission.debriefing.split('\n').map(l => ({ text: l, type: 'info' as const }))])
        return
      }
      setOutput(prev => [...prev, promptLine, { text: 'Uso: mission list | mission start <n> | mission status | mission abort | mission report', type: 'error' }])
      return
    }

    const result = processCommand(trimmed, cwd, setCwd, [...commandHistory, trimmed], false, userFiles)

    if (result.length === 1 && result[0].text === '__CLEAR__') {
      setOutput([])
    } else if (result.length === 1 && result[0].text === '__OPEN_CRYPTO__') {
      setShowCrypto(true)
      setOutput(prev => [...prev, promptLine, { text: '🔐 Abriendo herramienta de cifrado visual...', type: 'info' }])
    } else if (result.length === 1 && result[0].text === '__OPEN_PASSCHECK__') {
      setShowPasswordChecker(true)
      setOutput(prev => [...prev, promptLine, { text: '🔑 Abriendo verificador de contraseñas...', type: 'info' }])
    } else {
      setOutput(prev => [...prev, promptLine, ...result])
    }

    // ═══ MISSION VALIDATION ═══
    if (activeMission && missionStep < activeMission.steps.length) {
      const currentStep = activeMission.steps[missionStep]
      if (currentStep.validator(trimmed, commandHistory)) {
        const newXP = totalXP + currentStep.xp
        setTotalXP(newXP)
        setMissionLog(prev => [...prev, trimmed])

        const nextStep = missionStep + 1
        const isComplete = nextStep >= activeMission.steps.length

        if (isComplete) {
          // Mission complete!
          const newCompleted = new Set(completedMissions)
          newCompleted.add(activeMission.id)
          setCompletedMissions(newCompleted)
          setOutput(prev => [...prev,
            { text: '', type: 'normal' },
            { text: '═'.repeat(56), type: 'success' },
            { text: currentStep.successMessage, type: 'success' },
            { text: '', type: 'normal' },
            { text: `🏴 ¡MISIÓN COMPLETADA! +${currentStep.xp} XP`, type: 'success' },
            { text: `   Flag: ${activeMission.completionFlag}`, type: 'warning' },
            { text: `   XP total: ${newXP}`, type: 'info' },
            { text: '═'.repeat(56), type: 'success' },
            { text: '', type: 'normal' },
            ...activeMission.debriefing.split('\n').map(l => ({ text: l, type: 'info' as const })),
            { text: '', type: 'normal' },
            { text: 'Usa "mission list" para ver la siguiente misión disponible', type: 'info' },
          ])
          setActiveMission(null)
          setMissionStep(0)
        } else {
          // Advance to next step
          setMissionStep(nextStep)
          const next = activeMission.steps[nextStep]
          setOutput(prev => [...prev,
            { text: '', type: 'normal' },
            { text: `${currentStep.successMessage}  (+${currentStep.xp} XP)`, type: 'success' },
            { text: '', type: 'normal' },
            { text: `▶ ${next.title}`, type: 'info' },
            { text: `  ${next.description}`, type: 'normal' },
            { text: `  💡 Pista: ${next.hint}`, type: 'warning' },
            { text: '', type: 'normal' },
          ])
        }
      }
    }
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
          {totalXP > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              ⚡ {totalXP} XP
            </span>
          )}
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
          <button onClick={() => setShowCrypto(!showCrypto)} className={`p-2 rounded-lg transition-colors ${showCrypto ? 'bg-violet-500/20 text-violet-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title="Cifrado César">
            <Lock className="w-4 h-4" />
          </button>
          <button onClick={() => setShowPasswordChecker(!showPasswordChecker)} className={`p-2 rounded-lg transition-colors ${showPasswordChecker ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title="Verificador de Contraseñas">
            <Key className="w-4 h-4" />
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

            {/* ─── MISIONES CTF ─── */}
            <div className="p-3 border-t border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3 h-3 text-orange-400" /> Misiones CTF
                </h4>
                <span className="text-[10px] text-orange-400 font-bold">{totalXP} XP</span>
              </div>

              {/* Active mission indicator */}
              {activeMission && (
                <div className="mb-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <div className="text-[10px] text-orange-300 font-medium truncate">{activeMission.title}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${(missionStep / activeMission.steps.length) * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-gray-400">{missionStep}/{activeMission.steps.length}</span>
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1">{activeMission.steps[missionStep]?.title}</div>
                </div>
              )}

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {MISSIONS.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => executeCommand(`mission start ${i + 1}`)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-[10px] flex items-center gap-1.5 transition-all ${
                      completedMissions.has(m.id) ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      activeMission?.id === m.id ? 'bg-orange-500/10 text-orange-300 border border-orange-500/30' :
                      'bg-gray-700/30 text-gray-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent'
                    }`}
                  >
                    {completedMissions.has(m.id) ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    <span className="flex-1 truncate">{m.title.replace(/[🔍⚡🔬🛡️🏴]\s*/, '')}</span>
                    <span className={`text-[8px] px-1 py-0.5 rounded ${DIFFICULTY_COLOR[m.difficulty]}`}>{m.xpTotal}xp</span>
                  </button>
                ))}
              </div>

              {/* Quick commands */}
              <div className="mt-2 pt-2 border-t border-gray-700/30">
                <div className="flex flex-wrap gap-1">
                  {['help', 'missions', 'mission status'].map(cmdStr => (
                    <button key={cmdStr} onClick={() => executeCommand(cmdStr)} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      $ {cmdStr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── CENTER: TERMINAL ─── */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Floating tool: Crypto (Caesar cipher) */}
          {showCrypto && (
            <div className="absolute top-3 right-3 z-20 w-72 bg-[#161b22] rounded-xl p-4 border border-violet-500/30 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-violet-400" />
                  <span className="font-medium text-gray-200 text-sm">Cifrado César</span>
                </div>
                <button onClick={() => setShowCrypto(false)} className="text-gray-500 hover:text-gray-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button onClick={() => setCryptoMode('encrypt')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${cryptoMode === 'encrypt' ? 'bg-violet-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:text-gray-200'}`}>Encriptar</button>
                  <button onClick={() => setCryptoMode('decrypt')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${cryptoMode === 'decrypt' ? 'bg-violet-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:text-gray-200'}`}>Desencriptar</button>
                </div>
                <input
                  type="text"
                  value={encryptText}
                  onChange={(e) => setEncryptText(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="w-full px-3 py-1.5 bg-[#0d1117] border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-600 text-xs focus:border-violet-500/50 focus:outline-none"
                />
                <div className="flex items-center gap-3">
                  <label className="text-[11px] text-gray-400">Shift:</label>
                  <input type="range" min="1" max="25" value={encryptShift} onChange={(e) => setEncryptShift(parseInt(e.target.value))} className="flex-1 accent-violet-500" />
                  <span className="text-gray-200 font-mono text-xs w-6">{encryptShift}</span>
                </div>
                <button
                  onClick={() => setEncryptedResult(caesarCipher(encryptText, encryptShift, cryptoMode === 'decrypt'))}
                  className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors text-xs font-bold"
                >
                  {cryptoMode === 'encrypt' ? '🔒 Encriptar' : '🔓 Desencriptar'}
                </button>
                {encryptedResult && (
                  <div className="p-2.5 bg-[#0d1117] rounded-lg">
                    <div className="text-[10px] text-gray-500 mb-1">Resultado:</div>
                    <div className="text-green-400 font-mono text-xs break-all">{encryptedResult}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating tool: Password strength checker */}
          {showPasswordChecker && (
            <div className="absolute top-3 right-3 z-20 w-72 bg-[#161b22] rounded-xl p-4 border border-amber-500/30 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="font-medium text-gray-200 text-sm">Verificador de Contraseñas</span>
                </div>
                <button onClick={() => setShowPasswordChecker(false)} className="text-gray-500 hover:text-gray-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordToCheck}
                    onChange={(e) => {
                      setPasswordToCheck(e.target.value)
                      setPasswordStrength(e.target.value ? checkPasswordStrength(e.target.value) : null)
                    }}
                    placeholder="Escribe una contraseña..."
                    className="w-full px-3 py-1.5 pr-9 bg-[#0d1117] border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-600 text-xs focus:border-amber-500/50 focus:outline-none"
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {passwordStrength && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${passwordStrength.score <= 2 ? 'bg-red-500' : passwordStrength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${(passwordStrength.score / 7) * 100}%` }} />
                      </div>
                      <span className={`text-xs font-medium ${passwordStrength.score <= 2 ? 'text-red-400' : passwordStrength.score <= 4 ? 'text-yellow-400' : 'text-green-400'}`}>{passwordStrength.label}</span>
                    </div>
                    {passwordStrength.tips.length > 0 && (
                      <div>
                        <div className="text-gray-500 mb-1 text-[10px]">Sugerencias:</div>
                        {passwordStrength.tips.map((tip, i) => <div key={i} className="text-amber-400 text-[10px]">• {tip}</div>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

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
