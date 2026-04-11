import { useEffect } from "react";

function updateMetaTag(selector, attributes) {
  let meta = document.head.querySelector(selector);

  if (!meta) {
    meta = document.createElement("meta");
    document.head.appendChild(meta);
  }

  for (const [key, value] of Object.entries(attributes)) {
    meta.setAttribute(key, value);
  }
}

export default function SeoMeta({ title, description }) {
  useEffect(() => {
    document.title = title;

    updateMetaTag('meta[name="description"]', {
      name: "description",
      content: description,
    });

    updateMetaTag('meta[property="og:title"]', {
      property: "og:title",
      content: title,
    });

    updateMetaTag('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });

    updateMetaTag('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
  }, [description, title]);

  return null;
}
