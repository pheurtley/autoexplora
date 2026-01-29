/**
 * Available variables for template interpolation
 */
export const TEMPLATE_VARIABLES = {
  nombre: "Nombre del cliente",
  email: "Email del cliente",
  telefono: "Teléfono del cliente",
  vehiculo: "Nombre del vehículo",
  vehiculo_precio: "Precio del vehículo",
  dealer_nombre: "Nombre de la automotora",
  dealer_telefono: "Teléfono de la automotora",
  dealer_direccion: "Dirección de la automotora",
  fecha: "Fecha actual",
  hora: "Hora actual",
} as const;

export type TemplateVariable = keyof typeof TEMPLATE_VARIABLES;

interface InterpolationContext {
  nombre?: string;
  email?: string;
  telefono?: string;
  vehiculo?: string;
  vehiculo_precio?: string | number;
  dealer_nombre?: string;
  dealer_telefono?: string;
  dealer_direccion?: string;
}

/**
 * Interpolate variables in a template string
 * Variables are in the format {variable_name}
 */
export function interpolateTemplate(
  template: string,
  context: InterpolationContext
): string {
  let result = template;

  // Add current date and time
  const now = new Date();
  const extendedContext = {
    ...context,
    fecha: now.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    hora: now.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  // Replace all variables
  for (const [key, value] of Object.entries(extendedContext)) {
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      result = result.replace(regex, String(value));
    }
  }

  // Remove any unreplaced variables
  result = result.replace(/\{[a-z_]+\}/g, "");

  return result;
}

/**
 * Extract variable names from a template string
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{([a-z_]+)\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

/**
 * Validate that all variables in a template are known
 */
export function validateTemplate(template: string): {
  valid: boolean;
  unknownVariables: string[];
} {
  const variables = extractVariables(template);
  const knownVariables = Object.keys(TEMPLATE_VARIABLES);
  const unknownVariables = variables.filter(
    (v) => !knownVariables.includes(v)
  );
  return {
    valid: unknownVariables.length === 0,
    unknownVariables,
  };
}

/**
 * Get preview of a template with sample data
 */
export function getTemplatePreview(template: string): string {
  const sampleContext: InterpolationContext = {
    nombre: "Juan Pérez",
    email: "juan@ejemplo.com",
    telefono: "+56 9 1234 5678",
    vehiculo: "Toyota Corolla 2023",
    vehiculo_precio: "$ 15.990.000",
    dealer_nombre: "Automotora Ejemplo",
    dealer_telefono: "+56 2 2345 6789",
    dealer_direccion: "Av. Principal 123, Santiago",
  };

  return interpolateTemplate(template, sampleContext);
}
