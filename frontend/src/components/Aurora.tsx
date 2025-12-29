import { useEffect, useRef } from "react";
const Aurora = () => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (canvasRef.current) {} }, []);
  return <div ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-primary/20 via-background to-secondary/30 opacity-90" />;
};
export default Aurora;