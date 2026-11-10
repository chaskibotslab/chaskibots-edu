// Motor de Python del laboratorio (Raspberry Pi). Lo ejecuta Pyodide en el
// worker (python.worker.ts) y, en los tests, el CPython de la máquina.
//
// Idea: el programa del alumno es Python normal con gpiozero y sleep(). Antes
// de correrlo, se reescribe con el módulo ast: cada sleep(s) pasa a ser
// «await _espera(s)» y cada función que (directa o indirectamente) duerme pasa
// a ser async. Se compila con await permitido en el nivel superior y queda una
// corrutina que el simulador avanza a mano en cada paso: la corre hasta el
// próximo sleep, que le dice cuándo despertar en tiempo SIMULADO. Así el
// programa y la física van sincronizados como con el Arduino emulado, aunque
// el navegador vaya lento.
//
// Desde afuera solo se usan dos funciones:
//   _cargar(codigo, placa)                 → None o el mensaje de error de sintaxis
//   _avanzar(dt, digital, dobles, us, cam, perro) → { pines, salida, error, terminado, marcha }
// `placa`: 'rpi' (pines GPIO17…) o 'jetson' (pines PIN32…, por su número físico).
// `digital`: {GPIO17: True}, `dobles`: {GPIO2: [sin_pullup, con_pullup]},
// `us`: [{trig, echo, cm}] (cm None = sin eco), `cam`: {ancho, alto, px} o None,
// `perro`: lo que cuenta el perro robot (ver EstadoPerro en cuadrupedo.ts) o None.
// `marcha`: la última orden al perro {vx, vy, giro, postura} o None.
//
// Bibliotecas: gpiozero (Raspberry), RPi.GPIO / Jetson.GPIO (la misma API,
// con GPIO.BOARD o GPIO.BCM), «camara» (la cámara CSI del simulador) y
// «perro» (el perro robot cuadrúpedo).

