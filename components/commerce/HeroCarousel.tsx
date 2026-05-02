"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const heroSlides = [
  {
    src: "/images/shooting-focus-black-offi.png",
    alt: "FocusGym black compression top photoshoot"
  },
  {
    src: "/images/shooting-focus-black-offi-2.png",
    alt: "FocusGym black compression top back photoshoot"
  },
  {
    src: "/images/shooting-focus-white.png",
    alt: "FocusGym white compression top photoshoot"
  },
  {
    src: "/images/shooting-focus-white-offi.png",
    alt: "FocusGym white compression top back photoshoot"
  }
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  function goToSlide(index: number) {
    setActiveIndex((index + heroSlides.length) % heroSlides.length);
  }

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % heroSlides.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      aria-label="FocusGym product photos"
      className="hero-carousel-frame"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-carousel-viewport">
        <div
          className="hero-carousel-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {heroSlides.map((slide, index) => (
            <div className="hero-carousel-slide" key={slide.src}>
              <Image
                alt={slide.alt}
                className="hero-carousel-image"
                height={1492}
                priority={index === 0}
                src={slide.src}
                width={1054}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        aria-label="Image précédente"
        className="hero-carousel-control previous"
        onClick={() => goToSlide(activeIndex - 1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <button
        aria-label="Image suivante"
        className="hero-carousel-control next"
        onClick={() => goToSlide(activeIndex + 1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" />
      </button>

      <div className="hero-carousel-dots" aria-label="Choisir une image">
        {heroSlides.map((slide, index) => (
          <button
            aria-label={`Afficher l’image ${index + 1}`}
            aria-pressed={activeIndex === index}
            className={activeIndex === index ? "active" : ""}
            key={slide.src}
            onClick={() => goToSlide(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
