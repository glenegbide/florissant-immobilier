"use client";

import { useEffect, useRef, useState } from "react";

/** Finger / mouse signature. Writes a PNG data URL into a hidden input named `name`. */
export function SignaturePad({ name, label, hint, clearLabel }: {
  name: string;
  label: string;
  hint: string;
  clearLabel: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const drawn = useRef(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    let lastWidth = 0;
    const style = (ctx: CanvasRenderingContext2D, dpr: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#111";
    };
    const fit = () => {
      const r = c.getBoundingClientRect();
      // Only a width change needs a new canvas size (page height changes, the
      // phone's address bar hiding, a screenshot… must not erase the signature).
      if (!r.width || Math.round(r.width) === lastWidth) return;
      lastWidth = Math.round(r.width);
      const dpr = window.devicePixelRatio || 1;
      const had = c.width > 0 && c.height > 0 ? c.toDataURL("image/png") : null;
      const oldW = c.width, oldH = c.height;
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      style(ctx, dpr);
      // Redraw an existing signature at the new size (phone rotated, window resized).
      if (had && oldW && oldH && drawn.current) {
        const img = new Image();
        img.onload = () => {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.drawImage(img, 0, 0, oldW, oldH, 0, 0, c.width, c.height);
          style(ctx, dpr);
          setValue(c.toDataURL("image/png"));
        };
        img.src = had;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };

  return (
    <div>
      <p className="mb-2 block text-[0.7rem] uppercase tracking-[0.18em] text-mutedbrand">{label}</p>
      <canvas
        ref={canvas}
        className="block h-44 w-full cursor-crosshair touch-none border border-dashed border-bordeaux bg-white"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          const [x, y] = pos(e);
          const ctx = e.currentTarget.getContext("2d");
          ctx?.beginPath();
          ctx?.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const [x, y] = pos(e);
          const ctx = e.currentTarget.getContext("2d");
          ctx?.lineTo(x, y);
          ctx?.stroke();
        }}
        onPointerUp={(e) => {
          if (!drawing.current) return;
          drawing.current = false;
          drawn.current = true;
          setValue(e.currentTarget.toDataURL("image/png"));
        }}
        onPointerCancel={() => {
          drawing.current = false;
        }}
      />
      <input type="hidden" name={name} value={value} />
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-light text-mutedbrand">{hint}</span>
        <button
          type="button"
          className="uppercase tracking-[0.15em] text-bordeaux"
          onClick={() => {
            const c = canvas.current;
            const ctx = c?.getContext("2d");
            if (c && ctx) {
              ctx.save();
              ctx.setTransform(1, 0, 0, 1, 0, 0);
              ctx.clearRect(0, 0, c.width, c.height);
              ctx.restore();
            }
            drawn.current = false;
            setValue("");
          }}
        >
          {clearLabel}
        </button>
      </div>
    </div>
  );
}
