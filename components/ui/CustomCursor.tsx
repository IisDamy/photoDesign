import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as flubber from "flubber";
import { starPath, circlePath, blood } from '@/constants';
import { motion, animate, useAnimate } from 'framer-motion';
import useMousePosition from '../../hooks/useMousePosition';

interface CustomCursorProps {
cursorState:string
}

const Customcursor = ({cursorState}:CustomCursorProps) => {

const {x,y} = useMousePosition()
const progress = useRef(0);
const raf = useRef(null);
const [path, setPath] = useState(starPath)
 const [scope, animate] = useAnimate();



  // start animation AFTER 5 seconds
useEffect(() => {
    const from = path;
    const to = cursorState === 'center' ? circlePath : starPath ;

    const mixer = flubber.interpolate(from, to);
    
    progress.current = 0;

  const animationStart = () => {
      progress.current += 0.01; // speed

      

      setPath(mixer(progress.current));

      if (progress.current < 1) {
        raf.current = requestAnimationFrame(animationStart);
      }
    };
    
  
    animationStart();
    
    return () => cancelAnimationFrame(raf.current);
    
    
  }, [cursorState]);



  return (
    <>
        <motion.svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.6 57.4" className='h-8 w-8 fixed p-0 scale-[0.7] z-2 ' 

                ref={scope}
                initial={{
                  top:'50%',
                  right:'50%'
                }}
                animate={{
                  top:y,
                  right:-x,
                    x:-1400,
                    y:-100,
                    rotate: cursorState === 'center'?360:0
                   
                }}
            //     animate={{
            // webkitMaskPosition: `${x  - (size/2)}px ${y  - (size/2) }px`,
            // webkitMaskSize: `${size}px`,
            // }}
            transition={{ type: "tween", ease:"backOut", duration:1.3, 
              rotate:{ duration: 0.8,
          ease: "easeInOut",}
            }}
       
          
        >
        {/* <defs>
          
          <mask id='mask'> */}
         
          <motion.path
      
          d={path}
          transform={`translate(-270.4 -386)`}
     
          animate={{
            fill:cursorState==='right'?'#c4b5fd': cursorState==='left'?'#f9a8d4':blood
          }}
          transition={{
            delay:0.3
          }}
        />


          {/* </mask>
        </defs> */}
             {/* <g mask='url(#mask)'>  */}
              {/* <motion.image  href='/images/heaven.jpg'  className="w-[300] h-[440]" 
             preserveAspectRatio="xMidYMid slice"  
          />  */}
          {/* <motion.image href='/images/wavy.svg' className='opacity-[90%]  w-[100%] h-[100%]'  transform='translate(0 0)' fill={blood} 
          preserveAspectRatio="xMidYMid slice" 
            style={{
              fill:'red'
            }}
          />
          
             </g>
      */}
     
          
       
       
        {/* {viewBox="300 410 40 40"} */}
            {/* <circle cx={`17.75`} cy={`13.75`} r="13.75" fill='red'/>
            <path d={star} fill="#ed1c24" transform="translate(-290.50 -411.19)"/>  */}
            
        </motion.svg>   
        
    </>
    
   
  )
}

export default Customcursor