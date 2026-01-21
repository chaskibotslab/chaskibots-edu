'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Copy, RotateCcw, Save, Code, Bot, Cpu, Lightbulb, Gauge, Monitor, FileCode } from 'lucide-react'
import RobotSimulator from './RobotSimulator'

// Definición de bloques personalizados para robótica
const CUSTOM_BLOCKS = `
Blockly.Blocks['robot_move_forward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🚗 Mover adelante")
        .appendField(new Blockly.FieldNumber(100, 0, 255), "SPEED")
        .appendField("velocidad");
    this.appendDummyInput()
        .appendField("por")
        .appendField(new Blockly.FieldNumber(1000, 0, 10000), "TIME")
        .appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Mueve el robot hacia adelante");
  }
};

Blockly.Blocks['robot_move_backward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔙 Mover atrás")
        .appendField(new Blockly.FieldNumber(100, 0, 255), "SPEED")
        .appendField("velocidad");
    this.appendDummyInput()
        .appendField("por")
        .appendField(new Blockly.FieldNumber(1000, 0, 10000), "TIME")
        .appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Mueve el robot hacia atrás");
  }
};

Blockly.Blocks['robot_turn_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("↩️ Girar izquierda")
        .appendField(new Blockly.FieldNumber(90, 0, 360), "ANGLE")
        .appendField("grados");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Gira el robot a la izquierda");
  }
};

Blockly.Blocks['robot_turn_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("↪️ Girar derecha")
        .appendField(new Blockly.FieldNumber(90, 0, 360), "ANGLE")
        .appendField("grados");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Gira el robot a la derecha");
  }
};

Blockly.Blocks['robot_stop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🛑 Detener robot");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
    this.setTooltip("Detiene todos los motores");
  }
};

Blockly.Blocks['led_on'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("💡 Encender LED pin")
        .appendField(new Blockly.FieldNumber(13, 0, 53), "PIN");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Enciende un LED en el pin especificado");
  }
};

Blockly.Blocks['led_off'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔌 Apagar LED pin")
        .appendField(new Blockly.FieldNumber(13, 0, 53), "PIN");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Apaga un LED en el pin especificado");
  }
};

Blockly.Blocks['led_blink'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("✨ Parpadear LED pin")
        .appendField(new Blockly.FieldNumber(13, 0, 53), "PIN");
    this.appendDummyInput()
        .appendField("cada")
        .appendField(new Blockly.FieldNumber(500, 100, 5000), "DELAY")
        .appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Hace parpadear un LED");
  }
};

Blockly.Blocks['sensor_ultrasonic'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📏 Leer sensor ultrasónico");
    this.appendDummyInput()
        .appendField("Trigger pin")
        .appendField(new Blockly.FieldNumber(9, 0, 53), "TRIG")
        .appendField("Echo pin")
        .appendField(new Blockly.FieldNumber(10, 0, 53), "ECHO");
    this.setOutput(true, "Number");
    this.setColour(210);
    this.setTooltip("Lee la distancia del sensor ultrasónico en cm");
  }
};

Blockly.Blocks['sensor_ir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("👁️ Leer sensor IR pin")
        .appendField(new Blockly.FieldNumber(2, 0, 53), "PIN");
    this.setOutput(true, "Boolean");
    this.setColour(210);
    this.setTooltip("Lee el sensor infrarrojo (detecta obstáculo)");
  }
};

Blockly.Blocks['servo_move'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🦾 Mover servo pin")
        .appendField(new Blockly.FieldNumber(9, 0, 53), "PIN");
    this.appendDummyInput()
        .appendField("a")
        .appendField(new Blockly.FieldNumber(90, 0, 180), "ANGLE")
        .appendField("grados");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Mueve un servomotor al ángulo especificado");
  }
};

Blockly.Blocks['motor_dc'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⚙️ Motor DC")
        .appendField(new Blockly.FieldDropdown([["A","A"], ["B","B"]]), "MOTOR");
    this.appendDummyInput()
        .appendField("velocidad")
        .appendField(new Blockly.FieldNumber(150, 0, 255), "SPEED")
        .appendField(new Blockly.FieldDropdown([["adelante","FWD"], ["atrás","BWD"]]), "DIR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Controla un motor DC");
  }
};

Blockly.Blocks['delay_ms'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⏱️ Esperar")
        .appendField(new Blockly.FieldNumber(1000, 0, 60000), "MS")
        .appendField("milisegundos");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("Pausa la ejecución por el tiempo especificado");
  }
};

Blockly.Blocks['serial_print'] = {
  init: function() {
    this.appendValueInput("TEXT")
        .setCheck(null)
        .appendField("📝 Imprimir en serial");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Imprime un mensaje en el monitor serial");
  }
};

Blockly.Blocks['buzzer_tone'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔊 Buzzer pin")
        .appendField(new Blockly.FieldNumber(8, 0, 53), "PIN");
    this.appendDummyInput()
        .appendField("frecuencia")
        .appendField(new Blockly.FieldNumber(1000, 100, 5000), "FREQ")
        .appendField("Hz por")
        .appendField(new Blockly.FieldNumber(500, 100, 5000), "DURATION")
        .appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("Reproduce un tono en el buzzer");
  }
};
`

