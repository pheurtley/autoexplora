export type FaqPageType = "brand" | "model" | "region";

export interface FaqTemplateItem {
  question: string;
  answer: string;
}

export const DEFAULT_FAQ_TEMPLATES: Record<FaqPageType, FaqTemplateItem[]> = {
  brand: [
    {
      question: "¿Dónde puedo comprar un {nombre} usado en Chile?",
      answer:
        "En AutoExplora.cl encontrarás {total} vehículos {nombre} en venta de particulares y automotoras en todo Chile. Puedes filtrar por modelo, año, precio y ubicación para encontrar el {nombre} ideal para ti.",
    },
    {
      question: "¿Cuánto cuesta un {nombre} usado?",
      answer:
        "Los precios de vehículos {nombre} usados varían según el modelo, año y kilometraje. En AutoExplora.cl puedes comparar precios y encontrar las mejores ofertas de {nombre} en Chile.",
    },
    {
      question: "¿Qué modelos de {nombre} están disponibles?",
      answer:
        "Tenemos {totalModelos} modelos de {nombre} disponibles: {listaModelos}. Explora todas las opciones en nuestra plataforma.",
    },
    {
      question: "¿Cómo contactar a un vendedor de {nombre}?",
      answer:
        "Cada publicación de {nombre} en AutoExplora.cl incluye un botón de WhatsApp para contactar directamente al vendedor. Puedes hacer consultas, solicitar más fotos o coordinar una prueba de manejo.",
    },
  ],
  model: [
    {
      question: "¿Cuánto cuesta un {marca} {nombre} usado en Chile?",
      answer:
        "Los precios de {marca} {nombre} usados varían según el año, kilometraje y equipamiento. En AutoExplora.cl encontrarás {total} unidades disponibles para comparar precios y elegir la mejor opción.",
    },
    {
      question: "¿Es buena opción comprar un {marca} {nombre} usado?",
      answer:
        "El {marca} {nombre} es un modelo popular en Chile. Te recomendamos verificar el historial del vehículo, kilometraje y estado general. En AutoExplora.cl puedes contactar directamente a los vendedores para resolver tus dudas.",
    },
    {
      question: "¿Dónde encuentro repuestos para {marca} {nombre}?",
      answer:
        "Los repuestos de {marca} {nombre} están disponibles en concesionarios oficiales y tiendas de repuestos automotrices en todo Chile. Al ser un modelo comercializado en el país, encontrar piezas no debería ser un problema.",
    },
    {
      question:
        "¿Cómo puedo verificar el estado de un {marca} {nombre} antes de comprarlo?",
      answer:
        "Te recomendamos solicitar una inspección mecánica profesional, revisar el informe de la patente en el Registro Civil, y verificar que los documentos estén en regla. Los vendedores en AutoExplora.cl pueden coordinar contigo una visita para revisar el vehículo.",
    },
  ],
  region: [
    {
      question: "¿Cuántos vehículos hay disponibles en {nombre}?",
      answer:
        "Actualmente hay {total} vehículos en venta en {nombre} publicados en AutoExplora.cl. La oferta se actualiza diariamente con nuevos autos, motos y vehículos comerciales.",
    },
    {
      question: "¿Qué tipos de vehículos puedo encontrar en {nombre}?",
      answer:
        "En {nombre} encontrarás autos, camionetas, SUV, motos y vehículos comerciales, tanto nuevos como usados. Puedes filtrar por marca, modelo, año, precio y kilometraje.",
    },
    {
      question: "¿Cómo comprar un vehículo en {nombre}?",
      answer:
        "Explora los vehículos disponibles en {nombre} en AutoExplora.cl, compara precios y contacta directamente al vendedor o automotora. Puedes filtrar por condición, precio y más para encontrar el vehículo ideal.",
    },
    {
      question: "¿Cuáles son las marcas más populares en {nombre}?",
      answer:
        "Las marcas más buscadas en {nombre} incluyen Toyota, Hyundai, Kia, Chevrolet, Nissan y Suzuki. Usa los filtros de marca para ver la oferta completa de cada una.",
    },
  ],
};

export interface FaqVariable {
  key: string;
  label: string;
}

export const FAQ_VARIABLES: Record<FaqPageType, FaqVariable[]> = {
  brand: [
    { key: "{nombre}", label: "Nombre de la marca" },
    { key: "{total}", label: "Total de vehículos" },
    { key: "{totalModelos}", label: "Cantidad de modelos" },
    { key: "{listaModelos}", label: "Lista de modelos (primeros 5)" },
  ],
  model: [
    { key: "{marca}", label: "Nombre de la marca" },
    { key: "{nombre}", label: "Nombre del modelo" },
    { key: "{total}", label: "Total de vehículos" },
  ],
  region: [
    { key: "{nombre}", label: "Nombre de la región" },
    { key: "{total}", label: "Total de vehículos" },
  ],
};
