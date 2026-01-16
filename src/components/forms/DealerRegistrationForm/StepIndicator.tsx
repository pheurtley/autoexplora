"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    isCompleted
                      ? "bg-andino-600 text-white"
                      : isCurrent
                      ? "bg-andino-100 text-andino-600 ring-2 ring-andino-600"
                      : "bg-neutral-200 text-neutral-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium hidden sm:block",
                    isCurrent
                      ? "text-andino-600"
                      : isCompleted
                      ? "text-neutral-700"
                      : "text-neutral-500"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 sm:mx-4 rounded transition-colors",
                    currentStep > step.number
                      ? "bg-andino-600"
                      : "bg-neutral-200"
                  )}
                  style={{ minWidth: "20px" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
