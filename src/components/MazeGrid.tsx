
'use client';

import React, { useEffect, useState } from 'react';
import { useMaze } from '@/context/MazeContext';
import { CellType } from '@/lib/mazeUtils';
import { Play, Flag, Star } from 'lucide-react';

const MazeGrid: React.FC = () => {
  const {
    maze,
    visitedCells,
    solutionPath,
    start,
    end,
    rows,
    cols,
    isVisualizing,
  } = useMaze();
  const [gridVersion, setGridVersion] = useState(0); // Force re-render on maze change

  useEffect(() => {
    setGridVersion((v) => v + 1);
  }, [maze, start, end]); // Update when maze structure changes

  if (!maze || maze.length === 0 || maze[0].length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        Đang tạo mê cung...
      </div>
    );
  }

   const getCellClass = (
     row: number,
     col: number,
     cellType: CellType
   ): string => {
     const isStart = row === start.row && col === start.col;
     const isEnd = row === end.row && col === end.col;
     const cellKey = `${row}-${col}`;
     const isSolution = solutionPath.has(cellKey);
     const isVisited = visitedCells.has(cellKey);

     if (isStart) return 'maze-cell-start';
     if (isEnd) return 'maze-cell-end';
     if (isSolution) return 'maze-cell-solution';
     if (isVisited && !isVisualizing) return 'maze-cell-visited'; // Only show static visited after visualization
     if (cellType === CellType.Wall) return 'maze-cell-wall';
     return 'maze-cell-path';
   };

   // Helper function to translate CellType enum to Vietnamese string
   const getCellTypeVietnamese = (cellType: CellType): string => {
      switch (cellType) {
          case CellType.Path: return "Đường đi";
          case CellType.Wall: return "Tường";
          case CellType.Start: return "Bắt đầu"; // Technically handled by icon
          case CellType.End: return "Kết thúc"; // Technically handled by icon
          case CellType.Visited: return "Đã thăm";
          case CellType.Solution: return "Đường giải";
          default: return "Không xác định";
      }
   }


   const getCellContent = (row: number, col: number) => {
     if (row === start.row && col === start.col) {
       return <Play className="maze-icon" aria-label="Bắt đầu" />;
     }
     if (row === end.row && col === end.col) {
       return <Star className="treasure-icon" aria-label="Kho báu" />;
     }
     return null;
   };

  return (
    <div
      key={gridVersion} // Use key to ensure re-render
      className="grid border border-border shadow-md rounded-lg overflow-hidden bg-card"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        width: `${cols * 1.25}rem`, // 1.25rem = 20px (w-5)
        height: `${rows * 1.25}rem`, // 1.25rem = 20px (h-5)
        aspectRatio: `${cols} / ${rows}`,
        maxWidth: '90vw',
        maxHeight: '80vh',
      }}
      role="grid"
      aria-label="Lưới Mê Cung"
    >
      {maze.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const cellKey = `${rowIndex}-${colIndex}`;
          const isCurrentVisited = isVisualizing && visitedCells.has(cellKey);
          const cellClass = getCellClass(rowIndex, colIndex, cell);
          const cellTypeVietnamese = getCellTypeVietnamese(cell);
          let ariaLabel = `Ô ${rowIndex}, ${colIndex}: ${cellTypeVietnamese}`;
           if (rowIndex === start.row && colIndex === start.col) {
               ariaLabel = `Ô ${rowIndex}, ${colIndex}: Bắt đầu`;
           } else if (rowIndex === end.row && colIndex === end.col) {
               ariaLabel = `Ô ${rowIndex}, ${colIndex}: Kho báu (Kết thúc)`;
           } else if (solutionPath.has(cellKey)) {
               ariaLabel = `Ô ${rowIndex}, ${colIndex}: Phần của đường giải`;
           } else if (visitedCells.has(cellKey)) {
               ariaLabel = `Ô ${rowIndex}, ${colIndex}: Đã thăm`;
           }


          return (
            <div
              key={cellKey}
              className={`maze-cell ${cellClass} ${
                isCurrentVisited ? 'maze-cell-visited' : ''
              }`}
              role="gridcell"
              aria-label={ariaLabel}
            >
              {getCellContent(rowIndex, colIndex)}
            </div>
          );
        })
      )}
    </div>
  );
};

export default MazeGrid;
