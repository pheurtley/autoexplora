interface OrganizationJsonLdProps {
  name: string;
  url: string;
  logo?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  socialLinks?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    youtube?: string | null;
  };
}

export function OrganizationJsonLd({
  name,
  url,
  logo,
  description,
  contactEmail,
  contactPhone,
  socialLinks,
}: OrganizationJsonLdProps) {
  const sameAs = [
    socialLinks?.facebook,
    socialLinks?.instagram,
    socialLinks?.twitter,
    socialLinks?.youtube,
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name,
    url,
    ...(logo && { logo }),
    ...(description && { description }),
    ...(contactEmail && { email: contactEmail }),
    ...(contactPhone && { telephone: contactPhone }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
