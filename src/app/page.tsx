'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { Bot, Brain, Shield, Rocket, Users, Award, Play, ArrowRight, Zap, Cpu, Code } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Futurista */}
        <section className="relative overflow-hidden hero-gradient py-24 px-4">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-cyber-grid opacity-30"></div>
          {/* Glow Effects */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px]"></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-dark-700/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-neon-cyan/30">
                  <span className="animate-pulse w-2 h-2 bg-neon-green rounded-full"></span>
                  <span className="text-sm text-gray-300">Plataforma Educativa Activa</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
                  Aprende{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-blue">Robótica</span>,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">IA</span> y{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-400">Hacking Ético</span>
                </h1>
                <p className="text-lg text-gray-400 mb-8 max-w-lg">
                  Plataforma educativa completa desde Inicial hasta Bachillerato. 
                  Videos, tutoriales, simuladores y proyectos prácticos con kits reales.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/niveles" className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 font-bold rounded-xl hover:shadow-neon-cyan transition-all duration-300 flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Comenzar Ahora
                  </Link>
                  <Link href="/login" className="px-8 py-4 bg-dark-700 border border-neon-cyan/30 text-neon-cyan font-semibold rounded-xl hover:bg-dark-600 hover:border-neon-cyan/60 transition-all duration-300">
                    Iniciar Sesión
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/30 to-neon-purple/30 rounded-3xl blur-3xl animate-pulse"></div>
                  <div className="relative bg-dark-800/80 backdrop-blur-md rounded-3xl p-8 border border-neon-cyan/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-dark-700/50 rounded-2xl p-5 text-center border border-neon-cyan/10 hover:border-neon-cyan/40 transition-all group">
                        <Bot className="w-12 h-12 mx-auto mb-3 text-neon-cyan group-hover:animate-float" />
                        <p className="font-semibold text-white">Robótica</p>
                        <p className="text-xs text-gray-500 mt-1">14 Kits</p>
                      </div>
                      <div className="bg-dark-700/50 rounded-2xl p-5 text-center border border-neon-purple/10 hover:border-neon-purple/40 transition-all group">
                        <Brain className="w-12 h-12 mx-auto mb-3 text-neon-purple group-hover:animate-float" />
                        <p className="font-semibold text-white">IA</p>
                        <p className="text-xs text-gray-500 mt-1">6 Modelos</p>
                      </div>
                      <div className="bg-dark-700/50 rounded-2xl p-5 text-center border border-neon-green/10 hover:border-neon-green/40 transition-all group">
                        <Shield className="w-12 h-12 mx-auto mb-3 text-neon-green group-hover:animate-float" />
                        <p className="font-semibold text-white">Hacking</p>
                        <p className="text-xs text-gray-500 mt-1">Desde 8° EGB</p>
                      </div>
                      <div className="bg-dark-700/50 rounded-2xl p-5 text-center border border-neon-orange/10 hover:border-neon-orange/40 transition-all group">
                        <Zap className="w-12 h-12 mx-auto mb-3 text-neon-orange group-hover:animate-float" />
                        <p className="font-semibold text-white">Simuladores</p>
                        <p className="text-xs text-gray-500 mt-1">5 Plataformas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-dark-800 border-y border-dark-600">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-3xl md:text-4xl font-bold text-neon-cyan group-hover:text-glow-cyan transition-all">14</div>
                <p className="text-gray-400">Niveles Educativos</p>
              </div>
              <div className="group">
                <div className="text-3xl md:text-4xl font-bold text-neon-purple group-hover:text-glow-purple transition-all">3</div>
                <p className="text-gray-400">Áreas de Estudio</p>
              </div>
              <div className="group">
                <div className="text-3xl md:text-4xl font-bold text-neon-green">14</div>
                <p className="text-gray-400">Kits de Robótica</p>
              </div>
              <div className="group">
                <div className="text-3xl md:text-4xl font-bold text-neon-orange">5</div>
                <p className="text-gray-400">Simuladores</p>
              </div>
            </div>
          </div>
        </section>

        {/* Subject Areas - Futurista */}
        <section className="py-20 px-4 bg-dark-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-4">
              Áreas de <span className="text-neon-cyan">Aprendizaje</span>
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
              Contenido especializado y progresivo para cada área, adaptado a la edad y nivel de cada estudiante.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Robótica */}
              <Link href="/robotica" className="card group hover:border-neon-cyan/50">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-neon-cyan transition-all">
                  <Bot className="w-8 h-8 text-neon-cyan" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Robótica</h3>
                <p className="text-gray-400 mb-4">Programación, diseño y electrónica con kits reales para cada nivel.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge badge-cyan">Arduino</span>
                  <span className="badge badge-cyan">ESP32</span>
                  <span className="badge badge-cyan">Sensores</span>
                </div>
                <div className="flex items-center text-neon-cyan font-semibold group-hover:gap-2 transition-all">
                  Explorar <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>

              {/* IA */}
              <Link href="/ia" className="card group hover:border-neon-purple/50">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-neon-purple transition-all">
                  <Brain className="w-8 h-8 text-neon-purple" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Inteligencia Artificial</h3>
                <p className="text-gray-400 mb-4">Reconocimiento de imágenes, voz y machine learning en el navegador.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge badge-purple">COCO-SSD</span>
                  <span className="badge badge-purple">MobileNet</span>
                  <span className="badge badge-purple">PoseNet</span>
                </div>
                <div className="flex items-center text-neon-purple font-semibold group-hover:gap-2 transition-all">
                  Explorar <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>

              {/* Hacking */}
              <Link href="/hacking" className="card group hover:border-neon-green/50 relative overflow-hidden">
                <div className="absolute top-3 right-3 px-2 py-1 bg-neon-orange/20 border border-neon-orange/40 rounded text-xs text-neon-orange">
                  Desde 8° EGB
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-neon-green transition-all">
                  <Shield className="w-8 h-8 text-neon-green" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Hacking Ético</h3>
                <p className="text-gray-400 mb-4">Seguridad informática y ciberseguridad de forma responsable.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge badge-green">Pentesting</span>
                  <span className="badge badge-green">Redes</span>
                  <span className="badge badge-green">Crypto</span>
                </div>
                <div className="flex items-center text-neon-green font-semibold group-hover:gap-2 transition-all">
                  Explorar <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Education Levels Preview - Futurista */}
        <section className="py-20 px-4 bg-dark-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-4">
              Niveles <span className="text-neon-purple">Educativos</span>
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
              Desde Inicial 2 hasta 3° de Bachillerato. Contenido y kits adaptados para cada edad.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {EDUCATION_LEVELS.map((level) => (
                <Link
                  key={level.id}
                  href={`/nivel/${level.id}`}
                  className="group relative bg-dark-700/50 border border-dark-600 hover:border-neon-cyan/50 rounded-xl p-4 text-center transition-all duration-300 hover:shadow-neon-cyan/20"
                  style={{ borderColor: `${level.neonColor}20` }}
                >
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(circle at center, ${level.neonColor}10 0%, transparent 70%)` }}
                  />
                  <div className="relative">
                    <div className="text-2xl mb-2">{level.icon}</div>
                    <h3 className="font-bold text-white text-sm">{level.name}</h3>
                    <p className="text-[10px] text-gray-500">{level.ageRange}</p>
                    <p className="text-[10px] mt-1 font-semibold" style={{ color: level.neonColor }}>${level.kitPrice}</p>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link href="/niveles" className="px-8 py-3 bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold rounded-xl hover:shadow-neon-purple transition-all duration-300 inline-flex items-center gap-2">
                Ver todos los niveles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features - Futurista */}
        <section className="py-20 px-4 bg-dark-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              ¿Por qué <span className="text-neon-cyan">ChaskiBots</span> EDU?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="w-16 h-16 bg-neon-cyan/10 border border-neon-cyan/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-neon-cyan" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">Aprendizaje Progresivo</h3>
                <p className="text-gray-400">
                  Contenido adaptado a cada nivel educativo, desde los 4 años hasta bachillerato.
                </p>
              </div>
              <div className="card text-center">
                <div className="w-16 h-16 bg-neon-purple/10 border border-neon-purple/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-neon-purple" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">Kits Reales</h3>
                <p className="text-gray-400">
                  Aprende con kits físicos de robótica diseñados para cada nivel educativo.
                </p>
              </div>
              <div className="card text-center">
                <div className="w-16 h-16 bg-neon-green/10 border border-neon-green/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-neon-green" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">Simuladores Online</h3>
                <p className="text-gray-400">
                  Practica con Wokwi, Tinkercad, Scratch y más simuladores integrados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Futurista */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-purple/10 to-neon-pink/10"></div>
          <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para comenzar tu viaje en <span className="text-neon-cyan">tecnología</span>?
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Únete a ChaskiBots EDU y descubre el fascinante mundo de la robótica, 
              inteligencia artificial y ciberseguridad.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/niveles" className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 font-bold rounded-xl hover:shadow-neon-cyan transition-all duration-300">
                Explorar Niveles
              </Link>
              <Link href="/login" className="px-8 py-4 border-2 border-neon-cyan/50 text-neon-cyan font-bold rounded-xl hover:bg-neon-cyan/10 transition-all duration-300">
                Crear Cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
