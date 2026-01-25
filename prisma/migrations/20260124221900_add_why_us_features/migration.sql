-- Add Why Us Features columns to SiteConfig
ALTER TABLE "SiteConfig" ADD COLUMN "whyUsFeature1Icon" TEXT NOT NULL DEFAULT 'Shield';
ALTER TABLE "SiteConfig" ADD COLUMN "whyUsFeature1Title" TEXT NOT NULL DEFAULT 'Compra segura';
ALTER TABLE "SiteConfig" ADD COLUMN "whyUsFeature1Desc" TEXT NOT NULL DEFAULT 'Verificamos a los vendedores y te ayudamos en todo el proceso de compra para que sea una experiencia segura.';

ALTER TABLE "SiteConfig" ADD COLUMN "whyUsFeature2Icon" TEXT NOT NULL DEFAULT 'Zap';
ALTER TABLE "SiteConfig" ADD COLUMN "whyUsFeature2Title" TEXT NOT NULL DEFAULT 'Vende rápido';
ALTER TABLE "SiteConfig" ADD COLUMN "whyUsFeature2Desc" TEXT NOT NULL DEFAULT 'Publica tu vehículo en minutos y llega a miles de compradores potenciales en todo Chile.';

ALTER TABLE "SiteConfig" ADD COLUMN "whyUsFeature3Icon" TEXT NOT NULL DEFAULT 'Users';
ALTER TABLE "SiteConfig" ADD COLUMN "whyUsFeature3Title" TEXT NOT NULL DEFAULT 'Gran comunidad';
ALTER TABLE "SiteConfig" ADD COLUMN "whyUsFeature3Desc" TEXT NOT NULL DEFAULT 'Más de 50,000 vehículos disponibles y una comunidad activa de compradores y vendedores.';
