import StatsGrid from "./StatsGrid";
import HeroCarousel from "../components/HeroCarousel";

export default function Dashboard() {
  return (
    <div className="px-4 py-6 transition-colors duration-300">
      {/* HERO SECTION */}
      <HeroCarousel />

      {/* STATS GRID */}
      <div className={`mt-2 shadow-sm bg-white`}>
        <StatsGrid />
      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      </div>
    </div>
  );
}