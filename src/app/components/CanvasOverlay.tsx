// CanvasOverlay.tsx
import React, { useRef, useEffect, CSSProperties } from "react";

interface CanvasOverlayProps {
  selectedLetters: { letter: string; pos: number }[];
  getLetterPosition: (index: number) => { x: number; y: number };
}

const CanvasOverlay: React.FC<CanvasOverlayProps> = ({
  selectedLetters,
  getLetterPosition,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#FFFFFF";
        for (let i = 1; i < selectedLetters.length; i++) {
          const start = selectedLetters[i - 1];
          const end = selectedLetters[i];
          const startPos = getLetterPosition(start.pos);
          const endPos = getLetterPosition(end.pos);
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(endPos.x, endPos.y);
          ctx.stroke();
        }
      }
    }
  }, [selectedLetters, getLetterPosition]);

  const canvasStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0,
    width: "100%",
    height: "100%",
  };

  return <canvas ref={canvasRef} style={canvasStyle} />;
};

export default CanvasOverlay;