// Generadores de código Arduino
const ARDUINO_GENERATORS = `
Blockly.Arduino = new Blockly.Generator('Arduino');

Blockly.Arduino.ORDER_ATOMIC = 0;
Blockly.Arduino.ORDER_NONE = 99;

Blockly.Arduino.init = function(workspace) {
  Blockly.Arduino.definitions_ = Object.create(null);
  Blockly.Arduino.setups_ = Object.create(null);
};

Blockly.Arduino.finish = function(code) {
  var definitions = [];
  for (var name in Blockly.Arduino.definitions_) {
    definitions.push(Blockly.Arduino.definitions_[name]);
  }
  var setups = [];
  for (var name in Blockly.Arduino.setups_) {
    setups.push(Blockly.Arduino.setups_[name]);
  }
  return definitions.join('\\n') + '\\n\\nvoid setup() {\\n  Serial.begin(9600);\\n' + setups.join('\\n') + '\\n}\\n\\nvoid loop() {\\n' + code + '}\\n';
};

Blockly.Arduino.scrubNakedValue = function(line) {
  return line + ';\\n';
};

Blockly.Arduino.scrub_ = function(block, code) {
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.Arduino.blockToCode(nextBlock);
  return code + nextCode;
};

// Generadores para cada bloque
Blockly.Arduino['robot_move_forward'] = function(block) {
  var speed = block.getFieldValue('SPEED');
  var time = block.getFieldValue('TIME');
  Blockly.Arduino.definitions_['motor_pins'] = '// Pines de motores\\nint motorA1 = 5;\\nint motorA2 = 6;\\nint motorB1 = 9;\\nint motorB2 = 10;';
  Blockly.Arduino.setups_['motor_setup'] = '  pinMode(motorA1, OUTPUT);\\n  pinMode(motorA2, OUTPUT);\\n  pinMode(motorB1, OUTPUT);\\n  pinMode(motorB2, OUTPUT);';
  return '  // Mover adelante\\n  analogWrite(motorA1, ' + speed + ');\\n  analogWrite(motorA2, 0);\\n  analogWrite(motorB1, ' + speed + ');\\n  analogWrite(motorB2, 0);\\n  delay(' + time + ');\\n';
};

Blockly.Arduino['robot_move_backward'] = function(block) {
  var speed = block.getFieldValue('SPEED');
  var time = block.getFieldValue('TIME');
  Blockly.Arduino.definitions_['motor_pins'] = '// Pines de motores\\nint motorA1 = 5;\\nint motorA2 = 6;\\nint motorB1 = 9;\\nint motorB2 = 10;';
  Blockly.Arduino.setups_['motor_setup'] = '  pinMode(motorA1, OUTPUT);\\n  pinMode(motorA2, OUTPUT);\\n  pinMode(motorB1, OUTPUT);\\n  pinMode(motorB2, OUTPUT);';
  return '  // Mover atrás\\n  analogWrite(motorA1, 0);\\n  analogWrite(motorA2, ' + speed + ');\\n  analogWrite(motorB1, 0);\\n  analogWrite(motorB2, ' + speed + ');\\n  delay(' + time + ');\\n';
};

Blockly.Arduino['robot_turn_left'] = function(block) {
  var angle = block.getFieldValue('ANGLE');
  var time = Math.round(angle * 5);
  Blockly.Arduino.definitions_['motor_pins'] = '// Pines de motores\\nint motorA1 = 5;\\nint motorA2 = 6;\\nint motorB1 = 9;\\nint motorB2 = 10;';
  return '  // Girar izquierda ' + angle + ' grados\\n  analogWrite(motorA1, 0);\\n  analogWrite(motorA2, 150);\\n  analogWrite(motorB1, 150);\\n  analogWrite(motorB2, 0);\\n  delay(' + time + ');\\n';
};

Blockly.Arduino['robot_turn_right'] = function(block) {
  var angle = block.getFieldValue('ANGLE');
  var time = Math.round(angle * 5);
  Blockly.Arduino.definitions_['motor_pins'] = '// Pines de motores\\nint motorA1 = 5;\\nint motorA2 = 6;\\nint motorB1 = 9;\\nint motorB2 = 10;';
  return '  // Girar derecha ' + angle + ' grados\\n  analogWrite(motorA1, 150);\\n  analogWrite(motorA2, 0);\\n  analogWrite(motorB1, 0);\\n  analogWrite(motorB2, 150);\\n  delay(' + time + ');\\n';
};

Blockly.Arduino['robot_stop'] = function(block) {
  return '  // Detener robot\\n  analogWrite(motorA1, 0);\\n  analogWrite(motorA2, 0);\\n  analogWrite(motorB1, 0);\\n  analogWrite(motorB2, 0);\\n';
};

Blockly.Arduino['led_on'] = function(block) {
  var pin = block.getFieldValue('PIN');
  Blockly.Arduino.setups_['led_' + pin] = '  pinMode(' + pin + ', OUTPUT);';
  return '  digitalWrite(' + pin + ', HIGH);\\n';
};

Blockly.Arduino['led_off'] = function(block) {
  var pin = block.getFieldValue('PIN');
  Blockly.Arduino.setups_['led_' + pin] = '  pinMode(' + pin + ', OUTPUT);';
  return '  digitalWrite(' + pin + ', LOW);\\n';
};

Blockly.Arduino['led_blink'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var delay = block.getFieldValue('DELAY');
  Blockly.Arduino.setups_['led_' + pin] = '  pinMode(' + pin + ', OUTPUT);';
  return '  digitalWrite(' + pin + ', HIGH);\\n  delay(' + delay + ');\\n  digitalWrite(' + pin + ', LOW);\\n  delay(' + delay + ');\\n';
};

Blockly.Arduino['sensor_ultrasonic'] = function(block) {
  var trig = block.getFieldValue('TRIG');
  var echo = block.getFieldValue('ECHO');
  Blockly.Arduino.definitions_['ultrasonic_func'] = 'long readUltrasonic(int trigPin, int echoPin) {\\n  digitalWrite(trigPin, LOW);\\n  delayMicroseconds(2);\\n  digitalWrite(trigPin, HIGH);\\n  delayMicroseconds(10);\\n  digitalWrite(trigPin, LOW);\\n  long duration = pulseIn(echoPin, HIGH);\\n  return duration * 0.034 / 2;\\n}';
  Blockly.Arduino.setups_['ultrasonic_' + trig] = '  pinMode(' + trig + ', OUTPUT);\\n  pinMode(' + echo + ', INPUT);';
  return ['readUltrasonic(' + trig + ', ' + echo + ')', Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['sensor_ir'] = function(block) {
  var pin = block.getFieldValue('PIN');
  Blockly.Arduino.setups_['ir_' + pin] = '  pinMode(' + pin + ', INPUT);';
  return ['digitalRead(' + pin + ') == LOW', Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['servo_move'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var angle = block.getFieldValue('ANGLE');
  Blockly.Arduino.definitions_['servo_lib'] = '#include <Servo.h>\\nServo servo_' + pin + ';';
  Blockly.Arduino.setups_['servo_' + pin] = '  servo_' + pin + '.attach(' + pin + ');';
  return '  servo_' + pin + '.write(' + angle + ');\\n  delay(500);\\n';
};

Blockly.Arduino['motor_dc'] = function(block) {
  var motor = block.getFieldValue('MOTOR');
  var speed = block.getFieldValue('SPEED');
  var dir = block.getFieldValue('DIR');
  var pin1 = motor === 'A' ? 'motorA1' : 'motorB1';
  var pin2 = motor === 'A' ? 'motorA2' : 'motorB2';
  Blockly.Arduino.definitions_['motor_pins'] = '// Pines de motores\\nint motorA1 = 5;\\nint motorA2 = 6;\\nint motorB1 = 9;\\nint motorB2 = 10;';
  Blockly.Arduino.setups_['motor_setup'] = '  pinMode(motorA1, OUTPUT);\\n  pinMode(motorA2, OUTPUT);\\n  pinMode(motorB1, OUTPUT);\\n  pinMode(motorB2, OUTPUT);';
  if (dir === 'FWD') {
    return '  analogWrite(' + pin1 + ', ' + speed + ');\\n  analogWrite(' + pin2 + ', 0);\\n';
  } else {
    return '  analogWrite(' + pin1 + ', 0);\\n  analogWrite(' + pin2 + ', ' + speed + ');\\n';
  }
};

Blockly.Arduino['delay_ms'] = function(block) {
  var ms = block.getFieldValue('MS');
  return '  delay(' + ms + ');\\n';
};

Blockly.Arduino['serial_print'] = function(block) {
  var text = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
  return '  Serial.println(' + text + ');\\n';
};

Blockly.Arduino['buzzer_tone'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var freq = block.getFieldValue('FREQ');
  var duration = block.getFieldValue('DURATION');
  Blockly.Arduino.setups_['buzzer_' + pin] = '  pinMode(' + pin + ', OUTPUT);';
  return '  tone(' + pin + ', ' + freq + ', ' + duration + ');\\n  delay(' + duration + ');\\n';
};

// Bloques básicos de control
Blockly.Arduino['controls_if'] = function(block) {
  var n = 0;
  var code = '';
  do {
    var conditionCode = Blockly.Arduino.valueToCode(block, 'IF' + n, Blockly.Arduino.ORDER_NONE) || 'false';
    var branchCode = Blockly.Arduino.statementToCode(block, 'DO' + n);
    code += (n > 0 ? ' else ' : '') + 'if (' + conditionCode + ') {\\n' + branchCode + '}';
    ++n;
  } while (block.getInput('IF' + n));
  if (block.getInput('ELSE')) {
    var branchCode = Blockly.Arduino.statementToCode(block, 'ELSE');
    code += ' else {\\n' + branchCode + '}';
  }
  return code + '\\n';
};

Blockly.Arduino['controls_repeat_ext'] = function(block) {
  var repeats = Blockly.Arduino.valueToCode(block, 'TIMES', Blockly.Arduino.ORDER_NONE) || '0';
  var branch = Blockly.Arduino.statementToCode(block, 'DO');
  return '  for (int i = 0; i < ' + repeats + '; i++) {\\n' + branch + '  }\\n';
};

Blockly.Arduino['controls_whileUntil'] = function(block) {
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Arduino.valueToCode(block, 'BOOL', Blockly.Arduino.ORDER_NONE) || 'false';
  var branch = Blockly.Arduino.statementToCode(block, 'DO');
  if (until) {
    argument0 = '!' + argument0;
  }
  return '  while (' + argument0 + ') {\\n' + branch + '  }\\n';
};

Blockly.Arduino['math_number'] = function(block) {
  var code = parseFloat(block.getFieldValue('NUM'));
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['text'] = function(block) {
  var code = '"' + block.getFieldValue('TEXT') + '"';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['logic_compare'] = function(block) {
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var argument0 = Blockly.Arduino.valueToCode(block, 'A', Blockly.Arduino.ORDER_NONE) || '0';
  var argument1 = Blockly.Arduino.valueToCode(block, 'B', Blockly.Arduino.ORDER_NONE) || '0';
  return [argument0 + ' ' + operator + ' ' + argument1, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['logic_boolean'] = function(block) {
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['math_arithmetic'] = function(block) {
  var OPERATORS = {
    'ADD': '+',
    'MINUS': '-',
    'MULTIPLY': '*',
    'DIVIDE': '/',
    'POWER': null
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var argument0 = Blockly.Arduino.valueToCode(block, 'A', Blockly.Arduino.ORDER_NONE) || '0';
  var argument1 = Blockly.Arduino.valueToCode(block, 'B', Blockly.Arduino.ORDER_NONE) || '0';
  if (operator === null) {
    return ['pow(' + argument0 + ', ' + argument1 + ')', Blockly.Arduino.ORDER_ATOMIC];
  }
  return [argument0 + ' ' + operator + ' ' + argument1, Blockly.Arduino.ORDER_ATOMIC];
};
`

