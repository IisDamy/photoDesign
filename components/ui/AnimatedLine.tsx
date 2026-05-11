import { useEffect, useRef } from "react";
import gsap from "gsap";




export default function AnimatedLine({ready}:{ready:boolean}) {
  const entryRef = useRef(null);
  const bottomRef = useRef(null);
  const squareCloseRef = useRef(null);
  const exitRef = useRef(null);
  // const {width, height} = useWindowDimensions()

  useEffect(() => {
    const paths = [
      entryRef.current,
      bottomRef.current,
      squareCloseRef.current,
      exitRef.current,
    ];

    paths.forEach((path) => {
      const length = path.getTotalLength();

      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
    });

    const tl = gsap.timeline();


    if (ready) {
      tl.to(entryRef.current, {
      strokeDashoffset: 0,
      duration: 1,
      ease: "none",
    });

    // 2. down + bottom edge
    tl.to(bottomRef.current, {
      strokeDashoffset: 0,
      duration: 0.8,
      ease: "none",
    });

    // 3. square closes + exit line at same time
    tl.to(
      squareCloseRef.current,
      {
        strokeDashoffset: 0,
        duration: 1,
        ease: "none",
      }
    );

    tl.to(
      exitRef.current,
      {
        strokeDashoffset: 0,
        duration: 1,
        ease: "none",
      },
      "<"
    );
    }
    // 1. incoming l {ine
    

  }, [ready]);

  const width = window.screen.availWidth 
  const height = window.screen.availHeight 
  const size = 28;

  const cx = width / 2;
  const cy = height / 2;

  const x1 = cx - size / 2;
  const x2 = cx + size / 2;

  const y1 = cy;
  const y2 = cy + size;

  
  return (
    <svg
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* incoming line */}
      <path
        ref={entryRef}
        d={`M 0 ${cy} L ${cx - size / 2} ${cy}`}
        stroke="white"
        strokeWidth="1"
        fill="none"
      />

      {/* down then bottom */}
      <path
        ref={bottomRef}
        d={`
          M ${x1} ${y1}
          L ${x1} ${y2}
          L ${x2} ${y2}
        `}
        stroke="white"
        strokeWidth="1"
        fill="none"
      />

      {/* closes square:
          up → left → down */}
      <path
        ref={squareCloseRef}
        d={`
          M ${x2} ${y2}
          L ${x2} ${y1}
          L ${x1} ${y1}
         
        `}
        stroke="white"
        strokeWidth="1"
        fill="none"
      />

      {/* outgoing line */}
      <path
        ref={exitRef}
          d={`
    M ${cx + size / 2} ${cy + size}
    L ${width} ${cy + size}
  `}
        stroke="white"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}