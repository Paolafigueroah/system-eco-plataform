import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Leaf, Users, MessageCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'contacto@economiacircular.com',
      description: 'Envíanos un email en cualquier momento'
    },
    {
      icon: Phone,
      title: 'Teléfono',
      value: '+1 (555) 123-4567',
      description: 'Lun-Vie de 8am a 6pm'
    },
    {
      icon: MapPin,
      title: 'Oficina',
      value: '123 Calle Sostenible, Ciudad Verde',
      description: 'Visítanos en persona'
    }
  ];

  const supportTopics = [
    {
      icon: Leaf,
      title: 'Soporte Técnico',
      description: 'Ayuda con el uso de la plataforma, publicación de productos y sistema de puntos.'
    },
    {
      icon: Users,
      title: 'Comunidad',
      description: 'Información sobre eventos, talleres y actividades de la comunidad sostenible.'
    },
    {
      icon: MessageCircle,
      title: 'Sugerencias',
      description: 'Comparte ideas para mejorar la plataforma y expandir la economía circular.'
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-base-content mb-4">
            ¡Mensaje Enviado Exitosamente!
          </h2>
          <p className="text-lg text-base-content/70 mb-6">
            Gracias por contactarnos. Te responderemos pronto.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="btn-primary"
          >
            Enviar Otro Mensaje
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Header Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
          Contáctanos
        </h1>
        <p className="text-xl text-base-content/80 max-w-2xl mx-auto">
          ¿Tienes preguntas sobre la economía circular o quieres colaborar con nosotros? 
          Nos encantaría escucharte. Envíanos un mensaje y te responderemos lo antes posible.
        </p>
      </section>

      {/* Support Topics */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
            ¿En qué podemos ayudarte?
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Nuestro equipo está aquí para apoyarte en tu viaje hacia la sostenibilidad.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {supportTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <div key={index} className="card text-center group hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors duration-300">
                  <Icon className="text-emerald-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-base-content mb-2">
                  {topic.title}
                </h3>
                <p className="text-base-content/70">
                  {topic.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="card">
            <h2 className="text-2xl font-bold text-base-content mb-6">
              Envíanos un Mensaje
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-base-content mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-base-content mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-base-content mb-2">
                  Asunto
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Selecciona un asunto</option>
                  <option value="soporte">Soporte Técnico</option>
                  <option value="comunidad">Comunidad y Eventos</option>
                  <option value="sugerencias">Sugerencias</option>
                  <option value="colaboracion">Colaboración</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-base-content mb-2">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="input-field resize-none"
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Enviar Mensaje</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-base-content mb-6">
                Información de Contacto
              </h2>
              <p className="text-base-content/70 mb-8">
                Estamos aquí para ayudarte a ser parte de la economía circular. 
                No dudes en contactarnos por cualquier consulta.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="text-sky-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base-content mb-1">
                        {info.title}
                      </h3>
                      <p className="text-base-content font-medium mb-1">
                        {info.value}
                      </p>
                      <p className="text-base-content/70 text-sm">
                        {info.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FAQ Section */}
            <div className="card bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-900/20 dark:to-sky-900/20">
              <h3 className="text-xl font-semibold text-base-content mb-4">
                Preguntas Frecuentes
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-base-content">¿Cómo funciona el sistema de puntos?</h4>
                  <p className="text-sm text-base-content/70">
                    Ganas puntos al donar o intercambiar productos. Estos puntos puedes canjearlos por otros productos o beneficios.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-base-content">¿Es seguro intercambiar productos?</h4>
                  <p className="text-sm text-base-content/70">
                    Sí, contamos con un sistema de verificación y chat seguro para que puedas comunicarte con otros usuarios.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-base-content">¿Qué categorías de productos aceptan?</h4>
                  <p className="text-sm text-base-content/70">
                    Aceptamos electrónica, ropa, libros, hogar, juguetes, deportes y muchas más categorías.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
