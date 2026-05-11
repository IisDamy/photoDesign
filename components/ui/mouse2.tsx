'use client'
import {motion} from 'motion/react';
import useMousePosition from '../../hooks/useMousePosition';
import MaskBackground from './MaskBackground';
import { useEffect, useRef, useState } from 'react';
export default function Mouse2(){
const { x, y } = useMousePosition();
const size = 300;

// 
const [mouseInside, setMouseInside] = useState(true);
const lastPosition = useRef({ x: 0, y: 0 });

useEffect(() => {
  const handleMouseLeave = () => setMouseInside(false);
  const handleMouseEnter = () => setMouseInside(true);
  
  window.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('mouseenter', handleMouseEnter);
  
  return () => {
    window.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('mouseenter', handleMouseEnter);
  };
}, []);

useEffect(() => {
  if (mouseInside && x !== null && y !== null) {
    lastPosition.current = { x, y };
  }
}, [x, y, mouseInside]);


const displayX = mouseInside ? x : lastPosition.current.x;
const displayY = mouseInside ? y : lastPosition.current.y;
// 

    return (
            <motion.div
            className='w-full border-l-[2]  border-violet-300 m-0 p-0 h-full flex items-center justify-center text-[#afa18f] text-[64px] leading-[66px] cursor-none '
            style={{
                maskImage: "url('/images/fluff.png')",
                maskRepeat: 'no-repeat',
                maskSize: '300px',
                overflow:'visible',
                color: 'black',

                
    
                
            }}
            
            animate={{
            webkitMaskPosition: `${displayX  - (size/2)-1100}px ${displayY  - (size/2) }px`,
            webkitMaskSize: `${size}px`,
            }}
            transition={{ type: "tween", ease:"backOut", duration:1.3 }}
            >
                 <div className='bg-black h-full w-full'>

                 </div>
              
            </motion.div>

       
    )
}