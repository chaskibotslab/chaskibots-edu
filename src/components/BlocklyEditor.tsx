'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Copy, RotateCcw, Save, Code, Bot, Cpu, Lightbulb, Gauge, Monitor, FileCode, FolderOpen, Loader2, Trash2, Globe, Lock, Maximize2, Minimize2, Box, Layers } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import RobotSimulator from './RobotSimulator'
import { useAuth } from '@/components/AuthProvider'

// Importar simulador 3D dinámicamente para evitar errores de SSR
const RobotSimulator3D = dynamic(() => import('./RobotSimulator3D'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-dark-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
        <p className="text-xs text-gray-400">Cargando simulador 3D...</p>
      </div>
    </div>
  )
})

interface BlocklyProject {
  id: string
  projectName: string
  projectData: string
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

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

// Nuevos bloques avanzados
Blockly.Blocks['robot_curve_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("↰ Curva izquierda")
        .appendField(new Blockly.FieldNumber(50, 0, 100), "RADIUS")
        .appendField("% radio");
    this.appendDummyInput()
        .appendField("por")
        .appendField(new Blockly.FieldNumber(1000, 0, 10000), "TIME")
        .appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Hace una curva hacia la izquierda");
  }
};

Blockly.Blocks['robot_curve_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("↱ Curva derecha")
        .appendField(new Blockly.FieldNumber(50, 0, 100), "RADIUS")
        .appendField("% radio");
    this.appendDummyInput()
        .appendField("por")
        .appendField(new Blockly.FieldNumber(1000, 0, 10000), "TIME")
        .appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Hace una curva hacia la derecha");
  }
};

Blockly.Blocks['robot_spin'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔄 Girar sobre sí mismo")
        .appendField(new Blockly.FieldDropdown([["izquierda","LEFT"], ["derecha","RIGHT"]]), "DIR");
    this.appendDummyInput()
        .appendField("por")
        .appendField(new Blockly.FieldNumber(1000, 0, 10000), "TIME")
        .appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Gira el robot sobre su propio eje");
  }
};

Blockly.Blocks['wait_until_distance'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⏳ Esperar hasta distancia")
        .appendField(new Blockly.FieldDropdown([["menor que","LT"], ["mayor que","GT"]]), "OP")
        .appendField(new Blockly.FieldNumber(20, 0, 400), "DIST")
        .appendField("cm");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Espera hasta que el sensor detecte la distancia indicada");
  }
};

Blockly.Blocks['if_obstacle'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🚧 Si hay obstáculo a menos de")
        .appendField(new Blockly.FieldNumber(20, 0, 400), "DIST")
        .appendField("cm");
    this.appendStatementInput("DO")
        .setCheck(null)
        .appendField("hacer");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Ejecuta acciones si detecta un obstáculo cercano");
  }
};

Blockly.Blocks['repeat_forever'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔁 Repetir siempre");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setColour(120);
    this.setTooltip("Repite las acciones indefinidamente");
  }
};

Blockly.Blocks['led_rgb'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌈 LED RGB color")
        .appendField(new Blockly.FieldDropdown([
          ["rojo","RED"], ["verde","GREEN"], ["azul","BLUE"],
          ["amarillo","YELLOW"], ["cian","CYAN"], ["magenta","MAGENTA"],
          ["blanco","WHITE"], ["apagado","OFF"]
        ]), "COLOR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Cambia el color del LED RGB");
  }
};

