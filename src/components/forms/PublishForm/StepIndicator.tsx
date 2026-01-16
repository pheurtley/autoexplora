"use client";

import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progreso" className="mb-8">
      <ol className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <li key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-colors
                    ${
                      isCompleted
                        ? "bg-andino-600 border-andino-600 text-white"
                        : isCurrent
                        ? "border-andino-600 text-andino-600 bg-white"
                        : "border-neutral-300 text-neutral-400 bg-white"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium hidden sm:block
                    ${isCurrent ? "text-andino-600" : "text-neutral-500"}
                  `}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-12 sm:w-20 h-0.5 mx-2 transition-colors
                    ${isCompleted ? "bg-andino-600" : "bg-neutral-300"}
                  `}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
