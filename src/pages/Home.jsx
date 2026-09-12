import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Stats from '../components/Stats/Stats';
import Skills from '../components/Skills/Skills';
import Projects from '../components/Projects/Projects';
import Experience from '../components/Experience/Experience';
import Education from '../components/Education/Education';
import Certifications from '../components/Certifications/Certifications';
import Services from '../components/Services/Services';
import Contact from '../components/Contact/Contact';
import Footer from '../components/Footer/Footer';
import './Home.css';

/**
 * Home Page
 */
function Home() {
  return (
    <div className="home-page">
      
      {/* Hero Section */}
      <Hero />

      {/* About Section */}
      <About />

      {/* Stats / Highlights Section */}
      <Stats />

      {/* Skills & Technologies Section */}
      <Skills />

      {/* Projects Showcase Section */}
      <Projects />

      {/* Experience Section */}
      <Experience />

      {/* Education Section */}
      <Education />

      {/* Certifications & Learning Section */}
      <Certifications />

      {/* Services Section */}
      <Services />

      {/* Contact Section */}
      <Contact />

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

export default Home;