Blockly.Blocks['play_melody'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎵 Reproducir melodía")
        .appendField(new Blockly.FieldDropdown([
          ["victoria","VICTORY"], ["error","ERROR"], ["inicio","START"],
          ["beep","BEEP"], ["alarma","ALARM"]
        ]), "MELODY");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("Reproduce una melodía predefinida");
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
    <label text="Movimiento Básico"></label>
    <block type="robot_move_forward"></block>
    <block type="robot_move_backward"></block>
    <block type="robot_turn_left"></block>
    <block type="robot_turn_right"></block>
    <block type="robot_stop"></block>
    <label text="Movimiento Avanzado"></label>
    <block type="robot_curve_left"></block>
    <block type="robot_curve_right"></block>
    <block type="robot_spin"></block>
  </category>
  <category name="💡 LEDs" colour="60">
    <block type="led_on"></block>
    <block type="led_off"></block>
    <block type="led_blink"></block>
    <block type="led_rgb"></block>
  </category>
  <category name="📡 Sensores" colour="210">
    <block type="sensor_ultrasonic"></block>
    <block type="sensor_ir"></block>
    <block type="wait_until_distance"></block>
    <block type="if_obstacle"></block>
  </category>
  <category name="⚙️ Motores" colour="290">
    <block type="servo_move"></block>
    <block type="motor_dc"></block>
  </category>
  <category name="🔊 Sonido" colour="330">
    <block type="buzzer_tone"></block>
    <block type="play_melody"></block>
  </category>
  <category name="⏱️ Control" colour="120">
    <block type="delay_ms"></block>
    <block type="repeat_forever"></block>
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
  userId?: string
  userName?: string
}

// Tipo para comandos del simulador
interface SimulatorCommand {
  type: 'move_forward' | 'move_backward' | 'turn_left' | 'turn_right' | 'stop' | 
        'led_on' | 'led_off' | 'buzzer' | 'servo' | 'delay' | 'motor'
  params: any
  duration?: number
}

