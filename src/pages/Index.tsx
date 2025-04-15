
import React, { useState, useEffect, useRef } from 'react';
import BarChart from '@/components/BarChart';
import FootPressure from '@/components/FootPressure';
import VideoControls from '@/components/VideoControls';

// Mock data for Step Time Mean
const stepTimeData = {
  walking: [
    { group: 'Flatfeet', value: 0.56, error: 0.03 },
    { group: 'NormalArch', value: 0.56, error: 0.03 }
  ],
  jogging: [
    { group: 'Flatfeet', value: 0.40, error: 0.02 },
    { group: 'NormalArch', value: 0.39, error: 0.02 }
  ]
};

// Mock data for Stride Time Mean
const strideTimeData = {
  walking: [
    { group: 'Flatfeet', value: 1.12, error: 0.08 },
    { group: 'NormalArch', value: 1.13, error: 0.06 }
  ],
  jogging: [
    { group: 'Flatfeet', value: 0.80, error: 0.04 },
    { group: 'NormalArch', value: 0.81, error: 0.09 }
  ]
};

// Generate foot pressure data (simulated)
const generateFootPressureData = (startTime: number, duration: number, cycles: number) => {
  const data = [];
  const cycleTime = duration / cycles;
  
  for (let i = 0; i < duration * 10; i++) {
    const time = startTime + (i / 10);
    const cyclePosition = (time % cycleTime) / cycleTime;
    
    // Create heel pressure curve (peaks earlier in the cycle)
    const heelPressure = cyclePosition < 0.5 
      ? 150 * Math.sin(cyclePosition * Math.PI) 
      : 0;
    
    // Create toe pressure curve (peaks later in the cycle)
    const toePressure = cyclePosition > 0.3 && cyclePosition < 0.8
      ? 120 * Math.sin((cyclePosition - 0.3) * Math.PI / 0.5)
      : 0;
    
    data.push({
      time,
      heelPressure,
      toePressure
    });
  }
  
  return data;
};

// Generate foot pressure data for both feet
const leftFootData = generateFootPressureData(80, 10, 10);
const rightFootData = generateFootPressureData(80, 10, 10);

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  
  // Animation duration in seconds
  const DURATION = 15;
  
  // Animation loop
  const animate = (timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;
    
    setCurrentTime(prevTime => {
      const newTime = prevTime + deltaTime;
      if (newTime >= DURATION) {
        setIsPlaying(false);
        return DURATION;
      }
      return newTime;
    });
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  
  // Start/stop animation
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);
  
  // Play/pause handlers
  const handlePlay = () => {
    setIsPlaying(true);
    lastTimeRef.current = null;
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  
  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold">Step Time and Stride Time Analysis</h1>
          <p className="text-gray-600 mt-2">
            Comparison of Gait Parameters Between Flatfeet and Normal Arch Conditions
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Step Time Mean */}
          <BarChart
            title="Step Time Mean (s)"
            yAxisTitle="Time (s)"
            data={stepTimeData}
            maxValue={0.7}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={DURATION / 2}
          />
          
          {/* Stride Time Mean */}
          <BarChart
            title="Stride Time Mean (s)"
            yAxisTitle="Time (s)"
            data={strideTimeData}
            maxValue={1.3}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={DURATION / 2}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Left Foot Pressure */}
          <FootPressure
            title="Left Foot (Heel=Blue, Toe=Red)"
            data={leftFootData}
            maxPressure={180}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={DURATION}
            startTime={80}
            endTime={90}
          />
          
          {/* Right Foot Pressure */}
          <FootPressure
            title="Right Foot (Heel=Blue, Toe=Red)"
            data={rightFootData}
            maxPressure={180}
            isPlaying={isPlaying}
            currentTime={currentTime - DURATION / 2}
            duration={DURATION / 2}
            startTime={80}
            endTime={90}
          />
        </div>
        
        <div className="mb-8">
          <VideoControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={DURATION}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={handleReset}
            onSeek={handleSeek}
          />
        </div>
        
        <div className="bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-4">Figure 15: Step Time and Stride Time Mean During Walking and Jogging</h2>
          <p className="text-gray-700 mb-4">
            The visualization above demonstrates the differences in step and stride times between individuals with flatfeet and those with normal arch structures. The top charts show bar graphs comparing these metrics during walking and jogging activities, while the bottom charts visualize the actual pressure patterns in the left and right foot over time.
          </p>
          <p className="text-gray-700">
            Key observations include:
          </p>
          <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
            <li>Step and stride times decrease when transitioning from walking to jogging for both foot types</li>
            <li>The heel pressure (blue) peaks before toe pressure (red) in the gait cycle</li>
            <li>Minimal differences in temporal parameters between foot types suggest compensatory mechanisms</li>
            <li>The pressure graphs illustrate the heel-to-toe transition during each step</li>
          </ul>
        </div>
        
        <footer className="mt-10 text-center text-gray-500 text-sm">
          Data visualization of walking and running biomechanics parameters
        </footer>
      </div>
    </div>
  );
};

export default Index;
