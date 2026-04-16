'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Bot, Brain, Shield, Rocket, Users, Award, Play, ArrowRight, Zap, Cpu, Code, Sparkles, GraduationCap, Building2, UserCheck, Calendar, Camera } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [count1, setCount1] = useState(0)
  const [count2, setCount2] = useState(0)
  const [count3, setCount3] = useState(0)
  const [count4, setCount4] = useState(0)
  const [experiencias, setExperiencias] = useState<any[]>([])
  const [loadingExp, setLoadingExp] = useState(true)

  // Cargar experiencias desde Airtable
  useEffect(() => {
    const fetchExperiencias = async () => {
      try {
        const res = await fetch('/api/experiencias')
        if (res.ok) {
          const data = await res.json()
          setExperiencias(data)
        }
      } catch (error) {
        console.error('Error loading experiencias:', error)
      } finally {
        setLoadingExp(false)
      }
    }
    fetchExperiencias()
  }, [])

  // Animación de contadores
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    const animate = (target: number, setter: (n: number) => void) => {
      let current = 0
      const increment = target / steps
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          setter(target)
          clearInterval(timer)
        } else {
          setter(Math.floor(current))
        }
      }, interval)
    }

    const timeout = setTimeout(() => {
      animate(50, setCount1)
      animate(10, setCount2)
      animate(14, setCount3)
      animate(30, setCount4)
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Futurista con Logo Grande */}
        <section className="relative overflow-hidden hero-gradient py-20 md:py-28 px-4">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-cyber-grid opacity-30"></div>
          {/* Glow Effects Animados */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-brand-violet/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '0.5s'}}></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 bg-gray-100/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-brand-purple/30 animate-fade-in">
                  <span className="animate-pulse w-2 h-2 bg-neon-green rounded-full"></span>
                  <span className="text-sm text-gray-600">Plataforma Educativa Activa</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 animate-slide-up">
                  Aprende{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-neon-blue animate-gradient">Robótica</span>,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9853B] to-[#e9a55b]">IA</span> y{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-400">Hacking Ético</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-lg animate-fade-in" style={{animationDelay: '0.3s'}}>
                  Plataforma educativa completa desde Inicial hasta Bachillerato. 
                  Videos, tutoriales, simuladores y proyectos prácticos con kits reales.
                </p>
                <div className="flex flex-wrap gap-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-brand-purple to-neon-blue text-dark-900 font-bold rounded-xl hover:shadow-brand-purple hover:scale-105 transition-all duration-300 flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Comenzar Ahora
                  </Link>
                  <Link href="/login" className="px-8 py-4 bg-gray-100 border border-brand-purple/30 text-brand-purple font-semibold rounded-xl hover:bg-gray-200 hover:border-brand-purple/60 hover:scale-105 transition-all duration-300">
                    Iniciar Sesión
                  </Link>
                </div>
              </div>
              
              {/* Logo Grande y Animado */}
              <div className="order-1 md:order-2 flex justify-center">
                <div className="relative group">
                  {/* Efecto de brillo detrás del logo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#558C89]/30 via-[#74AFAD]/30 to-[#D9853B]/30 rounded-full blur-3xl animate-pulse scale-110"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-brand-violet/20 rounded-full blur-2xl animate-spin-slow"></div>
                  
                  {/* Logo */}
                  <div className="relative">
                    <Image 
                      src="/chaski.png" 
                      alt="ChaskiBots Logo" 
                      width={280} 
                      height={280}
                      className="rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-500 animate-float"
                      priority
                    />
                    {/* Partículas decorativas */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-brand-purple rounded-full animate-bounce opacity-80"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-brand-violet rounded-full animate-bounce opacity-80" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute top-1/2 -right-6 w-4 h-4 bg-neon-pink rounded-full animate-ping opacity-60"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Animada */}
        <section className="py-16 bg-gray-50 border-y border-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 via-transparent to-brand-violet/5"></div>
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold text-brand-purple group-hover:text-glow-cyan transition-all">
                  {count1}+
                </div>
                <p className="text-gray-600 mt-2">Niveles Educativos</p>
              </div>
              <div className="group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold text-brand-violet group-hover:text-glow-purple transition-all">
                  {count2}+
                </div>
                <p className="text-gray-600 mt-2">Áreas</p>
              </div>
              <div className="group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold text-neon-green group-hover:text-glow-green transition-all">
                  {count3}
                </div>
                <p className="text-gray-600 mt-2">Kits</p>
              </div>
              <div className="group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold text-brand-cyan group-hover:text-glow-orange transition-all">
                  {count4}+
                </div>
                <p className="text-gray-600 mt-2">Simuladores</p>
              </div>
            </div>
          </div>
        </section>

        {/* Experiencias ChaskiBots */}
        <section className="py-20 px-4 bg-transparent">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Nuestras <span className="text-brand-cyan">Experiencias</span>
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              ChaskiBots ha llevado robótica educativa a instituciones de todo el país. 
              Conoce nuestro impacto en la educación STEM.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="card group hover:border-brand-cyan/50 hover:scale-105 transition-all duration-300 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-brand-cyan/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-cyan/20 transition-colors">
                  <Building2 className="w-8 h-8 text-brand-cyan" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Instituciones Educativas</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Trabajamos con escuelas, colegios y universidades implementando programas de robótica adaptados a cada nivel.
                </p>
                <div className="text-brand-cyan font-semibold">+20 instituciones</div>
              </div>
              <div className="card group hover:border-brand-purple/50 hover:scale-105 transition-all duration-300 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-brand-purple/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-purple/20 transition-colors">
                  <UserCheck className="w-8 h-8 text-brand-purple" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Capacitación Docente</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Formamos a profesores en metodologías STEM para que puedan guiar a sus estudiantes en el mundo de la tecnología.
                </p>
                <div className="text-brand-purple font-semibold">+100 docentes</div>
              </div>
              <div className="card group hover:border-brand-violet/50 hover:scale-105 transition-all duration-300 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-brand-violet/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-violet/20 transition-colors">
                  <Calendar className="w-8 h-8 text-brand-violet" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Talleres y Eventos</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Organizamos talleres prácticos, competencias de robótica y eventos tecnológicos para estudiantes de todas las edades.
                </p>
                <div className="text-brand-violet font-semibold">+50 eventos</div>
              </div>
            </div>

            {/* Galería de Experiencias desde Airtable */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center flex items-center justify-center gap-2">
                <Camera className="w-5 h-5 text-gray-600" /> Galería de Experiencias
              </h3>
              {loadingExp ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : experiencias.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {experiencias.slice(0, 8).map((exp, index) => (
                    <div 
                      key={exp.id} 
                      className={`group relative aspect-video rounded-xl overflow-hidden border hover:scale-105 transition-all duration-300 cursor-pointer ${
                        index % 4 === 0 ? 'border-brand-purple/30 hover:border-brand-purple' :
                        index % 4 === 1 ? 'border-brand-violet/30 hover:border-brand-violet' :
                        index % 4 === 2 ? 'border-neon-green/30 hover:border-neon-green' :
                        'border-brand-cyan/30 hover:border-brand-cyan'
                      }`}
                    >
                      {exp.url ? (
                        <Image 
                          src={exp.url} 
                          alt={exp.titulo}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${
                          index % 4 === 0 ? 'from-brand-purple/20 to-neon-blue/20' :
                          index % 4 === 1 ? 'from-brand-violet/20 to-neon-pink/20' :
                          index % 4 === 2 ? 'from-neon-green/20 to-emerald-500/20' :
                          'from-brand-cyan/20 to-amber-500/20'
                        }`}></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-gray-900 text-sm font-semibold truncate">{exp.titulo}</p>
                          <p className="text-gray-300 text-xs truncate">{exp.institucion}</p>
                        </div>
                      </div>
                      {exp.tipo === 'video' && (
                        <div className="absolute top-2 right-2 bg-red-500 text-gray-900 text-xs px-2 py-1 rounded-full">
                          Video
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0,1,2,3].map((i) => (
                    <div key={i} className={`aspect-video rounded-xl flex items-center justify-center border ${
                      i === 0 ? 'bg-gradient-to-br from-brand-purple/20 to-neon-blue/20 border-brand-purple/30' :
                      i === 1 ? 'bg-gradient-to-br from-brand-violet/20 to-neon-pink/20 border-brand-violet/30' :
                      i === 2 ? 'bg-gradient-to-br from-neon-green/20 to-emerald-500/20 border-neon-green/30' :
                      'bg-gradient-to-br from-brand-cyan/20 to-amber-500/20 border-brand-cyan/30'
                    } hover:scale-105 transition-transform cursor-pointer`}>
                      <span className="text-gray-500 text-sm">Próximamente</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-center text-gray-500 text-sm mt-4">
                {experiencias.length > 0 ? `${experiencias.length} experiencias en instituciones educativas` : 'Agrega fotos desde Airtable para mostrar aquí'}
              </p>
            </div>
          </div>
        </section>

        {/* Subject Areas - Cards Interactivas */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Áreas de <span className="text-brand-purple">Aprendizaje</span>
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Contenido especializado y progresivo para cada área, adaptado a la edad y nivel de cada estudiante.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Robótica */}
              <div className="card group hover:border-brand-purple/50 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => router.push('/login')}>
                <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-neon-blue/20 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-brand-purple transition-all group-hover:animate-pulse">
                  <Bot className="w-8 h-8 text-brand-purple" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Robótica</h3>
                <p className="text-gray-600 mb-4">Programación, diseño y electrónica con kits reales para cada nivel.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge badge-cyan">Arduino</span>
                  <span className="badge badge-cyan">ESP32</span>
                  <span className="badge badge-cyan">Sensores</span>
                </div>
                <div className="flex items-center text-brand-purple font-semibold group-hover:gap-2 transition-all">
                  Acceder <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* IA */}
              <div className="card group hover:border-brand-violet/50 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => router.push('/login')}>
                <div className="w-16 h-16 bg-gradient-to-br from-brand-violet/20 to-neon-pink/20 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-brand-violet transition-all group-hover:animate-pulse">
                  <Brain className="w-8 h-8 text-brand-violet" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Inteligencia Artificial</h3>
                <p className="text-gray-600 mb-4">Reconocimiento de imágenes, voz y machine learning en el navegador.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge badge-purple">COCO-SSD</span>
                  <span className="badge badge-purple">MobileNet</span>
                  <span className="badge badge-purple">PoseNet</span>
                </div>
                <div className="flex items-center text-brand-violet font-semibold group-hover:gap-2 transition-all">
                  Acceder <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* Hacking */}
              <div className="card group hover:border-neon-green/50 hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer" onClick={() => router.push('/login')}>
                <div className="absolute top-3 right-3 px-2 py-1 bg-brand-cyan/20 border border-brand-cyan/40 rounded text-xs text-brand-cyan">
                  Desde 8° EGB
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-neon-green transition-all group-hover:animate-pulse">
                  <Shield className="w-8 h-8 text-neon-green" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hacking Ético</h3>
                <p className="text-gray-600 mb-4">Seguridad informática y ciberseguridad de forma responsable.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge badge-green">Pentesting</span>
                  <span className="badge badge-green">Redes</span>
                  <span className="badge badge-green">Crypto</span>
                </div>
                <div className="flex items-center text-neon-green font-semibold group-hover:gap-2 transition-all">
                  Acceder <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Education Levels Preview - Simplificado */}
        <section className="py-20 px-4 bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-violet/5 to-transparent"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Niveles <span className="text-brand-violet">Educativos</span>
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Desde Inicial 2 hasta 3° de Bachillerato. Contenido y kits adaptados para cada edad.
            </p>
            
            {/* Cards de niveles resumidos */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="card group hover:border-brand-purple/50 hover:scale-105 transition-all duration-300 text-center">
                <div className="text-4xl mb-4">🎒</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Inicial y Elemental</h3>
                <p className="text-gray-600 text-sm mb-4">Inicial 2 hasta 4° EGB</p>
                <div className="text-brand-purple font-semibold">5 niveles</div>
              </div>
              <div className="card group hover:border-brand-violet/50 hover:scale-105 transition-all duration-300 text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Media y Superior</h3>
                <p className="text-gray-600 text-sm mb-4">5° EGB hasta 10° EGB</p>
                <div className="text-brand-violet font-semibold">6 niveles</div>
              </div>
              <div className="card group hover:border-neon-green/50 hover:scale-105 transition-all duration-300 text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Bachillerato</h3>
                <p className="text-gray-600 text-sm mb-4">1° a 3° Bachillerato</p>
                <div className="text-neon-green font-semibold">3 niveles</div>
              </div>
            </div>
            
            <div className="text-center">
              <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-brand-violet to-neon-pink text-gray-900 font-bold rounded-xl hover:shadow-brand-violet hover:scale-105 transition-all duration-300 inline-flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Acceder a los Cursos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features - Futurista */}
        <section className="py-20 px-4 bg-transparent">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              ¿Por qué <span className="text-brand-purple">ChaskiBots</span> EDU?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="w-16 h-16 bg-brand-purple/10 border border-brand-purple/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-brand-purple" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Aprendizaje Progresivo</h3>
                <p className="text-gray-600">
                  Contenido adaptado a cada nivel educativo, desde los 4 años hasta bachillerato.
                </p>
              </div>
              <div className="card text-center">
                <div className="w-16 h-16 bg-brand-violet/10 border border-brand-violet/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-brand-violet" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Kits Reales</h3>
                <p className="text-gray-600">
                  Aprende con kits físicos de robótica diseñados para cada nivel educativo.
                </p>
              </div>
              <div className="card text-center">
                <div className="w-16 h-16 bg-neon-green/10 border border-neon-green/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-neon-green" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Simuladores Online</h3>
                <p className="text-gray-600">
                  Practica con Wokwi, Tinkercad, Scratch y más simuladores integrados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Futurista */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 via-brand-violet/10 to-neon-pink/10"></div>
          <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Listo para comenzar tu viaje en <span className="text-brand-purple">tecnología</span>?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Únete a ChaskiBots EDU y descubre el fascinante mundo de la robótica, 
              inteligencia artificial y ciberseguridad.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-brand-purple to-neon-blue text-dark-900 font-bold rounded-xl hover:shadow-brand-purple hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Comenzar Ahora
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
