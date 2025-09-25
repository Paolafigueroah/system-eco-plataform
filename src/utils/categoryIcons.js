import { 
  Smartphone, 
  Shirt, 
  BookOpen, 
  Home, 
  Gamepad2, 
  Dumbbell, 
  Palette, 
  Package,
  Laptop,
  Headphones,
  Camera,
  Car,
  Bike,
  Baby,
  Music,
  Utensils,
  Wrench,
  Scissors,
  Heart,
  Star
} from 'lucide-react';

// Mapeo de categorías a iconos
export const categoryIcons = {
  // Categorías principales
  'Electrónica': Smartphone,
  'Ropa y accesorios': Shirt,
  'Libros y educación': BookOpen,
  'Hogar y jardín': Home,
  'Juguetes y entretenimiento': Gamepad2,
  'Deportes y recreación': Dumbbell,
  'Arte y manualidades': Palette,
  'Otros productos': Package,
  
  // Categorías específicas de electrónica
  'Smartphone': Smartphone,
  'Laptop': Laptop,
  'Tablet': Laptop,
  'Computadora': Laptop,
  'Auriculares': Headphones,
  'Cámara': Camera,
  'Televisor': Smartphone,
  'Consola': Gamepad2,
  
  // Categorías de transporte
  'Automóvil': Car,
  'Bicicleta': Bike,
  'Moto': Bike,
  'Transporte': Car,
  
  // Categorías de ropa
  'Ropa': Shirt,
  'Calzado': Shirt,
  'Accesorios': Shirt,
  'Moda': Shirt,
  
  // Categorías de hogar
  'Muebles': Home,
  'Decoración': Home,
  'Jardín': Home,
  'Cocina': Utensils,
  'Baño': Home,
  'Dormitorio': Home,
  'Sala': Home,
  
  // Categorías de entretenimiento
  'Juguetes': Gamepad2,
  'Videojuegos': Gamepad2,
  'Música': Music,
  'Películas': Music,
  'Libros': BookOpen,
  'Revistas': BookOpen,
  
  // Categorías de deportes
  'Fitness': Dumbbell,
  'Fútbol': Dumbbell,
  'Básquetbol': Dumbbell,
  'Tenis': Dumbbell,
  'Natación': Dumbbell,
  'Ciclismo': Bike,
  
  // Categorías de arte
  'Pintura': Palette,
  'Dibujo': Palette,
  'Escultura': Palette,
  'Manualidades': Scissors,
  'Artesanías': Palette,
  
  // Categorías de bebés
  'Bebé': Baby,
  'Infantil': Baby,
  'Niños': Baby,
  
  // Categorías de herramientas
  'Herramientas': Wrench,
  'Ferretería': Wrench,
  'Construcción': Wrench,
  'Jardinería': Wrench,
  
  // Categorías de salud y belleza
  'Salud': Heart,
  'Belleza': Star,
  'Cuidado personal': Star,
  'Medicina': Heart,
  
  // Categorías de mascotas
  'Mascotas': Heart,
  'Animales': Heart,
  
  // Categoría por defecto
  'default': Package
};

// Función para obtener el icono de una categoría
export const getCategoryIcon = (category) => {
  if (!category) return categoryIcons.default;
  
  // Buscar coincidencia exacta
  if (categoryIcons[category]) {
    return categoryIcons[category];
  }
  
  // Buscar coincidencia parcial (case insensitive)
  const lowerCategory = category.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (key.toLowerCase().includes(lowerCategory) || lowerCategory.includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  // Si no encuentra coincidencia, usar icono por defecto
  return categoryIcons.default;
};

// Función para obtener el color de fondo de una categoría
export const getCategoryColor = (category) => {
  const colorMap = {
    'Electrónica': 'bg-blue-100 text-blue-600',
    'Ropa y accesorios': 'bg-pink-100 text-pink-600',
    'Libros y educación': 'bg-green-100 text-green-600',
    'Hogar y jardín': 'bg-orange-100 text-orange-600',
    'Juguetes y entretenimiento': 'bg-purple-100 text-purple-600',
    'Deportes y recreación': 'bg-red-100 text-red-600',
    'Arte y manualidades': 'bg-yellow-100 text-yellow-600',
    'Otros productos': 'bg-gray-100 text-gray-600',
    'default': 'bg-emerald-100 text-emerald-600'
  };
  
  if (colorMap[category]) {
    return colorMap[category];
  }
  
  // Buscar coincidencia parcial
  const lowerCategory = category.toLowerCase();
  for (const [key, color] of Object.entries(colorMap)) {
    if (key.toLowerCase().includes(lowerCategory) || lowerCategory.includes(key.toLowerCase())) {
      return color;
    }
  }
  
  return colorMap.default;
};

// Función para obtener el color de fondo del icono
export const getCategoryIconColor = (category) => {
  const colorMap = {
    'Electrónica': 'bg-blue-500',
    'Ropa y accesorios': 'bg-pink-500',
    'Libros y educación': 'bg-green-500',
    'Hogar y jardín': 'bg-orange-500',
    'Juguetes y entretenimiento': 'bg-purple-500',
    'Deportes y recreación': 'bg-red-500',
    'Arte y manualidades': 'bg-yellow-500',
    'Otros productos': 'bg-gray-500',
    'default': 'bg-emerald-500'
  };
  
  if (colorMap[category]) {
    return colorMap[category];
  }
  
  // Buscar coincidencia parcial
  const lowerCategory = category.toLowerCase();
  for (const [key, color] of Object.entries(colorMap)) {
    if (key.toLowerCase().includes(lowerCategory) || lowerCategory.includes(key.toLowerCase())) {
      return color;
    }
  }
  
  return colorMap.default;
};

export default categoryIcons;
