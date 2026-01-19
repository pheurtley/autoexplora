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
  const currentStepData = steps.find((s) => s.number === currentStep);
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <nav aria-label="Progreso" className="mb-8">
      {/* Mobile: Simple progress bar with step counter */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">
            Paso {currentStep} de {steps.length}
          </span>
          <span className="text-sm font-medium text-andino-600">
            {currentStepData?.title}
          </span>
        </div>
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-andino-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Desktop: Full step indicator */}
      <ol className="hidden sm:flex items-center justify-center">
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
                    mt-2 text-xs font-medium
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
                    w-20 h-0.5 mx-2 transition-colors
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
