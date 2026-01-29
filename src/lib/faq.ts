import { unstable_cache } from "next/cache";
import prisma from "./prisma";
import {
  DEFAULT_FAQ_TEMPLATES,
  type FaqPageType,
  type FaqTemplateItem,
} from "./faq-defaults";

interface FaqTemplate {
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

async function fetchFaqTemplates(
  pageType: FaqPageType
): Promise<FaqTemplateItem[]> {
  const templates = await prisma.faqTemplate.findMany({
    where: { pageType, isActive: true },
    orderBy: { order: "asc" },
    select: { question: true, answer: true, order: true, isActive: true },
  });

  if (templates.length === 0) {
    return DEFAULT_FAQ_TEMPLATES[pageType];
  }

  return templates.map((t: FaqTemplate) => ({
    question: t.question,
    answer: t.answer,
  }));
}

export const getFaqTemplates = (pageType: FaqPageType) =>
  unstable_cache(
    () => fetchFaqTemplates(pageType),
    [`faq-templates-${pageType}`],
    { revalidate: 300, tags: ["faq-templates"] }
  )();

export function interpolateFaq(
  templates: FaqTemplateItem[],
  variables: Record<string, string | number>
): FaqTemplateItem[] {
  return templates.map((template) => ({
    question: replaceVariables(template.question, variables),
    answer: replaceVariables(template.answer, variables),
  }));
}

function replaceVariables(
  text: string,
  variables: Record<string, string | number>
): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = key.startsWith("{") ? key : `{${key}}`;
    result = result.replaceAll(placeholder, String(value));
  }
  return result;
}
