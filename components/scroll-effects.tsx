"use client";

import { useEffect, useRef } from "react";
import type { Lang } from "@/lib/types";

export function ScrollEffects({ lang }: { lang: Lang }) {
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    const root = document.querySelector("main");
    if (!root) return;
    const reveals = root.querySelectorAll<HTMLElement>(
      ".value, .section-top, .service-card, .about-photo, .about-copy, .quote-section, .process-heading, .process-step, .booking-intro, .faq-section > div, .article-card, .instagram-card, .contact-copy, .contact-form-wrap, .rhythm-copy, .rhythm-chart",
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );
    function setRevealOffset(element: HTMLElement, index: number) {
      const fromLeft =
        element.matches(".about-photo, .rhythm-copy, .booking-intro, .contact-copy") ||
        (!element.matches(".about-copy, .rhythm-chart, .contact-form-wrap, .instagram-card") &&
          index % 2 === 0);
      const current =
        element.dataset.reveal && element.dataset.visible !== "true"
          ? parseFloat(element.style.getPropertyValue("--reveal-x")) || 0
          : 0;
      const rect = element.getBoundingClientRect();
      const room = fromLeft
        ? rect.left - current
        : document.documentElement.clientWidth - rect.right + current;
      const distance = Math.min(window.innerWidth <= 760 ? 16 : 52, Math.max(0, room - 4));
      element.style.setProperty("--reveal-x", `${(fromLeft ? -1 : 1) * distance}px`);
    }
    reveals.forEach((element, index) => {
      setRevealOffset(element, index);
      element.dataset.reveal = "true";
      element.style.setProperty("--reveal-delay", `${(index % 3) * 65}ms`);
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) {
        element.dataset.visible = "true";
      } else {
        revealObserver.observe(element);
      }
    });
    const photos = root.querySelectorAll<HTMLElement>(".hero-image-wrap");
    const meters = root.querySelectorAll<HTMLElement>("[data-scroll-meter]");
    let frame = 0;
    let reduced = false;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    function update() {
      frame = 0;
      if (reduced) return;
      const viewport = window.innerHeight;
      const distance = document.documentElement.scrollHeight - viewport;
      progress.current?.style.setProperty(
        "--reading-progress",
        String(clamp(window.scrollY / Math.max(1, distance))),
      );
      photos.forEach((photo) => {
        const rect = photo.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < viewport) {
          const amount = (rect.top + rect.height / 2 - viewport / 2) / viewport;
          photo.style.setProperty("--parallax-y", `${Math.max(-18, Math.min(18, amount * 24))}px`);
        }
      });
      meters.forEach((meter) => {
        const rect = meter.getBoundingClientRect();
        const amount = clamp((viewport - rect.top) / (viewport * 0.7));
        const eased = 1 - Math.pow(1 - amount, 3);
        meter.style.setProperty("--data-progress", String(eased));
        meter.querySelectorAll<HTMLElement>("[data-count-to]").forEach((counter) => {
          const value = String(Math.round(Number(counter.dataset.countTo) * eased));
          if (counter.textContent !== value) counter.textContent = value;
        });
      });
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = () => {
      reveals.forEach((element, index) => {
        element.style.transition = "none";
        setRevealOffset(element, index);
      });
      requestAnimationFrame(() => {
        reveals.forEach((element) => element.style.removeProperty("transition"));
      });
      schedule();
    };
    const reduce = () => {
      reduced = preference.matches;
      if (reduced) {
        reveals.forEach((element) => {
          element.dataset.visible = "true";
        });
        meters.forEach((meter) => {
          meter.style.setProperty("--data-progress", "1");
          meter.querySelectorAll<HTMLElement>("[data-count-to]").forEach((counter) => {
            counter.textContent = counter.dataset.countTo || "";
          });
        });
        photos.forEach((photo) => photo.style.removeProperty("--parallax-y"));
      } else schedule();
    };
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    preference.addEventListener("change", reduce);
    update();
    return () => {
      cancelAnimationFrame(frame);
      revealObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      preference.removeEventListener("change", reduce);
      reveals.forEach((element) => {
        delete element.dataset.reveal;
        delete element.dataset.visible;
        element.style.removeProperty("--reveal-delay");
        element.style.removeProperty("--reveal-x");
      });
    };
  }, [lang]);
  return <div className="reading-progress" ref={progress} aria-hidden="true" />;
}
