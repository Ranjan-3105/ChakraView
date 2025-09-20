import { useState } from 'react'
import './App.css'
import ChakraViewLogo from './ChakraViewLogo'
import Camerafeed from './CameraFeed'
import NightVision from './NightVision'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Soldier from './Soldier'
import Chat from './Message'
import { FaLocationCrosshairs } from "react-icons/fa6";


import { IoSend } from "react-icons/io5";
import MapComponent from './Mapcomponent'
function Home() {
  const [RealCameratype, setRealCameratype] = useState(true)
  const [NVCameratype, setNVCameratype] = useState(false)

  return (

    

    <div className='bg-black w-full h-screen m-0 p-0 inset-0 overflow-y-auto'>
      <div className='ml-0 mt-0 text-md'>
        {/* <ChakraViewLogo /> */}

        {/* project title */}
        <div className="bg-[#161b22] border-[#30363d] rounded-lg p-1 max-w-full overflow-x-auto shadow-green-500/30 flex items-center gap-8">
            
          {/* चक्र with strong neon glow */}
          <h1 className="text-2xl font-mono font-bold text-[#39ff14] neon-glow">
            चक्र
          </h1>
          <h1 className='font-mono font-bold  text-[#39ff14] neon-glow text-2xl ml-0'>VIEW</h1>
          <p className=' ml-100 bg-[#39ff14] p-1 text-black rounded  cursor-pointer'>Command Center</p>
          <p className='ml-10 bg-[#39ff14]  p-1 text-black rounded cursor-pointer'>
            <Link to="/soldier" className="">Soldier</Link>
          </p>



        </div>
      </div>
      <div className='w-full h-screen flex '>
        <div className='w-[25%] h-screen  border-r-2  border-r-[#39ff14]'>
          <div className='w-full h-[60px] hover:bg-[#39ff14] rounded transition duration-300 '>
            {/* each tam card */}
            <div className='w-full h-full group '>
              <p className='text-[#39ff14] font-mono text-xl ml-4 mt-3 group-hover:text-black'>Team Alpha</p>
              <div className='flex '>
                <p className='text-[#26b10d] ml-4  mt-0 font-mono text-sm group-hover:text-black '>Status</p>
                <p className='text-[#26b10d] ml-4  mt-0 font-mono text-sm group-hover:text-black '>Logistics</p>
              </div>
            </div>
          </div>
          <div className='w-full h-[60px] hover:bg-[#39ff14] rounded transition duration-300 '>
            {/* each tam card */}
            <div className='w-full h-full group '>
              <p className='text-[#39ff14] font-mono text-xl ml-4 mt-1 group-hover:text-black'>UAV1</p>
              <div className='flex group-hover:text-black'>
                <p className='text-[#26b10d] ml-4  mt-0 font-mono text-sm group-hover:text-black '>Status</p>
                <p className='text-[#26b10d] ml-4  mt-0 font-mono text-sm group-hover:text-black '>Logistics</p>
              </div>
            </div>
          </div>
          <div>
          <div className='mt-54 flex items-center'>
            {/* lat long input  */}
            <input type='text' className='bg-slate-700 w-[85%] border-2 border-[#26b10d] rounded-lg mb-1'/>
            <FaLocationCrosshairs className='text-white bg-[#26b10d] w-[30px] h-[30px] rounded-xl ml-1' />

          </div>
      <div className='texth-white w-[full] h-[250px]  border-r-2 border-t-2 border-[#39ff14]   text-white  rounded-lg'>
        {/* map form gemini headers  */}
        <MapComponent/>
        </div>
        </div>

        </div>
        <div className='w-[55%] h-screen'>
          {/* <div className='texth-white w-[35%] h-[35%]  border-r-2 border-b-2 border-[#39ff14] text-white'>map part </div> */}
          <div className='text-white flex-col ml-[13%] items-center'>
            <div>
              <label htmlFor="mode">Mode:</label>
              <select
                id="mode"
                name="mode"
                onChange={(e) => {
                  if (e.target.value === "real") {
                    setRealCameratype(true);
                    setNVCameratype(false)
                    console.log('camera selected:real')
                  }
                  else if(e.target.value==="nightvision") {
                    setNVCameratype(true);
                    setRealCameratype(false)
                    console.log('camera selected:nv')
                  }
                }}
              >
                <option value="real">Real</option>
                <option value="nightvision">Night Vision</option>
              </select>
            </div>
            <div className={RealCameratype?'block':'hidden'}>
            <Camerafeed />
            </div>
            
            <div className={` w-[200px] h-[200px] ml-30  ${NVCameratype?'block':'hidden'}`}>
              <NightVision/>
            </div>
            

            {/* <div className=''>
              <div className={RealCameratype ? 'block' : 'hidden'}>
                <Camerafeed />
              </div>
              <div className={NVCameratype ? 'block' : 'hidden'}>
                <NightVision />
              </div>
            </div> */}
          </div>
        </div>
        <div className='w-[30%] h-screen border-l-2  border-l-[#39ff14] '>
          <div className='text-white  border-b-2 w-full h-[70%] border-[#39ff14] relative'>
        <Chat/>
            
             </div>
          <div className='text-white '>emergency logistic support </div>
        </div>
      </div>

    </div>


  )
}

export default Home
