export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "video"
  | "cta"
  | "divider"
  | "list";

export interface HeadingBlock {
  type: "heading";
  level: 2 | 3;
  text: string;
}

export interface ParagraphBlock {
  type: "paragraph";
  text: string;
}

export interface ImageBlock {
  type: "image";
  url: string;
  alt?: string;
  caption?: string;
}

export interface VideoBlock {
  type: "video";
  url: string; // YouTube or Vimeo URL
  caption?: string;
}

export interface CtaBlock {
  type: "cta";
  text: string;
  url: string;
  variant?: "primary" | "outline";
}

export interface DividerBlock {
  type: "divider";
}

export interface ListBlock {
  type: "list";
  style: "bullet" | "numbered";
  items: string[];
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | VideoBlock
  | CtaBlock
  | DividerBlock
  | ListBlock;
