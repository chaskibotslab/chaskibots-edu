'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { ArrowRight, Sparkles, Rocket, Brain, Bot } from 'lucide-react'

export default function NivelesPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-dark-900 overflow-x-hidden">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section con Parallax y Logo */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background con efecto zoom */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-dark-900 via-blue-900/50 to-purple-900/50"
            style={{ transform: `scale(${1 + scrollY * 0.0003})` }}
          >
            <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>
          </div>
          
          {/* Efectos de luz animados */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-cyan/20 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-blue/10 rounded-full blur-[180px] animate-parallax"></div>
          
          {/* Contenido */}
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            {/* Logo animado */}
            <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/40 via-neon-purple/40 to-neon-pink/40 rounded-full blur-2xl animate-pulse scale-125"></div>
                <Image 
                  src="/chaski.png" 
                  alt="ChaskiBots Logo" 
                  width={150} 
                  height={150}
                  className="relative rounded-3xl shadow-2xl animate-float"
                  priority
                />
              </div>
            </div>
            
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="text-white">Niveles </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink animate-gradient">Educativos</span>
            </h1>
            
            <p className={`text-xl text-gray-300 max-w-2xl mx-auto mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Selecciona tu nivel y accede a contenido exclusivo de 
              <span className="text-neon-cyan font-semibold"> Robótica</span>, 
              <span className="text-neon-purple font-semibold"> IA</span> y 
              <span className="text-neon-green font-semibold"> Hacking Ético</span>
            </p>

            {/* Badges animados */}
            <div className={`flex flex-wrap justify-center gap-4 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="glass-dark px-4 py-2 rounded-full flex items-center gap-2">
                <Bot className="w-5 h-5 text-neon-cyan" />
                <span className="text-white text-sm">14 Kits de Robótica</span>
              </div>
              <div className="glass-dark px-4 py-2 rounded-full flex items-center gap-2">
                <Brain className="w-5 h-5 text-neon-purple" />
                <span className="text-white text-sm">IA en el Navegador</span>
              </div>
              <div className="glass-dark px-4 py-2 rounded-full flex items-center gap-2">
                <Rocket className="w-5 h-5 text-neon-green" />
                <span className="text-white text-sm">+30 Simuladores</span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-neon-cyan rounded-full animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Secciones de Niveles con diseño moderno */}
        <div className="relative">
          {/* Educación Inicial */}
          <section className="relative py-20 px-4 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-orange-500/10 to-yellow-500/10"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            ></div>
            <div className="max-w-6xl mx-auto relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg animate-float">
                  🎒
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Educación Inicial</h2>
                  <p className="text-gray-400">3-5 años • Primeros pasos en tecnología</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {EDUCATION_LEVELS.slice(0, 2).map((level, index) => (
                  <Link
                    key={level.id}
                    href={`/nivel/${level.id}`}
                    className={`group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl stagger-${index + 1}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="relative p-8 min-h-[200px] flex flex-col justify-end">
                      <div className="absolute top-6 right-6 text-6xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500">
                        {level.icon}
                      </div>
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{level.icon}</div>
                      <h3 className="text-2xl font-bold text-white mb-2">{level.name}</h3>
                      <p className="text-white/80 mb-4">{level.ageRange}</p>
                      <div className="flex items-center text-white font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span>Explorar contenido</span>
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Educación General Básica - Elemental */}
          <section className="relative py-20 px-4 bg-dark-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5"></div>
            <div className="max-w-6xl mx-auto relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg animate-float" style={{animationDelay: '0.5s'}}>
                  📚
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Educación Básica Elemental</h2>
                  <p className="text-gray-400">5-9 años • Fundamentos de programación</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {EDUCATION_LEVELS.slice(2, 6).map((level, index) => (
                  <Link
                    key={level.id}
                    href={`/nivel/${level.id}`}
                    className="group relative overflow-hidden rounded-2xl bg-dark-700 border border-dark-600 hover:border-neon-cyan/50 transition-all duration-300 hover:scale-105 hover:shadow-neon-cyan/20 hover:shadow-xl"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                    <div className="relative p-6 text-center">
                      <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">{level.icon}</div>
                      <h3 className="font-bold text-white mb-1">{level.name}</h3>
                      <p className="text-xs text-gray-400 mb-3">{level.ageRange}</p>
                      <div className="flex items-center justify-center text-neon-cyan text-sm font-medium opacity-0 group-hover:opacity-100 transition-all">
                        Ver <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Educación General Básica - Media y Superior */}
          <section className="relative py-20 px-4 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10"
              style={{ transform: `translateY(${-scrollY * 0.05}px)` }}
            ></div>
            <div className="max-w-6xl mx-auto relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg animate-float" style={{animationDelay: '1s'}}>
                  🔬
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Educación Básica Media y Superior</h2>
                  <p className="text-gray-400">9-15 años • Proyectos avanzados</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {EDUCATION_LEVELS.slice(6, 12).map((level, index) => (
                  <Link
                    key={level.id}
                    href={`/nivel/${level.id}`}
                    className="group relative overflow-hidden rounded-2xl bg-dark-700/50 backdrop-blur border border-dark-600 hover:border-neon-purple/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                    <div className="relative p-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{level.icon}</div>
                        <div>
                          <h3 className="font-bold text-white">{level.name}</h3>
                          <p className="text-sm text-gray-400">{level.ageRange}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-neon-purple text-sm font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                        Explorar <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Bachillerato */}
          <section className="relative py-20 px-4 bg-dark-800 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-green/10 rounded-full blur-[150px] animate-pulse"></div>
            </div>
            <div className="max-w-6xl mx-auto relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg animate-float" style={{animationDelay: '1.5s'}}>
                  🎓
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Bachillerato</h2>
                  <p className="text-gray-400">15-18 años • Especialización y proyectos profesionales</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {EDUCATION_LEVELS.slice(12, 15).map((level, index) => (
                  <Link
                    key={level.id}
                    href={`/nivel/${level.id}`}
                    className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.03]"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${level.color}`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    </div>
                    <div className="relative p-8 min-h-[220px] flex flex-col justify-end">
                      <div className="absolute top-4 right-4 glass-dark px-3 py-1 rounded-full text-xs text-white">
                        Avanzado
                      </div>
                      <div className="text-5xl mb-4 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">{level.icon}</div>
                      <h3 className="text-2xl font-bold text-white mb-2">{level.name}</h3>
                      <p className="text-white/80 mb-4">{level.ageRange}</p>
                      <div className="flex items-center text-white font-semibold">
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          Acceder al contenido
                        </span>
                        <ArrowRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="relative py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-purple/10 to-neon-pink/10"></div>
            <div className="max-w-4xl mx-auto relative z-10 text-center">
              <div className="glass-dark rounded-3xl p-12">
                <Sparkles className="w-12 h-12 text-neon-cyan mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-white mb-4">
                  Contenido Adaptado a Cada Nivel
                </h3>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Cada nivel incluye videos, tutoriales, proyectos prácticos y acceso a simuladores 
                  apropiados para la edad. El contenido sigue una progresión pedagógica diseñada 
                  para maximizar el aprendizaje.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-2 text-neon-cyan">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
                    <span>Videos interactivos</span>
                  </div>
                  <div className="flex items-center gap-2 text-neon-purple">
                    <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"></div>
                    <span>Proyectos prácticos</span>
                  </div>
                  <div className="flex items-center gap-2 text-neon-green">
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                    <span>Simuladores online</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
