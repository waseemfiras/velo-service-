import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { Projects } from '../components/Projects';
import { Stats } from '../components/Stats';
import { ContactFooter } from '../components/ContactFooter';
import { Chatbot } from '../components/Chatbot';

export function Home() {
  return (
    <div className="bg-velo-black min-h-screen text-white">
      <Navbar />
      <Hero />
      <Services />
      <Projects />
      <Stats />
      <ContactFooter />
      <Chatbot />
    </div>
  );
}

