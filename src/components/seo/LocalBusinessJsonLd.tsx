import { SITE_URL } from "@/lib/constants";

// Match the WeekSchedule type from UI components
interface DaySchedule {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

interface WeekSchedule {
  lunes: DaySchedule;
  martes: DaySchedule;
  miercoles: DaySchedule;
  jueves: DaySchedule;
  viernes: DaySchedule;
  sabado: DaySchedule;
  domingo: DaySchedule;
}

interface LocalBusinessJsonLdProps {
  name: string;
  slug: string;
  description?: string | null;
  type: "AUTOMOTORA" | "RENT_A_CAR";
  address: string;
  region: string;
  comuna?: string | null;
  phone: string;
  email: string;
  website?: string | null;
  logo?: string | null;
  image?: string | null;
  schedule?: WeekSchedule | null;
  isVerified?: boolean;
}

const DAY_MAP: Record<keyof WeekSchedule, string> = {
  lunes: "Monday",
  martes: "Tuesday",
  miercoles: "Wednesday",
  jueves: "Thursday",
  viernes: "Friday",
  sabado: "Saturday",
  domingo: "Sunday",
};

function formatOpeningHours(schedule: WeekSchedule | null | undefined): string[] {
  if (!schedule) return [];

  const hours: string[] = [];

  (Object.keys(DAY_MAP) as (keyof WeekSchedule)[]).forEach((day) => {
    const daySchedule = schedule[day];
    if (daySchedule?.isOpen && daySchedule?.openTime && daySchedule?.closeTime) {
      hours.push(`${DAY_MAP[day]} ${daySchedule.openTime}-${daySchedule.closeTime}`);
    }
  });

  return hours;
}

export function LocalBusinessJsonLd({
  name,
  slug,
  description,
  type,
  address,
  region,
  comuna,
  phone,
  email,
  website,
  logo,
  image,
  schedule,
  isVerified,
}: LocalBusinessJsonLdProps) {
  const url = `${SITE_URL}/automotora/${slug}`;
  const businessType = type === "AUTOMOTORA" ? "AutoDealer" : "AutoRental";
  const openingHours = formatOpeningHours(schedule);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": businessType,
    name,
    url,
    ...(description && { description }),
    ...(logo && { logo }),
    ...(image && { image }),
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: comuna || region,
      addressRegion: region,
      addressCountry: "CL",
    },
    telephone: phone,
    email,
    ...(website && { sameAs: [website] }),
    ...(openingHours.length > 0 && { openingHours }),
    ...(isVerified && {
      "@id": url,
      isAccessibleForFree: true,
    }),
    priceRange: "$$",
    areaServed: {
      "@type": "AdministrativeArea",
      name: region,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
