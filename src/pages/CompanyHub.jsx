import React from 'react';
import { Building2, Upload, FileSpreadsheet, Users, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CompanyHub = () => {
  const roadmap = [
    {
      icon: Upload,
      title: 'Carga masiva de publicaciones',
      description: 'Sube múltiples productos para acelerar la activación de inventario.'
    },
    {
      icon: FileSpreadsheet,
      title: 'Importación por plantilla',
      description: 'Usa formatos CSV/XLSX para publicar lotes completos de forma simple.'
    },
    {
      icon: Users,
      title: 'Gestión multiusuario',
      description: 'Permite equipos de empresa con permisos diferenciados por rol.'
    },
    {
      icon: MessageCircle,
      title: 'Atención comercial centralizada',
      description: 'Concentra conversaciones con clientes y seguimiento de oportunidades.'
    }
  ];

  return (
    <div className="min-h-[70vh]">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mr-3">
              <Building2 className="text-sky-600 dark:text-sky-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Apartado para Empresas</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            Este espacio es la base del panel empresarial en System Eco. Desde aqui podras operar catalogos
            a escala, coordinar equipos y mejorar la atencion de clientes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn-primary">
              Ir a Dashboard
            </Link>
            <Link to="/chat" className="btn-secondary">
              Ir a Chat comercial
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmap.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                  <Icon className="text-emerald-600 dark:text-emerald-300" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompanyHub;
