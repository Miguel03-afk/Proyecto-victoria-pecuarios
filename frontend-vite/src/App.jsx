import { useEffect } from 'react';
import './App.css';

// 🔹 Importación de imágenes
import logoEmpresa from './assets/empresa_logo.png';
import carrusel1 from './assets/carrusel1_proyecto2.jpg';
import carrusel2 from './assets/carrusel2_proyecto2.jpg';
import carrusel3 from './assets/carrusel3_proyecto2.jpg';
import consulta from './assets/consulta_empresarial.png';
import desarrollo from './assets/desarrollo_tecnologico.png';
import marketing from './assets/marketing_digital.png';
import finanzas from './assets/gestion_financiera.png';

function App() {

  useEffect(() => {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentIndex = 0;

    const interval = setInterval(() => {
      slides[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('active');
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="header" id="inicio">
        <div className="container header-content">
          <div className="logo">
            <img src={logoEmpresa} alt="Logo empresa" />
            <span>TU EMPRESA</span>
          </div>

          <nav className="nav">
            <a href="#inicio">Inicio</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#servicios">Servicios</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </div>
      </header>

      {/* ===== CAROUSEL ===== */}
      <section className="carousel">
        <div className="carousel-slides">
          <div
            className="carousel-slide active"
            style={{ backgroundImage: `url(${carrusel1})` }}
          ></div>
          <div
            className="carousel-slide"
            style={{ backgroundImage: `url(${carrusel2})` }}
          ></div>
          <div
            className="carousel-slide"
            style={{ backgroundImage: `url(${carrusel3})` }}
          ></div>
        </div>

        <div className="carousel-overlay">
          <div className="carousel-text">
            <h1>Soluciones para<br/><strong>tu negocio</strong></h1>
            <p className="carousel-subtitle">Innovación y crecimiento empresarial</p>
            <button className="btn-secondary">Ver más</button>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="about" id="nosotros">
        <div className="container about-content">
          <div className="about-image"></div>
          <div className="about-text">
            <h2>¿Quiénes Somos?</h2>
            <p>Brindamos soluciones empresariales y tecnológicas.</p>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="services" id="servicios">
        <h2>Nuestros Servicios</h2>
        <div className="container services-grid">
          <div className="service-card">
            <img src={consulta} alt="Consultoría" />
            <h3>Consultoría</h3>
          </div>
          <div className="service-card">
            <img src={desarrollo} alt="Desarrollo" />
            <h3>Desarrollo</h3>
          </div>
          <div className="service-card">
            <img src={marketing} alt="Marketing" />
            <h3>Marketing</h3>
          </div>
          <div className="service-card">
            <img src={finanzas} alt="Finanzas" />
            <h3>Finanzas</h3>
          </div>
        </div>
      </section>

      {/* ===== FOOTER / CONTACTO ===== */}
      <footer className="footer" id="contacto">
        <div className="container footer-content">
          <div className="footer-form">
            <h3>Contáctanos</h3>
            <form id="contactForm">
              <input type="text" name="nombre" placeholder="Nombre" required />
              <input type="email" name="email" placeholder="Correo" required />
              <textarea name="mensaje" placeholder="Mensaje" required></textarea>
              <button type="submit" className="btn-footer">Enviar</button>
            </form>
            <p id="form-message"></p>
          </div>

          <div className="footer-info">
            <p>📞 +56 9 1234 5678</p>
            <p>✉️ info@tuempresa.com</p>
            <p>🏢 Av. Siempre Viva 123</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
