"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

export type AccordionItem = {
  title: string;
  content: string;
};

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div className="accordion-item" key={item.title}>
            <button
              aria-expanded={isOpen}
              className="accordion-trigger"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              type="button"
            >
              <span>{item.title}</span>
              <Plus aria-hidden="true" className={isOpen ? "rotate" : ""} />
            </button>
            <div className={`accordion-panel ${isOpen ? "open" : ""}`}>
              <p>{item.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
