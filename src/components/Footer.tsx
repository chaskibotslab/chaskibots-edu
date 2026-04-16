import Link from 'next/link'
import Image from 'next/image'
import { Mail, Globe, Youtube, Facebook, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src="/chaski.png" 
                alt="ChaskiBots Logo" 
                width={40} 
                height={40}
                className="rounded-xl"
              />
              <div>
                <span className="font-bold text-xl text-gray-900">ChaskiBots</span>
                <span className="text-[10px] text-brand-purple block tracking-widest">EDUCATION PLATFORM</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              Plataforma educativa de robótica, inteligencia artificial y hacking ético 
              para estudiantes desde Inicial hasta Bachillerato en Ecuador.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="https://www.youtube.com/@chaskibots" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-500 hover:text-brand-purple transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/chaskibots" target="_blank" rel="noopener noreferrer"
                 className="text-gray-500 hover:text-brand-purple transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://chaskibots.com" target="_blank" rel="noopener noreferrer"
                 className="text-gray-500 hover:text-brand-purple transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Plataforma</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/niveles" className="hover:text-brand-purple transition-colors">Niveles Educativos</Link></li>
              <li><Link href="/robotica" className="hover:text-brand-purple transition-colors">Robótica</Link></li>
              <li><Link href="/ia" className="hover:text-brand-violet transition-colors">Inteligencia Artificial</Link></li>
              <li><Link href="/hacking" className="hover:text-neon-green transition-colors">Hacking Ético</Link></li>
              <li><Link href="/simuladores" className="hover:text-brand-cyan transition-colors">Simuladores</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-purple" />
                <a href="mailto:info@chaskibots.com" className="hover:text-brand-purple transition-colors">
                  info@chaskibots.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-purple" />
                <a href="https://chaskibots.com" target="_blank" rel="noopener noreferrer" 
                   className="hover:text-brand-purple transition-colors">
                  www.chaskibots.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neon-green" />
                <a href="https://wa.me/593968653593" target="_blank" rel="noopener noreferrer"
                   className="hover:text-neon-green transition-colors">
                  0968653593
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ChaskiBots. Todos los derechos reservados.</p>
          <p className="mt-1">Hecho con <span className="text-neon-pink">❤️</span> en Ecuador 🇪🇨</p>
        </div>
      </div>
    </footer>
  )
}
