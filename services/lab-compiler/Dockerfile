# Compilador del Laboratorio de Robótica: arduino-cli + core AVR + librerías en lista blanca.
# Se despliega como servicio aparte en Railway (Root Directory: services/lab-compiler).
FROM node:22-bookworm-slim

ARG ARDUINO_CLI_VERSION=1.1.1
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
 && curl -fsSL "https://github.com/arduino/arduino-cli/releases/download/v${ARDUINO_CLI_VERSION}/arduino-cli_${ARDUINO_CLI_VERSION}_Linux_64bit.tar.gz" \
    | tar -xz -C /usr/local/bin arduino-cli \
 && apt-get purge -y curl && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Usuario sin privilegios: todo (cores, librerías, compilación) vive en su HOME.
RUN useradd --create-home --uid 10001 lab
USER lab
WORKDIR /home/lab/app
ENV ARDUINO_DIRECTORIES_DATA=/home/lab/.arduino15 \
    ARDUINO_DIRECTORIES_USER=/home/lab/Arduino

RUN arduino-cli core update-index \
 && arduino-cli core install arduino:avr@1.8.6 \
 && arduino-cli lib install Servo@1.3.0 NewPing@1.9.7 "DHT sensor library@1.4.7" \
    "Adafruit Unified Sensor@1.1.15" "Adafruit GFX Library@1.13.0" "Adafruit SSD1306@2.5.17" "Adafruit BusIO@1.17.4" \
 && rm -rf /home/lab/.arduino15/staging

COPY --chown=lab server.js .

# Desde aquí arduino-cli no puede salir a internet: todo lo que necesita ya está instalado.
ENV HTTP_PROXY=http://127.0.0.1:9 HTTPS_PROXY=http://127.0.0.1:9 \
    ARDUINO_NETWORK_PROXY=http://127.0.0.1:9 \
    ARDUINO_UPDATER_ENABLE_NOTIFICATION=false \
    NODE_ENV=production

EXPOSE 8080
CMD ["node", "server.js"]
