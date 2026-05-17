import { Route, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "wouter";

const quickLinks = [
  { name: "Features", href: "#features" },
  { name: "Hotels", href: "#hotels" },
  { name: "Itinerary", href: "/ai-recommendations" },
  { name: "About", href: "#about" }
];

const socialLinks = [
  { name: "Facebook", href: "#", icon: Facebook },
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "Instagram", href: "#", icon: Instagram },
  { name: "LinkedIn", href: "#", icon: Linkedin }
];

export default function Footer() {
  return (
    <footer className="bg-rose-950 text-white">
      <div className="travel-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-600 via-pink-500 to-rose-300 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Route className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-rose-200 to-pink-200 bg-clip-text text-transparent">
                Planora
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Your AI-powered travel companion for planning perfect trips with smart recommendations and budget tracking.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-rose-950 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-rose-600 hover:to-pink-500 transition-all duration-300 transform hover:scale-110"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 hover:underline"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-2 text-gray-400">
              <p>hello@moveomatic.com</p>
              <p>+1 (555) 123-4567</p>
              <p className="text-sm">
                Available 24/7 for your travel needs
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Planora. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}