// Toolbox XML con categorías
const TOOLBOX_XML = `
<xml id="toolbox" style="display: none">
  <category name="🤖 Robot" colour="160">
    <block type="robot_move_forward"></block>
    <block type="robot_move_backward"></block>
    <block type="robot_turn_left"></block>
    <block type="robot_turn_right"></block>
    <block type="robot_stop"></block>
  </category>
  <category name="💡 LEDs" colour="60">
    <block type="led_on"></block>
    <block type="led_off"></block>
    <block type="led_blink"></block>
  </category>
  <category name="📡 Sensores" colour="210">
    <block type="sensor_ultrasonic"></block>
    <block type="sensor_ir"></block>
  </category>
  <category name="⚙️ Motores" colour="290">
    <block type="servo_move"></block>
    <block type="motor_dc"></block>
  </category>
  <category name="🔊 Sonido" colour="330">
    <block type="buzzer_tone"></block>
  </category>
  <category name="⏱️ Control" colour="120">
    <block type="delay_ms"></block>
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
    <block type="controls_whileUntil"></block>
    <block type="controls_if"></block>
  </category>
  <category name="📝 Texto" colour="180">
    <block type="serial_print"></block>
    <block type="text"></block>
  </category>
  <category name="🔢 Matemáticas" colour="230">
    <block type="math_number"></block>
    <block type="math_arithmetic"></block>
    <block type="logic_compare"></block>
    <block type="logic_boolean"></block>
  </category>
</xml>
`

