import { motion } from "motion/react";
import { Facebook, Instagram, MessageCircle, ArrowUpRight } from "lucide-react";
import { Magnetic } from "./Magnetic";
import { TextReveal } from "./TextReveal";

export function ContactFooter() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Facebook",
      label: "Velo Service - فيلو",
      icon: Facebook,
      href: "https://facebook.com",
    },
    {
      name: "Instagram",
      label: "velos_7",
      icon: Instagram,
      href: "https://instagram.com/velos_7",
    },
    {
      name: "WhatsApp",
      label: "+970594292646",
      icon: MessageCircle,
      href: "https://wa.me/970594292646",
    },
  ];

  return (
    <footer id="contact" className="relative pt-32 pb-10 px-6 border-t border-white/5 mt-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display font-bold text-5xl sm:text-7xl lg:text-[6rem] leading-none tracking-tighter mb-8">
              <TextReveal text="Let's create" />
              <TextReveal text="together." className="text-white/40" delay={0.2} />
            </h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-white/50 text-xl font-light max-w-md"
            >
              Ready to transform your ideas into reality? Get in touch with our team of experts.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col justify-center space-y-6"
          >
            {socialLinks.map((social, index) => (
              <Magnetic key={social.name} intensity={0.05} className="block w-full">
                <motion.a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  className="hover-target group flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-velo-black flex items-center justify-center border border-white/10 group-hover:border-white/30 group-hover:scale-110 transition-all duration-500">
                      <social.icon className="w-6 h-6 text-white/80" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50 mb-1 font-medium tracking-wider uppercase">{social.name}</p>
                      <p className="font-medium text-xl tracking-wide group-hover:text-white transition-colors">{social.label}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                    <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-velo-black transition-colors" />
                  </div>
                </motion.a>
              </Magnetic>
            ))}
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/10">
          <p className="text-white/40 text-sm mb-4 md:mb-0">
            © {currentYear} Velo Service. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Magnetic intensity={0.2}><a href="#" className="hover-target text-white/40 hover:text-white text-sm transition-colors">Privacy Policy</a></Magnetic>
            <Magnetic intensity={0.2}><a href="#" className="hover-target text-white/40 hover:text-white text-sm transition-colors">Terms of Service</a></Magnetic>
          </div>
        </div>
      </div>
    </footer>
  );
}
