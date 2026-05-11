'use client'
import { useState, useEffect } from "react";

interface MousePosition {
  x: number | null;
  y: number | null;
}

const useMousePosition = (): MousePosition => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ 
    x: window.innerWidth/2, 
    y: window.innerHeight/2
  });

  const updateMousePosition = (e: MouseEvent): void => {
    setMousePosition({ 
      x: e.clientX, 
      y: e.clientY 
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition);

    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return mousePosition;
};

export default useMousePosition;