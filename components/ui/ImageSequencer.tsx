'use client'
import { useEffect, useState } from "react";

const images = ["/images/boywithgun5.png", "/images/boywithgun4.png", "/images/boywithgun6.png","/images/boywithgun2.png","/images/boywithgun.png"];
const delays = [0, 1000, 1000, 1000,1000]; // relative delays

export default function ImageSequence() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= images.length) return;
   
    const timer = setTimeout(() => {
      setVisibleCount((v) => v + 1);

    }, delays[visibleCount]);

    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="flex items-center w-full h-[100%]  justify-center relative right-[35]">
      {images.slice(0, visibleCount).map((src, i) => (
        //invert 
        <img key={i} alt="boy with gun" src={src} className={`absolute bottom-0 max-w-none  w-[680px] `} style={{}} />
      ))}
    </div>
  );
}
