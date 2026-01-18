"use client";

import Link from "next/link";
import { Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ArrowRight } from "lucide-react";
import { useIntersectionObserver } from "@/hooks";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export function CTASection({
  title = "¿Listo para vender tu vehículo?",
  subtitle = "Publica tu auto, moto o vehículo comercial en minutos y conecta con compradores interesados.",
  buttonText = "Publicar mi vehículo",
}: CTASectionProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.3 });

  return (
    <section ref={ref} className="py-16 bg-andino-600">
      <Container>
        <div className="text-center">
          <h2
            className={`text-3xl font-bold text-white mb-4 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {title}
          </h2>
          <p
            className={`text-lg text-andino-100 mb-8 max-w-2xl mx-auto transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            {subtitle}
          </p>
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <Link href="/publicar">
              <Button
                variant="secondary"
                size="lg"
                className="group bg-white text-andino-600 hover:bg-andino-50 hover:scale-105 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
              >
                {buttonText}
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
