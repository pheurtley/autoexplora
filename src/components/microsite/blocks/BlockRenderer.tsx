import Image from "next/image";
import type { ContentBlock } from "./types";

interface BlockRendererProps {
  blocks: ContentBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock level={block.level} text={block.text} />;
    case "paragraph":
      return <ParagraphBlock text={block.text} />;
    case "image":
      return (
        <ImageBlock url={block.url} alt={block.alt} caption={block.caption} />
      );
    case "video":
      return <VideoBlock url={block.url} caption={block.caption} />;
    case "cta":
      return (
        <CtaBlock text={block.text} url={block.url} variant={block.variant} />
      );
    case "divider":
      return <DividerBlock />;
    case "list":
      return <ListBlock style={block.style} items={block.items} />;
    default:
      return null;
  }
}

function HeadingBlock({ level, text }: { level: 2 | 3; text: string }) {
  if (level === 2) {
    return <h2 className="text-2xl font-bold text-neutral-900">{text}</h2>;
  }
  return <h3 className="text-xl font-semibold text-neutral-900">{text}</h3>;
}

function ParagraphBlock({ text }: { text: string }) {
  return (
    <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
      {text}
    </p>
  );
}

function ImageBlock({
  url,
  alt,
  caption,
}: {
  url: string;
  alt?: string;
  caption?: string;
}) {
  return (
    <figure>
      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-neutral-100">
        <Image
          src={url}
          alt={alt || ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-neutral-500 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function VideoBlock({ url, caption }: { url: string; caption?: string }) {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return null;
  }

  return (
    <figure>
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-neutral-900">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-neutral-500 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function CtaBlock({
  text,
  url,
  variant = "primary",
}: {
  text: string;
  url: string;
  variant?: "primary" | "outline";
}) {
  const baseClass =
    "inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors text-sm";

  if (variant === "outline") {
    return (
      <div>
        <a
          href={url}
          target={url.startsWith("http") ? "_blank" : undefined}
          rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
          className={`${baseClass} border-2`}
          style={{
            borderColor: "var(--ms-primary)",
            color: "var(--ms-primary)",
          }}
        >
          {text}
        </a>
      </div>
    );
  }

  return (
    <div>
      <a
        href={url}
        target={url.startsWith("http") ? "_blank" : undefined}
        rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
        className={`${baseClass} text-white`}
        style={{ backgroundColor: "var(--ms-primary)" }}
      >
        {text}
      </a>
    </div>
  );
}

function DividerBlock() {
  return <hr className="border-neutral-200" />;
}

function ListBlock({
  style,
  items,
}: {
  style: "bullet" | "numbered";
  items: string[];
}) {
  const Tag = style === "numbered" ? "ol" : "ul";
  const listClass =
    style === "numbered"
      ? "list-decimal list-inside space-y-1.5"
      : "list-disc list-inside space-y-1.5";

  return (
    <Tag className={`${listClass} text-neutral-600`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/)(\d+)/
  );
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}
