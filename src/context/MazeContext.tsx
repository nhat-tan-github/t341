'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  generateMaze,
  CellType,
  Point,
  findPath,
  PathResult,
} from '@/lib/mazeUtils';
import { Algorithm } from '@/lib/algorithms';
import { useToast } from '@/hooks/use-toast';

interface MazeContextProps {
  rows: number;
  setRows: (rows: number) => void;
  cols: number;
  setCols: (cols: number) => void;
  maze: CellType[][] | null;
  start: Point;
  end: Point;
  visitedCells: Set<string>; // Store visited cells as "row-col" strings
  solutionPath: Set<string>; // Store solution path as "row-col" strings
  selectedAlgorithm: Algorithm;
  setSelectedAlgorithm: (algorithm: Algorithm) => void;
  visualizationSpeed: number;
  setVisualizationSpeed: (speed: number) => void;
  isVisualizing: boolean;
  isGenerating: boolean;
  generateNewMaze: () => void;
  startVisualization: () => void;
  resetVisualization: () => void;
}

const MazeContext = createContext<MazeContextProps | undefined>(undefined);

export const MazeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [rows, setRowsState] = useState(21); // Default odd number for better mazes
  const [cols, setColsState] = useState(31); // Default odd number
  const [maze, setMaze] = useState<CellType[][] | null>(null);
  const [start, setStart] = useState<Point>({ row: 1, col: 1 });
  const [end, setEnd] = useState<Point>({ row: rows - 2, col: cols - 2 });
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [solutionPath, setSolutionPath] = useState<Set<string>>(new Set());
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>(
    Algorithm.AStar
  );
  const [visualizationSpeed, setVisualizationSpeed] = useState(50); // milliseconds delay
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true); // Start generating initially
  const visualizationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const setRows = (newRows: number) => {
    // Ensure odd number
    setRowsState(newRows % 2 === 0 ? newRows + 1 : newRows);
  };

  const setCols = (newCols: number) => {
    // Ensure odd number
    setColsState(newCols % 2 === 0 ? newCols + 1 : newCols);
  };

   const clearVisualizationState = useCallback(() => {
     if (visualizationTimeoutRef.current) {
       clearTimeout(visualizationTimeoutRef.current);
       visualizationTimeoutRef.current = null;
     }
     setVisitedCells(new Set());
     setSolutionPath(new Set());
     setIsVisualizing(false);
   }, []);


  const generateNewMaze = useCallback(async () => {
    clearVisualizationState();
    setIsGenerating(true);
    setMaze(null); // Clear maze while generating
    // Generate maze in a non-blocking way
    await new Promise(resolve => setTimeout(resolve, 0));
    try {
      const { maze: newMaze, start: newStart, end: newEnd } = generateMaze(rows, cols);
      setStart(newStart);
      setEnd(newEnd);
      setMaze(newMaze);
      // Ensure start/end are always paths
      if (newMaze[newStart.row][newStart.col] === CellType.Wall) {
        newMaze[newStart.row][newStart.col] = CellType.Path;
      }
       if (newMaze[newEnd.row][newEnd.col] === CellType.Wall) {
         newMaze[newEnd.row][newEnd.col] = CellType.Path;
       }

    } catch (error) {
      console.error("Error generating maze:", error);
      toast({
        title: "Maze Generation Failed",
        description: "Could not generate the maze. Please try again.",
        variant: "destructive",
      });
       // Generate a simple fallback maze? Or leave it null?
       // For now, leave null, user can try again.
    } finally {
       setIsGenerating(false);
    }

  }, [rows, cols, clearVisualizationState, toast]);


  // Generate initial maze on mount
  useEffect(() => {
    generateNewMaze();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cols]); // Regenerate if dimensions change via controls

  const animateSteps = useCallback(
    (steps: Point[], isSolution: boolean, onComplete?: () => void) => {
      let i = 0;
      const step = () => {
        if (i >= steps.length) {
          if (onComplete) onComplete();
          return;
        }
        const { row, col } = steps[i];
        const cellKey = `${row}-${col}`;

        if (isSolution) {
            setSolutionPath((prev) => new Set(prev).add(cellKey));
        } else {
            // Don't add start/end to visited animation
            if(!(row === start.row && col === start.col) && !(row === end.row && col === end.col)) {
                setVisitedCells((prev) => new Set(prev).add(cellKey));
            }
        }

        i++;
        visualizationTimeoutRef.current = setTimeout(step, visualizationSpeed);
      };
      step();
    },
    [visualizationSpeed, start, end]
  );

  const startVisualization = useCallback(async () => {
    if (!maze || isVisualizing || isGenerating) return;

    clearVisualizationState();
    setIsVisualizing(true);

    // Find path in a non-blocking way
    await new Promise(resolve => setTimeout(resolve, 0));

    const result: PathResult | null = findPath(
      maze,
      start,
      end,
      selectedAlgorithm
    );


    if (!result || result.path.length === 0) {
      toast({
        title: "Pathfinding Failed",
        description: "No path found to the treasure.",
        variant: "destructive",
      });
      // Animate visited cells even if no path is found
       if (result && result.visited) {
           animateSteps(result.visited, false, () => {
             setIsVisualizing(false); // Finish visualization after showing visited
           });
       } else {
           setIsVisualizing(false);
       }
      return;
    }

    // Animate visited cells first
    animateSteps(result.visited, false, () => {
      // Then animate the solution path
      animateSteps(result.path, true, () => {
        setIsVisualizing(false); // Visualization complete
        toast({
            title: "Treasure Found!",
            description: `Path found using ${selectedAlgorithm}. Length: ${result.path.length}`,
        })
      });
    });
  }, [
    maze,
    start,
    end,
    selectedAlgorithm,
    isVisualizing,
    isGenerating,
    animateSteps,
    clearVisualizationState,
    toast
  ]);

  const resetVisualization = useCallback(() => {
    clearVisualizationState();
    // Optionally, regenerate maze or just clear paths
    // generateNewMaze(); // Uncomment to generate a new maze on reset
  }, [clearVisualizationState]);


  return (
    <MazeContext.Provider
      value={{
        rows,
        setRows,
        cols,
        setCols,
        maze,
        start,
        end,
        visitedCells,
        solutionPath,
        selectedAlgorithm,
        setSelectedAlgorithm,
        visualizationSpeed,
        setVisualizationSpeed,
        isVisualizing,
        isGenerating,
        generateNewMaze,
        startVisualization,
        resetVisualization,
      }}
    >
      {children}
    </MazeContext.Provider>
  );
};

export const useMaze = (): MazeContextProps => {
  const context = useContext(MazeContext);
  if (!context) {
    throw new Error('useMaze must be used within a MazeProvider');
  }
  return context;
};
```