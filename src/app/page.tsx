import type { Metadata } from 'next';
import { MazeProvider } from '@/context/MazeContext';
import MazeGrid from '@/components/MazeGrid';
import ControlPanel from '@/components/ControlPanel';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Maze Explorer',
  description: 'Visualize pathfinding algorithms in a maze.',
};

export default function Home() {
  return (
    <MazeProvider>
      <main className="flex flex-col lg:flex-row min-h-screen items-stretch bg-background">
        <div className="flex-grow flex items-center justify-center p-4 lg:p-8 overflow-auto">
          <MazeGrid />
        </div>
        <div className="w-full lg:w-80 bg-card border-l border-border p-4 lg:p-6 flex-shrink-0 shadow-lg">
          <ControlPanel />
        </div>
      </main>
      <Toaster />
    </MazeProvider>
  );
}
