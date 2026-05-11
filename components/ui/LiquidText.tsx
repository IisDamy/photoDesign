"use client"
import { useEffect, useRef } from "react";
import gsap from "gsap";
import wave from '@/public/images/wave.png'

export default function WaveLoadingText() {
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    // to control speed of waves
    // can cause clipping
    gsap.to(el, {
      backgroundPositionX: "200px",
      duration: 8,
      
      ease: "linear",
    });
    
    // to control height and turbulence
    gsap.fromTo(
      el,
      { backgroundSize: "40px 0px" },
      {
        backgroundSize: "40px 200px",
        duration: 8,
       
        yoyo: true,
        ease: "power1.inOut",
      }
    );
  }, []);

  return (
    <div className="flex  items-center  absolute top-[40] justify-center "
   
    >
      <div
        ref={textRef}
        className="wave-text  border  flex items-center"
        style={{
          backgroundImage: `url(/images/wave.png)`,
          backgroundRepeat: "repeat-x",
          backgroundColor:'blue',
          backgroundPosition: "0 top",
          backgroundSize: "120px 300px",
          overflow:'visible',
          textShadow:'none',
           backgroundClip: "text",
          WebkitBackgroundClip: "text",
          fontFamily: "'Mind-explorer', sans-serif",
        }}
      >
    <p className="my-3 rotate-180 mx-4  text-center text-5xl text tracking-wider relative text-transparent bottom-[100px] "
      style={{textShadow:"none"}}
    > 
    ENTERING
      flow state
        <br />
        <span style={{fontFamily:'S'}} className="underline ">0000</span>
        <br className="mb-4"/>
        PNG
        <br/>
        
        LVL 
        <br/>
        <span style={{fontFamily:'S'}}>1</span>
      </p> 
     
    
     
      </div>
    </div>
  );
}