export const RUNTIME_PY = String.raw`
import ast, sys, types, math

_PRESUPUESTO = 200000   # líneas de Python por paso antes de declarar un bucle sin sleep()

class _Espera:
    def __init__(self, s):
        self.s = max(0.0, float(s))
    def __await__(self):
        yield self.s

def _espera(s=0.0):
    return _Espera(s)

_estado = {'t': 0.0, 'despertar': 0.0, 'coro': None, 'vivo': False, 'salida': [], 'lineas': 0, 'placa': 'rpi'}
_pines = {}        # 'GPIO17' (o 'PIN11' en la Jetson) -> objeto que lo maneja
_entradas = {'digital': {}, 'dobles': {}, 'us': [], 'cam': None, 'perro': None}

# Conector de 40 pines (igual en la Raspberry y la Jetson): número físico -> GPIO BCM.
_BOARD_A_BCM = {3: 2, 5: 3, 7: 4, 8: 14, 10: 15, 11: 17, 12: 18, 13: 27, 15: 22, 16: 23, 18: 24, 19: 10, 21: 9, 22: 25,
                23: 11, 24: 8, 26: 7, 27: 0, 28: 1, 29: 5, 31: 6, 32: 12, 33: 13, 35: 19, 36: 16, 37: 26, 38: 20, 40: 21}
_BCM_A_BOARD = {v: k for k, v in _BOARD_A_BCM.items()}

def _nombre_pin(p):
    """Nombre del pin en el simulador. gpiozero usa la numeración BCM."""
    if isinstance(p, int):
        n = p
    else:
        s = str(p).upper()
        if s.startswith('GPIO') and s[4:].isdigit():
            n = int(s[4:])
        elif s.isdigit():
            n = int(s)
        else:
            raise ValueError('Pin desconocido: %r (usa el número BCM, por ejemplo 17 o "GPIO17")' % (p,))
    if _estado['placa'] == 'jetson':
        if n not in _BCM_A_BOARD:
            raise ValueError('El GPIO%d no está en el conector de la Jetson' % n)
        return 'PIN%d' % _BCM_A_BOARD[n]
    return 'GPIO%d' % n

def _ocupar(pin, quien):
    n = _nombre_pin(pin)
    if n in _pines and _pines[n] is not quien:
        raise RuntimeError('El pin %s ya lo usa otro dispositivo' % n)
    _pines[n] = quien
    return n

# ---------------------------------------------------------------- gpiozero

class Device:
    def close(self):
        for n, q in list(_pines.items()):
            if q is self:
                del _pines[n]
    def __enter__(self):
        return self
    def __exit__(self, *a):
        self.close()

class DigitalOutputDevice(Device):
    def __init__(self, pin, active_high=True, initial_value=False):
        self.pin = _ocupar(pin, self)
        self.active_high = active_high
        self._valor = 1.0 if initial_value else 0.0
        self._parpadeo = None
    def on(self):
        self._parpadeo = None; self._valor = 1.0
    def off(self):
        self._parpadeo = None; self._valor = 0.0
    def toggle(self):
        self._parpadeo = None; self._valor = 0.0 if self._valor else 1.0
    def blink(self, on_time=1, off_time=1, n=None, background=True):
        self._parpadeo = (float(on_time), float(off_time), n, _estado['t'])
    @property
    def value(self):
        return self._nivel_logico()
    @value.setter
    def value(self, v):
        self._parpadeo = None; self._valor = max(0.0, min(1.0, float(v)))
    @property
    def is_active(self):
        return bool(self.value)
    is_lit = is_active
    def _nivel_logico(self):
        if self._parpadeo:
            on, off, n, t0 = self._parpadeo
            ciclo = on + off
            k = (_estado['t'] - t0) / ciclo if ciclo > 0 else 0
            if n is not None and k >= n:
                self._parpadeo = None; self._valor = 0.0
                return 0.0
            return 1.0 if (k - math.floor(k)) * ciclo < on else 0.0
        return self._valor
    def _reporte(self):
        v = self._nivel_logico()
        if not self.active_high:
            v = 1.0 - v
        return {'mode': 'output', 'level': 1 if v >= 0.5 else 0, 'duty': v, 'freqHz': 0, 'pulsoUs': 0}

OutputDevice = DigitalOutputDevice

class LED(DigitalOutputDevice):
    pass

class Buzzer(DigitalOutputDevice):
    def beep(self, on_time=1, off_time=1, n=None, background=True):
        self.blink(on_time, off_time, n, background)

class PWMOutputDevice(DigitalOutputDevice):
    def __init__(self, pin, active_high=True, initial_value=0, frequency=100):
        DigitalOutputDevice.__init__(self, pin, active_high, False)
        self._valor = float(initial_value)
        self.frequency = frequency
    def _reporte(self):
        r = DigitalOutputDevice._reporte(self)
        r['freqHz'] = self.frequency if 0 < r['duty'] < 1 else 0
        return r

class PWMLED(PWMOutputDevice):
    pass

class DigitalInputDevice(Device):
    def __init__(self, pin, pull_up=False, active_state=None, bounce_time=None):
        self.pin = _ocupar(pin, self)
        self.pull_up = pull_up
        self.active_state = (not pull_up) if active_state is None else active_state
        self.when_activated = None
        self.when_deactivated = None
    def _nivel(self):
        d = _entradas['dobles'].get(self.pin)
        if d is not None:
            return bool(d[1] if self.pull_up else d[0])
        return bool(_entradas['digital'].get(self.pin, self.pull_up))
    @property
    def value(self):
        return 1 if self._nivel() == bool(self.active_state) else 0
    @property
    def is_active(self):
        return bool(self.value)
    def _reporte(self):
        return {'mode': 'input_pullup' if self.pull_up else 'input', 'level': 1 if self._nivel() else 0, 'duty': 0, 'freqHz': 0, 'pulsoUs': 0}

InputDevice = DigitalInputDevice

class Button(DigitalInputDevice):
    def __init__(self, pin, pull_up=True, active_state=None, bounce_time=None, hold_time=1):
        DigitalInputDevice.__init__(self, pin, pull_up, active_state, bounce_time)
    @property
    def is_pressed(self):
        return self.is_active

class LineSensor(DigitalInputDevice):
    """TCRT5000: su salida está en ALTO sobre la línea negra."""
    def __init__(self, pin, pull_up=False, active_state=True, **kw):
        DigitalInputDevice.__init__(self, pin, pull_up, active_state)
    @property
    def line_detected(self):
        return self.is_active

class MotionSensor(DigitalInputDevice):
    @property
    def motion_detected(self):
        return self.is_active

class DistanceSensor(Device):
    """HC-SR04: distance en metros (hasta max_distance)."""
    def __init__(self, echo, trigger, max_distance=1, threshold_distance=0.3, **kw):
        self.echo = _ocupar(echo, self)
        self.trigger = _ocupar(trigger, self)
        self.max_distance = max_distance
        self.threshold_distance = threshold_distance
    @property
    def distance(self):
        for u in _entradas['us']:
            if u.get('echo') == self.echo or u.get('trig') == self.trigger:
                cm = u.get('cm')
                return self.max_distance if cm is None else min(self.max_distance, cm / 100.0)
        return self.max_distance
    @property
    def value(self):
        return self.distance / self.max_distance
    @property
    def in_range(self):
        return self.distance < self.threshold_distance
    def _reporte_de(self, n):
        if n == self.trigger:
            return {'mode': 'output', 'level': 0, 'duty': 0.001, 'freqHz': 16, 'pulsoUs': 10}
        return {'mode': 'input', 'level': 0, 'duty': 0, 'freqHz': 0, 'pulsoUs': 0}

class Motor(Device):
    """Motor con un driver (L298N, TB6612): forward/backward = IN1/IN2, enable = ENA."""
    def __init__(self, forward, backward, enable=None, pwm=True):
        self.adelante = PWMOutputDevice(forward)
        self.atras = PWMOutputDevice(backward)
        self.habilitar = PWMOutputDevice(enable) if enable is not None else None
        self._v = 0.0
    def forward(self, speed=1):
        self.value = abs(speed)
    def backward(self, speed=1):
        self.value = -abs(speed)
    def reverse(self):
        self.value = -self._v
    def stop(self):
        self.value = 0
    @property
    def value(self):
        return self._v
    @value.setter
    def value(self, v):
        v = max(-1.0, min(1.0, float(v)))
        self._v = v
        if self.habilitar is not None:
            self.adelante.value = 1 if v > 0 else 0
            self.atras.value = 1 if v < 0 else 0
            self.habilitar.value = abs(v)
        else:
            self.adelante.value = v if v > 0 else 0
            self.atras.value = -v if v < 0 else 0
    @property
    def is_active(self):
        return self._v != 0
    def close(self):
        for d in (self.adelante, self.atras, self.habilitar):
            if d is not None:
                d.close()

class Robot(Device):
    """Dos motores: left y right son tuplas (forward, backward[, enable]) o Motor."""
    def __init__(self, left=None, right=None, pwm=True, left_motor=None, right_motor=None):
        izq = left if left is not None else left_motor
        der = right if right is not None else right_motor
        self.left_motor = izq if isinstance(izq, Motor) else Motor(*izq)
        self.right_motor = der if isinstance(der, Motor) else Motor(*der)
    def forward(self, speed=1, curve_left=0, curve_right=0):
        self.left_motor.forward(speed * (1 - curve_left))
        self.right_motor.forward(speed * (1 - curve_right))
    def backward(self, speed=1, curve_left=0, curve_right=0):
        self.left_motor.backward(speed * (1 - curve_left))
        self.right_motor.backward(speed * (1 - curve_right))
    def left(self, speed=1):
        self.left_motor.backward(speed); self.right_motor.forward(speed)
    def right(self, speed=1):
        self.left_motor.forward(speed); self.right_motor.backward(speed)
    def reverse(self):
        self.left_motor.reverse(); self.right_motor.reverse()
    def stop(self):
        self.left_motor.stop(); self.right_motor.stop()
    @property
    def value(self):
        return (self.left_motor.value, self.right_motor.value)
    @value.setter
    def value(self, v):
        self.left_motor.value, self.right_motor.value = v
    def close(self):
        self.left_motor.close(); self.right_motor.close()

class Servo(Device):
    """value de -1 (1 ms) a 1 (2 ms); min()/mid()/max()."""
    def __init__(self, pin, initial_value=0, min_pulse_width=1/1000, max_pulse_width=2/1000, frame_width=20/1000):
        self.pin = _ocupar(pin, self)
        self.min_pw, self.max_pw, self.frame = min_pulse_width, max_pulse_width, frame_width
        self._v = initial_value
    def min(self): self.value = -1
    def mid(self): self.value = 0
    def max(self): self.value = 1
    def detach(self): self._v = None
    @property
    def value(self):
        return self._v
    @value.setter
    def value(self, v):
        self._v = None if v is None else max(-1.0, min(1.0, float(v)))
    def _reporte(self):
        if self._v is None:
            return {'mode': 'output', 'level': 0, 'duty': 0, 'freqHz': 0, 'pulsoUs': 0}
        pw = self.min_pw + (self._v + 1) / 2 * (self.max_pw - self.min_pw)
        return {'mode': 'output', 'level': 0, 'duty': pw / self.frame, 'freqHz': 1 / self.frame, 'pulsoUs': pw * 1e6}

class AngularServo(Servo):
    def __init__(self, pin, initial_angle=0, min_angle=-90, max_angle=90, min_pulse_width=1/1000, max_pulse_width=2/1000, frame_width=20/1000):
        Servo.__init__(self, pin, 0, min_pulse_width, max_pulse_width, frame_width)
        self.min_angle, self.max_angle = min_angle, max_angle
        self.angle = initial_angle
    @property
    def angle(self):
        if self._v is None: return None
        return self.min_angle + (self._v + 1) / 2 * (self.max_angle - self.min_angle)
    @angle.setter
    def angle(self, a):
        if a is None: self._v = None; return
        self.value = (float(a) - self.min_angle) / (self.max_angle - self.min_angle) * 2 - 1

_gz = types.ModuleType('gpiozero')
for _k, _v in list(globals().items()):
    if isinstance(_v, type) and _k[0].isupper():
        setattr(_gz, _k, _v)
sys.modules['gpiozero'] = _gz

# ---------------------------------------------------------------- RPi.GPIO / Jetson.GPIO

_gpio = {'modo': None}

class _CanalGPIO:
    def __init__(self, nombre, salida, pud, valor):
        self.nombre, self.salida, self.pud, self.valor, self.pwm = nombre, salida, pud, valor, None
    def leer(self):
        d = _entradas['dobles'].get(self.nombre)
        if d is not None:
            return bool(d[1] if self.pud == _G.PUD_UP else d[0])
        return bool(_entradas['digital'].get(self.nombre, self.pud == _G.PUD_UP))
    def _reporte(self):
        if self.salida:
            if self.pwm is not None and self.pwm.activo:
                return self.pwm._reporte()
            return {'mode': 'output', 'level': self.valor, 'duty': float(self.valor), 'freqHz': 0, 'pulsoUs': 0}
        return {'mode': 'input_pullup' if self.pud == _G.PUD_UP else 'input', 'level': 1 if self.leer() else 0, 'duty': 0, 'freqHz': 0, 'pulsoUs': 0}

def _canal_gpio(ch):
    modo = _gpio['modo']
    if modo is None:
        raise RuntimeError('Primero elige cómo numerar los pines: GPIO.setmode(GPIO.BOARD) o GPIO.setmode(GPIO.BCM)')
    try:
        n = int(ch)
    except (TypeError, ValueError):
        raise ValueError('Pin desconocido: %r' % (ch,))
    if modo == _G.BOARD:
        if n not in _BOARD_A_BCM:
            raise ValueError('El pin %d del conector no es un GPIO (es alimentación, tierra o no existe)' % n)
        return 'PIN%d' % n if _estado['placa'] == 'jetson' else 'GPIO%d' % _BOARD_A_BCM[n]
    if n not in _BCM_A_BOARD:
        raise ValueError('El GPIO%d no está en el conector de 40 pines' % n)
    return 'PIN%d' % _BCM_A_BOARD[n] if _estado['placa'] == 'jetson' else 'GPIO%d' % n

def _lista(x):
    return list(x) if isinstance(x, (list, tuple)) else [x]

def _canal_usado(ch, salida=None):
    nombre = _canal_gpio(ch)
    c = _pines.get(nombre)
    if not isinstance(c, _CanalGPIO):
        raise RuntimeError('El pin %s no está configurado: usa GPIO.setup(%s, GPIO.OUT) o GPIO.setup(%s, GPIO.IN)' % (ch, ch, ch))
    if salida and not c.salida:
        raise RuntimeError('El pin %s está configurado como entrada (GPIO.IN): para escribir usa GPIO.OUT' % ch)
    return c

class _PWM:
    def __init__(self, ch, frecuencia):
        c = _canal_usado(ch)
        if not c.salida:
            raise RuntimeError('Antes de GPIO.PWM, configura el pin como salida: GPIO.setup(%s, GPIO.OUT)' % ch)
        if _estado['placa'] == 'jetson' and c.nombre not in ('PIN32', 'PIN33'):
            raise ValueError('En la Jetson Nano solo los pines 32 y 33 tienen PWM (el %s no)' % ch)
        self.canal, self.frecuencia, self.duty, self.activo = c, float(frecuencia), 0.0, False
        c.pwm = self
    def start(self, duty):
        self.ChangeDutyCycle(duty); self.activo = True
    def ChangeDutyCycle(self, duty):
        duty = float(duty)
        if duty < 0 or duty > 100:
            raise ValueError('El ciclo de trabajo va de 0 a 100 (pusiste %s)' % duty)
        self.duty = duty
    def ChangeFrequency(self, f):
        self.frecuencia = float(f)
    def stop(self):
        self.activo = False
    def _reporte(self):
        d = self.duty / 100.0
        return {'mode': 'output', 'level': 1 if d >= 0.5 else 0, 'duty': d, 'freqHz': self.frecuencia if 0 < d < 1 else 0, 'pulsoUs': (d / self.frecuencia * 1e6) if self.frecuencia else 0}

_G = types.ModuleType('GPIO')
_G.BOARD, _G.BCM = 10, 11
_G.OUT, _G.IN = 0, 1
_G.LOW, _G.HIGH = 0, 1
_G.PUD_OFF, _G.PUD_DOWN, _G.PUD_UP = 20, 21, 22
_G.RISING, _G.FALLING, _G.BOTH = 31, 32, 33

def _setmode(m):
    if m not in (_G.BOARD, _G.BCM):
        raise ValueError('Usa GPIO.setmode(GPIO.BOARD) o GPIO.setmode(GPIO.BCM)')
    _gpio['modo'] = m

def _setup(ch, direccion, pull_up_down=20, initial=None):
    for c in _lista(ch):
        nombre = _canal_gpio(c)
        previo = _pines.get(nombre)
        if previo is not None and not isinstance(previo, _CanalGPIO):
            raise RuntimeError('El pin %s ya lo usa otro dispositivo' % nombre)
        salida = direccion == _G.OUT
        _pines[nombre] = _CanalGPIO(nombre, salida, pull_up_down, 1 if (salida and initial) else 0)

def _output(ch, valor):
    canales, valores = _lista(ch), _lista(valor)
    if len(valores) == 1:
        valores = valores * len(canales)
    for c, v in zip(canales, valores):
        _canal_usado(c, salida=True).valor = 1 if v else 0

def _input(ch):
    c = _canal_usado(ch)
    return c.valor if c.salida else (_G.HIGH if c.leer() else _G.LOW)

def _cleanup(ch=None):
    nombres = None if ch is None else {_canal_gpio(c) for c in _lista(ch)}
    for n, q in list(_pines.items()):
        if isinstance(q, _CanalGPIO) and (nombres is None or n in nombres):
            del _pines[n]

_G.setmode, _G.getmode = _setmode, lambda: _gpio['modo']
_G.setwarnings = lambda b: None
_G.setup, _G.output, _G.input, _G.cleanup, _G.PWM = _setup, _output, _input, _cleanup, _PWM
_G.model = 'JETSON_NANO'
for _pkg in ('RPi', 'Jetson'):
    _m = types.ModuleType(_pkg)
    _m.GPIO = _G
    sys.modules[_pkg] = _m
    sys.modules[_pkg + '.GPIO'] = _G

# ---------------------------------------------------------------- camara

class Camara:
    """Cámara CSI del simulador. leer() da la imagen como una lista de filas
    (de arriba abajo); cada fila es una lista de números: 0 = negro, 255 = blanco.
    En la Jetson real se usa OpenCV (cv2.VideoCapture) y la imagen es una
    matriz de NumPy, pero la idea es la misma: una tabla de números."""
    def __init__(self, *a, **kw):
        pass
    def _imagen(self):
        cam = _entradas['cam']
        if cam is None:
            raise RuntimeError('No hay imagen: conecta la cámara CSI al conector CSI de la placa')
        return cam
    @property
    def ancho(self):
        return int(self._imagen()['ancho'])
    @property
    def alto(self):
        return int(self._imagen()['alto'])
    def leer(self):
        cam = self._imagen()
        w, h, px = int(cam['ancho']), int(cam['alto']), list(cam['px'])
        return [px[j * w:(j + 1) * w] for j in range(h)]

_cm = types.ModuleType('camara')
_cm.Camara = Camara
sys.modules['camara'] = _cm

# ---------------------------------------------------------------- perro

class Perro:
    """Perro robot cuadrúpedo (como el Unitree Go2 en su modo de alto nivel).
    No se mueve cada motor: se le pide una postura y una velocidad, y su
    controlador de marcha mueve las 4 patas. Las órdenes viajan por el cable
    de red; la última orden vale hasta que se mande otra.
      mover(vx, vy=0, giro=0): vx adelante (m/s), vy a la izquierda (m/s),
                               giro a la izquierda (grados por segundo)."""
    def __init__(self, *a, **kw):
        if _entradas['perro'] is None:
            raise RuntimeError('El perro no responde: conecta el cable de red (ETH) del perro a la placa')
        _estado['marcha'] = {'vx': 0.0, 'vy': 0.0, 'giro': 0.0, 'postura': _entradas['perro']['postura']}
    def _orden(self, **kw):
        _estado['marcha'].update(kw)
    def _sensor(self):
        return _entradas['perro']
    def pararse(self):
        self._orden(postura='parado', vx=0.0, vy=0.0, giro=0.0)
    def echarse(self):
        self._orden(postura='echado', vx=0.0, vy=0.0, giro=0.0)
    def sentarse(self):
        self._orden(postura='sentado', vx=0.0, vy=0.0, giro=0.0)
    def saludar(self):
        """Se sienta y levanta la pata delantera derecha."""
        self._orden(postura='saludo', vx=0.0, vy=0.0, giro=0.0)
    def mover(self, vx, vy=0, giro=0):
        if _estado['marcha']['postura'] != 'parado':
            raise RuntimeError('Para caminar, el perro tiene que estar de pie: llama a perro.pararse() antes de perro.mover()')
        s = self._sensor()
        lim = lambda v, m: max(-m, min(m, float(v)))
        self._orden(vx=lim(vx, s['v_max']), vy=lim(vy, s['v_lateral_max']), giro=lim(giro, s['giro_max']))
    def detener(self):
        self._orden(vx=0.0, vy=0.0, giro=0.0)
    def distancia(self):
        """Centímetros hasta lo que tiene adelante (si no ve nada, el alcance: 200)."""
        d = self._sensor()['distancia']
        return float(self._sensor()['alcance']) if d is None else float(d)
    def orientacion(self):
        """Grados que giró desde la salida (+ = a la izquierda). No salta en 180: dos vueltas = 720."""
        return float(self._sensor()['orientacion'])
    @property
    def postura(self):
        return self._sensor()['postura']
    @property
    def listo(self):
        """True cuando terminó de pararse y ya puede caminar."""
        return bool(self._sensor()['lista'])

_pm = types.ModuleType('perro')
_pm.Perro = Perro
sys.modules['perro'] = _pm

# time.sleep y signal.pause también existen como módulos (los reescribe el ast).
_tm = types.ModuleType('time')
_tm.sleep = lambda s=0: None
_tm.time = lambda: _estado['t']
_tm.monotonic = lambda: _estado['t']
_tm.perf_counter = lambda: _estado['t']
sys.modules['time'] = _tm
_sg = types.ModuleType('signal')
_sg.pause = lambda: None
sys.modules['signal'] = _sg

# ---------------------------------------------------------------- reescritura

def _es_sleep(f):
    if isinstance(f, ast.Name):
        return f.id in ('sleep', 'pause')
    return isinstance(f, ast.Attribute) and f.attr in ('sleep', 'pause') and isinstance(f.value, ast.Name) and f.value.id in ('time', 'signal')

def _llamados(nodo):
    for n in ast.walk(nodo):
        if isinstance(n, ast.Call):
            yield n

def _reescribir(arbol):
    funcs = {n.name: n for n in ast.walk(arbol) if isinstance(n, ast.FunctionDef)}
    duermen = set()
    cambio = True
    while cambio:
        cambio = False
        for nombre, f in funcs.items():
            if nombre in duermen:
                continue
            for c in _llamados(f):
                if _es_sleep(c.func) or (isinstance(c.func, ast.Name) and c.func.id in duermen):
                    duermen.add(nombre); cambio = True; break

    class T(ast.NodeTransformer):
        def visit_FunctionDef(self, n):
            self.generic_visit(n)
            if n.name in duermen:
                nuevo = ast.AsyncFunctionDef(name=n.name, args=n.args, body=n.body, decorator_list=n.decorator_list, returns=n.returns, type_comment=None)
                return ast.copy_location(nuevo, n)
            return n
        def visit_Call(self, n):
            self.generic_visit(n)
            if _es_sleep(n.func):
                es_pausa = (n.func.id if isinstance(n.func, ast.Name) else n.func.attr) == 'pause'
                args = [ast.Constant(1e12)] if es_pausa else n.args
                return ast.copy_location(ast.Await(ast.Call(ast.Name('_espera', ast.Load()), args, [])), n)
            if isinstance(n.func, ast.Name) and n.func.id in duermen:
                return ast.copy_location(ast.Await(n), n)
            return n
    return ast.fix_missing_locations(T().visit(arbol))

def _traza(frame, evento, arg):
    if evento == 'line':
        _estado['lineas'] += 1
        if _estado['lineas'] > _PRESUPUESTO:
            raise RuntimeError('Tu programa no se detiene nunca: pon un sleep() dentro del bucle (por ejemplo sleep(0.01)).')
    return _traza

def _limpiar_error(e):
    tb = e.__traceback__
    linea = None
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == '<programa>':
            linea = tb.tb_lineno
        tb = tb.tb_next
    nombre = type(e).__name__
    return ('Línea %d: ' % linea if linea else '') + '%s: %s' % (nombre, e)

class _Salida:
    def write(self, s):
        _estado['salida'].append(s)
        return len(s)
    def flush(self):
        pass

def _cargar(codigo, placa='rpi'):
    _pines.clear()
    _gpio['modo'] = None
    _entradas['cam'] = None
    _entradas['perro'] = None
    _estado.update(t=0.0, reloj=0.0, despertar=0.0, coro=None, vivo=False, salida=[], lineas=0, placa=placa, marcha=None)
    try:
        arbol = _reescribir(ast.parse(codigo, '<programa>'))
        codigo_obj = compile(arbol, '<programa>', 'exec', flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
    except SyntaxError as e:
        return 'Línea %s: error de sintaxis: %s' % (e.lineno, e.msg)
    g = {'__name__': '__main__', '_espera': _espera}
    _estado['g'] = g
    _estado['codigo'] = codigo_obj
    _estado['vivo'] = True
    _estado['inicio'] = True
    return None

def _reporte():
    pines = {}
    for n, q in list(_pines.items()):
        if isinstance(q, DistanceSensor):
            pines[n] = q._reporte_de(n)
        elif hasattr(q, '_reporte'):
            pines[n] = q._reporte()
    return pines

def _avanzar(dt, digital=None, dobles=None, us=None, cam=None, perro=None):
    _entradas['digital'] = dict(digital or {})
    _entradas['dobles'] = {k: list(v) for k, v in (dobles or {}).items()}
    _entradas['us'] = [dict(u) for u in (us or [])]
    if cam is not None:
        _entradas['cam'] = dict(cam)   # la última imagen sigue valiendo hasta que llegue otra
    _entradas['perro'] = dict(perro) if perro is not None else None
    # Reloj lógico: cada sleep despierta en su instante exacto (no al cuadro siguiente),
    # así 50 × sleep(0.1) son 5 s justos aunque la simulación avance de a 1/60 s.
    reloj = _estado['reloj'] = _estado.get('reloj', 0.0) + dt
    error = None
    viejo = sys.stdout
    sys.stdout = _Salida()
    sys.settrace(_traza)
    _estado['lineas'] = 0
    try:
        if _estado.get('inicio'):
            _estado['inicio'] = False
            r = eval(_estado['codigo'], _estado['g'])
            if r is None or not hasattr(r, 'send'):
                _estado['vivo'] = False      # sin sleep: el programa ya terminó
            else:
                _estado['coro'] = r
                _estado['despertar'] = _estado['t']
        while _estado['vivo'] and reloj >= _estado['despertar']:
            _estado['t'] = _estado['despertar']
            try:
                s = _estado['coro'].send(None)
                _estado['despertar'] = _estado['t'] + (s if isinstance(s, (int, float)) else 0)
            except StopIteration:
                _estado['vivo'] = False
    except Exception as e:
        _estado['vivo'] = False
        error = _limpiar_error(e)
    finally:
        sys.settrace(None)
        sys.stdout = viejo
        _estado['t'] = reloj
    salida = ''.join(_estado['salida'])
    _estado['salida'] = []
    marcha = _estado.get('marcha')
    if marcha is not None:
        marcha = dict(marcha)
        if not _estado['vivo']:
            # Programa terminado: el perro deja de recibir órdenes y se queda quieto en su postura.
            marcha.update(vx=0.0, vy=0.0, giro=0.0)
    return {'pines': _reporte(), 'salida': salida, 'error': error, 'terminado': not _estado['vivo'], 'marcha': marcha}
`
