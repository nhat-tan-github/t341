'use client';

import React from 'react';
import { useMaze } from '@/context/MazeContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Algorithm } from '@/lib/algorithms';
import { RefreshCw, Play, Square, Settings, Zap } from 'lucide-react';

const ControlPanel: React.FC = () => {
  const {
    selectedAlgorithm,
    setSelectedAlgorithm,
    generateNewMaze,
    startVisualization,
    resetVisualization,
    isVisualizing,
    visualizationSpeed,
    setVisualizationSpeed,
    rows,
    setRows,
    cols,
    setCols,
    isGenerating,
  } = useMaze();

  return (
    <div className="flex flex-col space-y-6 h-full">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Zap className="w-6 h-6 text-accent" />
        Maze Explorer
      </h1>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="algorithm-select" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Pathfinding Algorithm
        </Label>
        <Select
          value={selectedAlgorithm}
          onValueChange={(value) => setSelectedAlgorithm(value as Algorithm)}
          disabled={isVisualizing || isGenerating}
        >
          <SelectTrigger id="algorithm-select" className="w-full">
            <SelectValue placeholder="Select Algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Algorithm.AStar}>A* Search</SelectItem>
            <SelectItem value={Algorithm.BFS}>Breadth-First Search (BFS)</SelectItem>
            <SelectItem value={Algorithm.BestFirst}>Best-First Search</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> Maze Dimensions
        </Label>
         <div className="space-y-2">
           <div className="flex justify-between text-sm text-muted-foreground">
            <span>Rows: {rows}</span>
           </div>
           <Slider
             value={[rows]}
             onValueChange={(value) => setRows(value[0])}
             min={5}
             max={50}
             step={1}
             disabled={isVisualizing || isGenerating}
             aria-label="Maze Rows"
           />
         </div>
         <div className="space-y-2">
           <div className="flex justify-between text-sm text-muted-foreground">
              <span>Columns: {cols}</span>
           </div>
           <Slider
             value={[cols]}
             onValueChange={(value) => setCols(value[0])}
             min={5}
             max={50}
             step={1}
             disabled={isVisualizing || isGenerating}
             aria-label="Maze Columns"
           />
         </div>
          <Button
              onClick={generateNewMaze}
              disabled={isVisualizing || isGenerating}
              className="w-full"
              variant="secondary"
          >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate New Maze'}
          </Button>
      </div>


      <Separator />

      <div className="space-y-2">
        <Label htmlFor="speed-slider" className="flex items-center gap-2">
          <Settings className="w-4 h-4" /> Visualization Speed
        </Label>
        <Slider
          id="speed-slider"
          value={[visualizationSpeed]}
          onValueChange={(value) => setVisualizationSpeed(value[0])}
          min={10} // Faster (ms delay)
          max={200} // Slower (ms delay)
          step={10}
          disabled={isVisualizing || isGenerating}
          aria-label="Visualization Speed"
        />
         <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fast</span>
            <span>Slow</span>
          </div>
      </div>


      <div className="flex-grow"></div> {/* Pushes buttons to bottom */}

       <div className="space-y-2">
         <Button
           onClick={startVisualization}
           disabled={isVisualizing || isGenerating}
           className="w-full"
         >
           <Play className="mr-2 h-4 w-4" />
           Start Visualization
         </Button>
         <Button
           onClick={resetVisualization}
           disabled={isGenerating} /* Allow reset even during visualization */
           variant="outline"
           className="w-full"
         >
           <Square className="mr-2 h-4 w-4" />
           Reset
         </Button>
       </div>
    </div>
  );
};

export default ControlPanel;
```