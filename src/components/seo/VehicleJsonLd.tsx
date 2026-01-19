interface VehicleJsonLdProps {
  name: string;
  description?: string | null;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  condition: "NUEVO" | "USADO";
  price: number;
  currency?: string;
  image?: string | null;
  url: string;
  seller: {
    type: "AutoDealer" | "Person";
    name: string;
  };
  color?: string | null;
  vehicleType?: string | null;
}

const FUEL_TYPE_MAP: Record<string, string> = {
  BENCINA: "Gasoline",
  DIESEL: "Diesel",
  HIBRIDO: "HybridElectric",
  ELECTRICO: "Electric",
  GAS: "NaturalGas",
  OTRO: "Other",
};

const TRANSMISSION_MAP: Record<string, string> = {
  MANUAL: "ManualTransmission",
  AUTOMATICA: "AutomaticTransmission",
  SEMIAUTOMATICA: "AutomaticTransmission",
};

export function VehicleJsonLd({
  name,
  description,
  brand,
  model,
  year,
  mileage,
  fuelType,
  transmission,
  condition,
  price,
  currency = "CLP",
  image,
  url,
  seller,
  color,
  vehicleType,
}: VehicleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name,
    ...(description && { description }),
    brand: {
      "@type": "Brand",
      name: brand,
    },
    model,
    vehicleModelDate: String(year),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: mileage,
      unitCode: "KMT",
    },
    fuelType: FUEL_TYPE_MAP[fuelType] || fuelType,
    vehicleTransmission: TRANSMISSION_MAP[transmission] || transmission,
    itemCondition:
      condition === "NUEVO"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    ...(image && { image }),
    ...(color && { color }),
    ...(vehicleType && { vehicleConfiguration: vehicleType }),
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      url,
      seller: {
        "@type": seller.type,
        name: seller.name,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
