import React, { useEffect, useState } from 'react'
import AnimatedLine from '@/components/ui/AnimatedLine'




function LoadingPage() {
    const [imgsReady, setImgsReady] = useState(false)
    const [imagesLoaded, setImagesLoaded] = useState(0);
     const imageUrls = [
    '/images/micheal-up.png',
    '/images/micheal-down.png'
  ];
const height = window.screen.availHeight 
    useEffect(()=>{
        setImgsReady(imagesLoaded === imageUrls.length? true:false)
    },[imagesLoaded])

    const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1);
  };

  return (
  
      
      <div className={`fixed h-full min-h-[1080]`} >
        <AnimatedLine ready={imgsReady}/>
        <img src={imageUrls[0]} className=" relative bottom-[20] left-[25]  h-full " onLoad={handleImageLoad}/>
        <img src={imageUrls[1]} className=" relative bottom-[760] left-[15]  h-full" onLoad={handleImageLoad}/>
    </div>
  
  )
}

export default LoadingPage