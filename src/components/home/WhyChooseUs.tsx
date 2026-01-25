"use client";

import { Container } from "@/components/layout";
import {
  Shield,
  Zap,
  Users,
  Star,
  Heart,
  ThumbsUp,
  Award,
  CheckCircle,
  LucideIcon,
} from "lucide-react";
import { useIntersectionObserver } from "@/hooks";

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  Shield,
  Zap,
  Users,
  Star,
  Heart,
  ThumbsUp,
  Award,
  CheckCircle,
};

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface WhyChooseUsProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    icon: "Shield",
    title: "Compra segura",
    description:
      "Verificamos a los vendedores y te ayudamos en todo el proceso de compra para que sea una experiencia segura.",
  },
  {
    icon: "Zap",
    title: "Vende rápido",
    description:
      "Publica tu vehículo en minutos y llega a miles de compradores potenciales en todo Chile.",
  },
  {
    icon: "Users",
    title: "Gran comunidad",
    description:
      "Más de 50,000 vehículos disponibles y una comunidad activa de compradores y vendedores.",
  },
];

export function WhyChooseUs({
  title = "¿Por qué elegir AutoExplora.cl?",
  subtitle = "Somos el marketplace de vehículos más confiable de Chile",
  features = defaultFeatures,
}: WhyChooseUsProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-16 bg-neutral-50">
      <Container>
        <div className="text-center mb-12">
          <h2
            className={`text-3xl font-bold text-neutral-900 mb-4 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {title}
          </h2>
          <p
            className={`text-lg text-neutral-600 max-w-2xl mx-auto transition-all duration-700 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Shield;
            return (
              <div
                key={feature.title}
                className={`text-center p-6 transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${(index + 2) * 150}ms` }}
              >
                <div
                  className={`w-16 h-16 bg-andino-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-500 ${
                    isVisible ? "animate-float" : ""
                  }`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <IconComponent className="h-8 w-8 text-andino-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