export default function BlocklyEditor({ onCodeChange, userId, userName }: BlocklyEditorProps) {
  const { user } = useAuth()
  const blocklyDiv = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<any>(null)
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [isBlocklyLoaded, setIsBlocklyLoaded] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'code' | 'simulator'>('simulator')
  
  // Estados para proyectos
  const [showProjectsModal, setShowProjectsModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [projects, setProjects] = useState<BlocklyProject[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [savingProject, setSavingProject] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [currentProjectName, setCurrentProjectName] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [isPublicProject, setIsPublicProject] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [simulatorMode, setSimulatorMode] = useState<'2d' | '3d'>('3d')
  
  // Función para extraer comandos de los bloques de Blockly
  const getBlocklyCommands = useCallback((): SimulatorCommand[] => {
    if (!workspaceRef.current) return []
    
    const Blockly = (window as any).Blockly
    if (!Blockly) return []
    
    const commands: SimulatorCommand[] = []
    const topBlocks = workspaceRef.current.getTopBlocks(true)
    
    const processBlock = (block: any) => {
      if (!block) return
      
      const blockType = block.type
      
      switch (blockType) {
        case 'robot_move_forward':
          commands.push({
            type: 'move_forward',
            params: { speed: block.getFieldValue('SPEED') || 100 },
            duration: block.getFieldValue('TIME') || 1000
          })
          break
        case 'robot_move_backward':
          commands.push({
            type: 'move_backward',
            params: { speed: block.getFieldValue('SPEED') || 100 },
            duration: block.getFieldValue('TIME') || 1000
          })
          break
        case 'robot_turn_left':
          const leftAngle = block.getFieldValue('ANGLE') || 90
          commands.push({
            type: 'turn_left',
            params: { angle: leftAngle },
            duration: Math.max(300, leftAngle * 8) // Duración proporcional al ángulo
          })
          break
        case 'robot_turn_right':
          const rightAngle = block.getFieldValue('ANGLE') || 90
          commands.push({
            type: 'turn_right',
            params: { angle: rightAngle },
            duration: Math.max(300, rightAngle * 8) // Duración proporcional al ángulo
          })
          break
        case 'robot_stop':
          commands.push({
            type: 'stop',
            params: {},
            duration: 100
          })
          break
        case 'led_on':
          commands.push({
            type: 'led_on',
            params: { pin: block.getFieldValue('PIN') || 13 },
            duration: 100
          })
          break
        case 'led_off':
          commands.push({
            type: 'led_off',
            params: { pin: block.getFieldValue('PIN') || 13 },
            duration: 100
          })
          break
        case 'delay_ms':
          commands.push({
            type: 'delay',
            params: {},
            duration: block.getFieldValue('MS') || 1000
          })
          break
        case 'servo_move':
          commands.push({
            type: 'servo',
            params: { angle: block.getFieldValue('ANGLE') || 90 },
            duration: 500
          })
          break
        case 'buzzer_tone':
          commands.push({
            type: 'buzzer',
            params: { 
              frequency: block.getFieldValue('FREQ') || 440,
              pin: block.getFieldValue('PIN') || 8
            },
            duration: block.getFieldValue('DURATION') || 500
          })
          break
        case 'robot_curve_left':
          commands.push({
            type: 'move_forward',
            params: { speed: block.getFieldValue('RADIUS') || 50, curve: 'left' },
            duration: block.getFieldValue('TIME') || 1000
          })
          break
        case 'robot_curve_right':
          commands.push({
            type: 'move_forward',
            params: { speed: block.getFieldValue('RADIUS') || 50, curve: 'right' },
            duration: block.getFieldValue('TIME') || 1000
          })
          break
        case 'robot_spin':
          const spinDir = block.getFieldValue('DIR') || 'LEFT'
          commands.push({
            type: spinDir === 'LEFT' ? 'turn_left' : 'turn_right',
            params: { angle: 360 },
            duration: block.getFieldValue('TIME') || 1000
          })
          break
        case 'play_melody':
          commands.push({
            type: 'buzzer',
            params: { melody: block.getFieldValue('MELODY') || 'BEEP' },
            duration: 1000
          })
          break
        case 'led_rgb':
          commands.push({
            type: 'led_on',
            params: { pin: 13, color: block.getFieldValue('COLOR') || 'WHITE' },
            duration: 100
          })
          break
      }
      
      // Procesar el siguiente bloque conectado
      const nextBlock = block.getNextBlock()
      if (nextBlock) {
        processBlock(nextBlock)
      }
    }
    
    // Procesar todos los bloques superiores
    topBlocks.forEach((block: any) => {
      processBlock(block)
    })
    
    return commands
  }, [])

  useEffect(() => {
    // Cargar Blockly dinámicamente
    const loadBlockly = async () => {
      if (typeof window === 'undefined') return
      
      const BlocklyModule = await import('blockly')
      await import('blockly/blocks')
      
      // Asignar Blockly a window para que eval pueda acceder
      const Blockly = BlocklyModule.default || BlocklyModule
      ;(window as any).Blockly = Blockly
      
      // Crear generador Arduino
      const BlocklyAny = Blockly as any
      
      // Crear objeto generador manualmente (compatible con todas las versiones de Blockly)
      const ArduinoGenerator: any = {
        name_: 'Arduino',
        FUNCTION_NAME_PLACEHOLDER_: '%{BKY_FUNCTION_NAME}%',
        FUNCTION_NAME_PLACEHOLDER_REGEXP_: /%\{BKY_FUNCTION_NAME\}%/g,
      }
      
      // Configurar propiedades del generador
      ArduinoGenerator.ORDER_ATOMIC = 0
      ArduinoGenerator.ORDER_NONE = 99
      ArduinoGenerator.definitions_ = Object.create(null)
      ArduinoGenerator.setups_ = Object.create(null)
      ArduinoGenerator.forBlock = ArduinoGenerator.forBlock || {}
      
      ArduinoGenerator.init = function() {
        this.definitions_ = Object.create(null)
        this.setups_ = Object.create(null)
      }
      
      ArduinoGenerator.finish = function(code: string) {
        const defs = Object.values(this.definitions_ || {}).join('\n')
        const setups = Object.values(this.setups_ || {}).join('\n')
        return defs + '\n\nvoid setup() {\n  Serial.begin(9600);\n' + setups + '\n}\n\nvoid loop() {\n' + code + '}\n'
      }
      
      ArduinoGenerator.scrubNakedValue = function(line: string) { return line + ';\n' }
      ArduinoGenerator.scrub_ = function(block: any, code: string) {
        const nextBlock = block.nextConnection && block.nextConnection.targetBlock()
        const nextCode = nextBlock ? this.blockToCode(nextBlock) : ''
        return code + nextCode
      }
      
      // Función para generar código de un bloque
      ArduinoGenerator.blockToCode = function(block: any, opt_thisOnly?: boolean) {
        if (!block) return ''
        if (block.isEnabled && !block.isEnabled()) return ''
        
        const func = this.forBlock[block.type] || this[block.type]
        if (!func) {
          console.warn('No generator for block type: ' + block.type)
          return ''
        }
        
        let code = func.call(this, block)
        if (Array.isArray(code)) {
          return code // Es una expresión con orden
        }
        
        if (opt_thisOnly) return code || ''
        
        // Procesar siguiente bloque
        const nextBlock = block.nextConnection && block.nextConnection.targetBlock()
        const nextCode = nextBlock ? this.blockToCode(nextBlock) : ''
        return (code || '') + nextCode
      }
      
      // Función para obtener código de un valor
      ArduinoGenerator.valueToCode = function(block: any, name: string, outerOrder: number) {
        const targetBlock = block.getInputTargetBlock(name)
        if (!targetBlock) return ''
        
        const tuple = this.blockToCode(targetBlock)
        if (!tuple) return ''
        
        if (Array.isArray(tuple)) {
          return tuple[0] // Retornar solo el código, ignorar orden por ahora
        }
        return tuple
      }
      
      // Función para obtener código de statements
      ArduinoGenerator.statementToCode = function(block: any, name: string) {
        const targetBlock = block.getInputTargetBlock(name)
        if (!targetBlock) return ''
        return this.blockToCode(targetBlock)
      }
      
      // Función principal para convertir workspace a código
      ArduinoGenerator.workspaceToCode = function(workspace: any) {
        if (!workspace) return ''
        
        this.init()
        
        const blocks = workspace.getTopBlocks(true)
        let code = ''
        
        for (const block of blocks) {
          const blockCode = this.blockToCode(block)
          if (blockCode) {
            code += blockCode
          }
        }
        
        return this.finish(code)
      }
      
      // Asignar a Blockly
      BlocklyAny.Arduino = ArduinoGenerator
      
      // Registrar bloques personalizados
      eval(CUSTOM_BLOCKS)
      
      // Registrar generadores usando forBlock (Blockly v10+) y el método antiguo
      const registerGenerator = (blockType: string, generatorFn: any) => {
        BlocklyAny.Arduino[blockType] = generatorFn
        if (BlocklyAny.Arduino.forBlock) {
          BlocklyAny.Arduino.forBlock[blockType] = generatorFn
        }
      }
      
      // Registrar todos los generadores manualmente
      registerGenerator('robot_move_forward', function(block: any) {
        const speed = block.getFieldValue('SPEED'), time = block.getFieldValue('TIME')
        BlocklyAny.Arduino.definitions_['motor_pins'] = '// Pines de motores\nint motorA1 = 5;\nint motorA2 = 6;\nint motorB1 = 9;\nint motorB2 = 10;'
        BlocklyAny.Arduino.setups_['motor_setup'] = '  pinMode(motorA1, OUTPUT);\n  pinMode(motorA2, OUTPUT);\n  pinMode(motorB1, OUTPUT);\n  pinMode(motorB2, OUTPUT);'
        return '  analogWrite(motorA1, ' + speed + ');\n  analogWrite(motorA2, 0);\n  analogWrite(motorB1, ' + speed + ');\n  analogWrite(motorB2, 0);\n  delay(' + time + ');\n'
      })
      registerGenerator('robot_move_backward', function(block: any) {
        const speed = block.getFieldValue('SPEED'), time = block.getFieldValue('TIME')
        BlocklyAny.Arduino.definitions_['motor_pins'] = '// Pines de motores\nint motorA1 = 5;\nint motorA2 = 6;\nint motorB1 = 9;\nint motorB2 = 10;'
        return '  analogWrite(motorA1, 0);\n  analogWrite(motorA2, ' + speed + ');\n  analogWrite(motorB1, 0);\n  analogWrite(motorB2, ' + speed + ');\n  delay(' + time + ');\n'
      })
      registerGenerator('robot_turn_left', function(block: any) {
        const angle = block.getFieldValue('ANGLE'), time = Math.round(angle * 5)
        return '  analogWrite(motorA1, 0);\n  analogWrite(motorA2, 150);\n  analogWrite(motorB1, 150);\n  analogWrite(motorB2, 0);\n  delay(' + time + ');\n'
      })
      registerGenerator('robot_turn_right', function(block: any) {
        const angle = block.getFieldValue('ANGLE'), time = Math.round(angle * 5)
        return '  analogWrite(motorA1, 150);\n  analogWrite(motorA2, 0);\n  analogWrite(motorB1, 0);\n  analogWrite(motorB2, 150);\n  delay(' + time + ');\n'
      })
      registerGenerator('robot_stop', function() {
        return '  analogWrite(motorA1, 0);\n  analogWrite(motorA2, 0);\n  analogWrite(motorB1, 0);\n  analogWrite(motorB2, 0);\n'
      })
      registerGenerator('led_on', function(block: any) {
        const pin = block.getFieldValue('PIN')
        BlocklyAny.Arduino.setups_['led_' + pin] = '  pinMode(' + pin + ', OUTPUT);'
        return '  digitalWrite(' + pin + ', HIGH);\n'
      })
      registerGenerator('led_off', function(block: any) {
        const pin = block.getFieldValue('PIN')
        BlocklyAny.Arduino.setups_['led_' + pin] = '  pinMode(' + pin + ', OUTPUT);'
        return '  digitalWrite(' + pin + ', LOW);\n'
      })
      registerGenerator('led_blink', function(block: any) {
        const pin = block.getFieldValue('PIN'), delayMs = block.getFieldValue('DELAY')
        BlocklyAny.Arduino.setups_['led_' + pin] = '  pinMode(' + pin + ', OUTPUT);'
        return '  digitalWrite(' + pin + ', HIGH);\n  delay(' + delayMs + ');\n  digitalWrite(' + pin + ', LOW);\n  delay(' + delayMs + ');\n'
      })
      registerGenerator('sensor_ultrasonic', function(block: any) {
        const trig = block.getFieldValue('TRIG'), echo = block.getFieldValue('ECHO')
        BlocklyAny.Arduino.definitions_['ultrasonic_func'] = 'long readUltrasonic(int trigPin, int echoPin) {\n  digitalWrite(trigPin, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trigPin, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trigPin, LOW);\n  long duration = pulseIn(echoPin, HIGH);\n  return duration * 0.034 / 2;\n}'
        BlocklyAny.Arduino.setups_['ultrasonic_' + trig] = '  pinMode(' + trig + ', OUTPUT);\n  pinMode(' + echo + ', INPUT);'
        return ['readUltrasonic(' + trig + ', ' + echo + ')', BlocklyAny.Arduino.ORDER_ATOMIC]
      })
      registerGenerator('sensor_ir', function(block: any) {
        const pin = block.getFieldValue('PIN')
        BlocklyAny.Arduino.setups_['ir_' + pin] = '  pinMode(' + pin + ', INPUT);'
        return ['digitalRead(' + pin + ') == LOW', BlocklyAny.Arduino.ORDER_ATOMIC]
      })
      registerGenerator('servo_move', function(block: any) {
        const pin = block.getFieldValue('PIN'), angle = block.getFieldValue('ANGLE')
        BlocklyAny.Arduino.definitions_['servo_lib'] = '#include <Servo.h>\nServo servo_' + pin + ';'
        BlocklyAny.Arduino.setups_['servo_' + pin] = '  servo_' + pin + '.attach(' + pin + ');'
        return '  servo_' + pin + '.write(' + angle + ');\n  delay(500);\n'
      })
      registerGenerator('motor_dc', function(block: any) {
        const motor = block.getFieldValue('MOTOR'), speed = block.getFieldValue('SPEED'), dir = block.getFieldValue('DIR')
        const pin1 = motor === 'A' ? 'motorA1' : 'motorB1', pin2 = motor === 'A' ? 'motorA2' : 'motorB2'
        BlocklyAny.Arduino.definitions_['motor_pins'] = '// Pines de motores\nint motorA1 = 5;\nint motorA2 = 6;\nint motorB1 = 9;\nint motorB2 = 10;'
        return dir === 'FWD' ? '  analogWrite(' + pin1 + ', ' + speed + ');\n  analogWrite(' + pin2 + ', 0);\n' : '  analogWrite(' + pin1 + ', 0);\n  analogWrite(' + pin2 + ', ' + speed + ');\n'
      })
      registerGenerator('delay_ms', function(block: any) { return '  delay(' + block.getFieldValue('MS') + ');\n' })
      registerGenerator('buzzer_tone', function(block: any) {
        const pin = block.getFieldValue('PIN'), freq = block.getFieldValue('FREQ'), duration = block.getFieldValue('DURATION')
        BlocklyAny.Arduino.setups_['buzzer_' + pin] = '  pinMode(' + pin + ', OUTPUT);'
        return '  tone(' + pin + ', ' + freq + ', ' + duration + ');\n  delay(' + duration + ');\n'
      })
      registerGenerator('math_number', function(block: any) { return [parseFloat(block.getFieldValue('NUM')), BlocklyAny.Arduino.ORDER_ATOMIC] })
      registerGenerator('text', function(block: any) { return ['"' + block.getFieldValue('TEXT') + '"', BlocklyAny.Arduino.ORDER_ATOMIC] })
      registerGenerator('logic_boolean', function(block: any) { return [block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false', BlocklyAny.Arduino.ORDER_ATOMIC] })
      registerGenerator('serial_print', function(block: any) {
        const text = BlocklyAny.Arduino.valueToCode ? BlocklyAny.Arduino.valueToCode(block, 'TEXT', BlocklyAny.Arduino.ORDER_NONE) || '""' : '""'
        return '  Serial.println(' + text + ');\n'
      })
      
      if (blocklyDiv.current && !workspaceRef.current) {
        // Crear el toolbox desde XML
        const parser = new DOMParser()
        const toolboxDoc = parser.parseFromString(TOOLBOX_XML, 'text/xml')
        const toolbox = toolboxDoc.getElementById('toolbox')
        
        // Tema personalizado ChaskiBots
        const chaskiTheme = Blockly.Theme.defineTheme('chaski', {
          'name': 'chaski',
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
        } as any)
        
        workspaceRef.current = Blockly.inject(blocklyDiv.current, {
          toolbox: toolbox || undefined,
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

  // Redimensionar Blockly cuando cambie fullscreen
  useEffect(() => {
    if (workspaceRef.current) {
      const Blockly = (window as any).Blockly
      if (Blockly) {
        setTimeout(() => {
          Blockly.svgResize(workspaceRef.current)
        }, 100)
      }
    }
  }, [isFullscreen])

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
      setCurrentProjectId(null)
      setCurrentProjectName('')
    }
  }

  // Obtener XML del workspace actual
  const getWorkspaceXml = (): string => {
    if (!workspaceRef.current) return ''
    const Blockly = (window as any).Blockly
    if (!Blockly) return ''
    const xml = Blockly.Xml.workspaceToDom(workspaceRef.current)
    return Blockly.Xml.domToText(xml)
  }

  // Cargar XML al workspace
  const loadWorkspaceXml = (xmlText: string) => {
    if (!workspaceRef.current || !xmlText) return
    const Blockly = (window as any).Blockly
    if (!Blockly) return
    workspaceRef.current.clear()
    const xml = Blockly.utils.xml.textToDom(xmlText)
    Blockly.Xml.domToWorkspace(xml, workspaceRef.current)
  }

  // Cargar proyectos del usuario
  const loadProjects = async () => {
    if (!userId) return
    setLoadingProjects(true)
    try {
      const res = await fetch(`/api/blockly-projects?userId=${userId}`)
      const data = await res.json()
      if (data.projects) {
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    }
    setLoadingProjects(false)
  }

  // Guardar proyecto
  const handleSaveProject = async () => {
    if (!userId) {
      alert('Debes iniciar sesión para guardar proyectos')
      return
    }
    
    const projectData = getWorkspaceXml()
    if (!projectData || projectData === '<xml xmlns="https://developers.google.com/blockly/xml"></xml>') {
      alert('No hay bloques para guardar')
      return
    }

    setSavingProject(true)
    try {
      if (currentProjectId) {
        // Actualizar proyecto existente
        const res = await fetch('/api/blockly-projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: currentProjectId,
            projectName: currentProjectName || newProjectName,
            projectData,
            isPublic: isPublicProject
          })
        })
        if (res.ok) {
          alert('¡Proyecto guardado!')
          setShowSaveModal(false)
        }
      } else {
        // Crear nuevo proyecto
        if (!newProjectName.trim()) {
          alert('Escribe un nombre para el proyecto')
          setSavingProject(false)
          return
        }
        const res = await fetch('/api/blockly-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userName: userName || 'Anónimo',
            projectName: newProjectName,
            projectData,
            isPublic: isPublicProject
          })
        })
        const data = await res.json()
        if (res.ok && data.project) {
          setCurrentProjectId(data.project.id)
          setCurrentProjectName(newProjectName)
          alert('¡Proyecto creado!')
          setShowSaveModal(false)
          setNewProjectName('')
        }
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Error al guardar')
    }
    setSavingProject(false)
  }

  // Cargar un proyecto
  const handleLoadProject = (project: BlocklyProject) => {
    loadWorkspaceXml(project.projectData)
    setCurrentProjectId(project.id)
    setCurrentProjectName(project.projectName)
    setShowProjectsModal(false)
    updateCode()
  }

  // Eliminar proyecto
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Eliminar este proyecto?')) return
    try {
      const res = await fetch(`/api/blockly-projects?projectId=${projectId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
        if (currentProjectId === projectId) {
          setCurrentProjectId(null)
          setCurrentProjectName('')
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  return (
    <div className={`flex flex-col bg-dark-900 overflow-hidden border border-dark-600 ${
      isFullscreen 
        ? 'fixed inset-0 z-50 rounded-none' 
        : 'h-full rounded-xl'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border-b border-dark-600 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/chaski.png" 
              alt="ChaskiBots" 
              width={40} 
              height={40}
              className="rounded-xl"
            />
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ChaskiBlocks
                {currentProjectName && (
                  <span className="text-sm font-normal text-neon-purple">
                    — {currentProjectName}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">Programación visual para robótica</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userId && (
              <>
                <button
                  onClick={() => {
                    loadProjects()
                    setShowProjectsModal(true)
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Mis Proyectos</span>
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-lg text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Guardar</span>
                </button>
              </>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-2 px-3 py-2 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple rounded-lg text-sm transition-colors"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: isFullscreen ? 'calc(100vh - 70px)' : '700px' }}>
        {/* Blockly Workspace */}
        <div className="flex-1 relative min-h-full" style={{ minWidth: '50%' }}>
          {/* Logo de fondo del workspace */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <Image 
              src="/chaski.png" 
              alt="ChaskiBots" 
              width={300} 
              height={300}
              className="opacity-[0.03]"
            />
          </div>
          <div 
            ref={blocklyDiv} 
            className="absolute inset-0 w-full h-full z-10"
          />
          {!isBlocklyLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-800 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-cyan/5 via-dark-800 to-dark-900">
              <div className="text-center">
                <Image 
                  src="/chaski.png" 
                  alt="ChaskiBots" 
                  width={80} 
                  height={80}
                  className="mx-auto mb-4 opacity-50 animate-pulse"
                />
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan mx-auto mb-4"></div>
                <p className="text-gray-400">Cargando editor de bloques...</p>
                <p className="text-xs text-gray-500 mt-2">ChaskiBlocks v1.0</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Tabs */}
        <div className={`bg-dark-800 border-l border-dark-600 flex flex-col ${
          isFullscreen ? 'w-[550px]' : 'w-[450px]'
        }`} style={{ minWidth: isFullscreen ? '550px' : '450px' }}>
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
            <div className="flex-1 overflow-auto flex flex-col">
              {/* Toggle 2D/3D */}
              <div className="p-2 border-b border-dark-600 flex items-center justify-center gap-2">
                <button
                  onClick={() => setSimulatorMode('2d')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    simulatorMode === '2d'
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  2D
                </button>
                <button
                  onClick={() => setSimulatorMode('3d')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    simulatorMode === '3d'
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  3D
                </button>
              </div>
              {/* Simulador - Mantener ambos montados para evitar problemas de renderizado */}
              <div className="flex-1 relative" style={{ minHeight: '500px' }}>
                <div className={`absolute inset-0 ${simulatorMode === '2d' ? 'block' : 'hidden'}`}>
                  <RobotSimulator />
                </div>
                <div className={`absolute inset-0 ${simulatorMode === '3d' ? 'block' : 'hidden'}`}>
                  <RobotSimulator3D 
                    onRequestCommands={getBlocklyCommands}
                    studentName={user?.name || userName || ''}
                    studentEmail={user?.email || ''}
                    courseId={user?.courseId || ''}
                    schoolId={user?.schoolId || ''}
                  />
                </div>
              </div>
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

      {/* Modal: Mis Proyectos */}
      {showProjectsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-600 w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-dark-600 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-neon-cyan" />
                Mis Proyectos
              </h3>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingProjects ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No tienes proyectos guardados</p>
                  <p className="text-xs text-gray-500 mt-1">Crea bloques y guárdalos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className="bg-dark-700 rounded-xl p-3 hover:bg-dark-600 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleLoadProject(project)}
                        >
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{project.projectName}</h4>
                            {project.isPublic ? (
                              <Globe className="w-3 h-3 text-green-400" />
                            ) : (
                              <Lock className="w-3 h-3 text-gray-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(project.updatedAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Guardar Proyecto */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-600 w-full max-w-md">
            <div className="p-4 border-b border-dark-600 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-neon-cyan" />
                {currentProjectId ? 'Guardar Cambios' : 'Nuevo Proyecto'}
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre del proyecto</label>
                <input
                  type="text"
                  value={currentProjectId ? currentProjectName : newProjectName}
                  onChange={(e) => currentProjectId 
                    ? setCurrentProjectName(e.target.value) 
                    : setNewProjectName(e.target.value)
                  }
                  placeholder="Mi Robot Increíble"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder:text-gray-500 focus:border-neon-cyan focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPublicProject(!isPublicProject)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    isPublicProject 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                      : 'bg-dark-700 text-gray-400 border border-dark-600'
                  }`}
                >
                  {isPublicProject ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {isPublicProject ? 'Público' : 'Privado'}
                </button>
                <span className="text-xs text-gray-500">
                  {isPublicProject ? 'Otros pueden ver tu proyecto' : 'Solo tú puedes verlo'}
                </span>
              </div>
            </div>
            <div className="p-4 border-t border-dark-600 flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProject}
                disabled={savingProject}
                className="flex-1 px-4 py-3 bg-neon-cyan hover:bg-neon-cyan/80 text-dark-900 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                {savingProject ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
