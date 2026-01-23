import type { DealerSiteConfigWithRelations } from "@/lib/microsite/get-dealer-config";

interface MicrositeLocalBusinessJsonLdProps {
  config: DealerSiteConfigWithRelations;
  url: string;
}

export function MicrositeLocalBusinessJsonLd({
  config,
  url,
}: MicrositeLocalBusinessJsonLdProps) {
  const { dealer } = config;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: dealer.tradeName,
    url,
    ...(config.logo && { logo: config.logo }),
    ...(config.contactPhone && { telephone: config.contactPhone }),
    ...(config.contactEmail && { email: config.contactEmail }),
    ...(dealer.region && {
      address: {
        "@type": "PostalAddress",
        addressRegion: dealer.region.name,
        ...(dealer.comuna && { addressLocality: dealer.comuna.name }),
        addressCountry: "CL",
      },
    }),
    ...(config.metaDescription && { description: config.metaDescription }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface MicrositeVehicleJsonLdProps {
  vehicle: {
    title: string;
    description?: string | null;
    year: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    condition: string;
    price: number;
    color?: string | null;
    brand: { name: string };
    model: { name: string };
    images: { url: string }[];
  };
  dealerName: string;
  url: string;
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

export function MicrositeVehicleJsonLd({
  vehicle,
  dealerName,
  url,
}: MicrositeVehicleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicle.title,
    ...(vehicle.description && { description: vehicle.description }),
    brand: { "@type": "Brand", name: vehicle.brand.name },
    model: vehicle.model.name,
    modelDate: vehicle.year.toString(),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "KMT",
    },
    ...(FUEL_TYPE_MAP[vehicle.fuelType] && {
      fuelType: FUEL_TYPE_MAP[vehicle.fuelType],
    }),
    ...(TRANSMISSION_MAP[vehicle.transmission] && {
      vehicleTransmission: TRANSMISSION_MAP[vehicle.transmission],
    }),
    itemCondition:
      vehicle.condition === "NUEVO"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "CLP",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "AutoDealer",
        name: dealerName,
      },
    },
    ...(vehicle.color && { color: vehicle.color }),
    ...(vehicle.images.length > 0 && { image: vehicle.images[0].url }),
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