interface BlocklyEditorProps {
  onCodeChange?: (code: string) => void
}

export default function BlocklyEditor({ onCodeChange }: BlocklyEditorProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<any>(null)
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [isBlocklyLoaded, setIsBlocklyLoaded] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'code' | 'simulator'>('simulator')

  useEffect(() => {
    // Cargar Blockly dinámicamente
    const loadBlockly = async () => {
      if (typeof window === 'undefined') return
      
      const Blockly = (await import('blockly')).default
      await import('blockly/blocks')
      
      // Registrar bloques personalizados
      eval(CUSTOM_BLOCKS)
      
      // Registrar generadores
      eval(ARDUINO_GENERATORS)
      
      if (blocklyDiv.current && !workspaceRef.current) {
        // Crear el toolbox desde XML
        const parser = new DOMParser()
        const toolboxDoc = parser.parseFromString(TOOLBOX_XML, 'text/xml')
        const toolbox = toolboxDoc.getElementById('toolbox')
        
        // Tema personalizado ChaskiBots
        const chaskiTheme = Blockly.Theme.defineTheme('chaski', {
          'base': Blockly.Themes.Classic,
          'componentStyles': {
            'workspaceBackgroundColour': '#1a1a2e',
            'toolboxBackgroundColour': '#16213e',
            'toolboxForegroundColour': '#fff',
            'flyoutBackgroundColour': '#1a1a2e',
            'flyoutForegroundColour': '#ccc',
            'flyoutOpacity': 0.9,
            'scrollbarColour': '#00f5d4',
            'insertionMarkerColour': '#00f5d4',
            'insertionMarkerOpacity': 0.3,
            'scrollbarOpacity': 0.4,
            'cursorColour': '#00f5d4',
          },
          'fontStyle': {
            'family': 'Inter, sans-serif',
            'weight': 'bold',
            'size': 12
          }
        })
        
        workspaceRef.current = Blockly.inject(blocklyDiv.current, {
          toolbox: toolbox,
          theme: chaskiTheme,
          grid: {
            spacing: 20,
            length: 3,
            colour: '#2a2a4a',
            snap: true
          },
          zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
          },
          trashcan: true,
          move: {
            scrollbars: true,
            drag: true,
            wheel: true
          }
        })
        
        // Listener para cambios
        workspaceRef.current.addChangeListener(() => {
          updateCode()
        })
        
        setIsBlocklyLoaded(true)
      }
    }
    
    loadBlockly()
    
    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose()
        workspaceRef.current = null
      }
    }
  }, [])

  const updateCode = () => {
    if (!workspaceRef.current) return
    
    try {
      const Blockly = (window as any).Blockly
      if (Blockly && Blockly.Arduino) {
        const code = Blockly.Arduino.workspaceToCode(workspaceRef.current)
        setGeneratedCode(code)
        onCodeChange?.(code)
      }
    } catch (e) {
      console.log('Error generating code:', e)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear()
      setGeneratedCode('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-dark-900 rounded-xl overflow-hidden border border-dark-600">
      {/* Header */}
      <div className="bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border-b border-dark-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neon-cyan/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ChaskiBlocks</h2>
              <p className="text-xs text-gray-400">Programación visual para robótica</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Blockly Workspace */}
        <div className="flex-1 relative">
          <div 
            ref={blocklyDiv} 
            className="absolute inset-0"
            style={{ minHeight: '500px' }}
          />
          {!isBlocklyLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan mx-auto mb-4"></div>
                <p className="text-gray-400">Cargando editor de bloques...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Tabs */}
        <div className="w-[450px] bg-dark-800 border-l border-dark-600 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-dark-600">
            <button
              onClick={() => setRightPanelTab('simulator')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                rightPanelTab === 'simulator'
                  ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Simulador
            </button>
            <button
              onClick={() => setRightPanelTab('code')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                rightPanelTab === 'code'
                  ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Código Arduino
            </button>
          </div>

          {/* Tab Content */}
          {rightPanelTab === 'simulator' ? (
            <div className="flex-1 overflow-auto">
              <RobotSimulator />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b border-dark-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-neon-green" />
                  <span className="text-sm font-medium text-white">Código Generado</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    copied 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                  }`}
                >
                  <Copy className="w-3 h-3" />
                  {copied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
              <div className="flex-1 overflow-auto p-3 bg-dark-900">
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                  {generatedCode || '// Arrastra bloques para generar código\n// El código Arduino aparecerá aquí\n\n// Ejemplo:\n// void setup() {\n//   Serial.begin(9600);\n// }\n// \n// void loop() {\n//   // Tu código aquí\n// }'}
                </pre>
              </div>
              
              {/* Tips */}
              <div className="p-3 border-t border-dark-600 bg-dark-900/50">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">
                      <span className="text-yellow-400 font-medium">Tip:</span> Copia este código y pégalo en Arduino IDE para programar tu robot real.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
