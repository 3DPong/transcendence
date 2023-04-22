import HomeScreen3D from "@/components/Organism/Home/Renderer/Renderer";

export function Home() {
  return (
      <div className=" absolute -z-50 w-0 h-0">
        <HomeScreen3D width={window.innerWidth} height={window.innerHeight} />
      </div>
  );
}