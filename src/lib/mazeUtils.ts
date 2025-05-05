import { Algorithm } from './algorithms';
import { PriorityQueue } from './priorityQueue'; // Assuming a PriorityQueue implementation

export enum CellType {
  Path,
  Wall,
  Start,
  End,
  Visited,
  Solution,
}

export interface Point {
  row: number;
  col: number;
}

export interface PathResult {
    path: Point[];
    visited: Point[]; // All cells explored by the algorithm
}


// --- Maze Generation (Recursive Backtracker) ---

export function generateMaze(rows: number, cols: number): { maze: CellType[][], start: Point, end: Point } {
  // Ensure odd dimensions for better maze structure
  rows = rows % 2 === 0 ? rows + 1 : rows;
  cols = cols % 2 === 0 ? cols + 1 : cols;

  const maze: CellType[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(CellType.Wall)
  );

  const start: Point = { row: 1, col: 1 }; // Start at top-left (inner)
  const end: Point = { row: rows - 2, col: cols - 2 }; // End at bottom-right (inner)

  const stack: Point[] = [];
  const visited = new Set<string>();

  function getKey(p: Point): string {
    return `${p.row}-${p.col}`;
  }

  function isValid(r: number, c: number): boolean {
    return r >= 0 && r < rows && c >= 0 && c < cols;
  }

  function carve(p: Point) {
    maze[p.row][p.col] = CellType.Path;
    visited.add(getKey(p));
    stack.push(p);
  }

  carve(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1]; // Peek
    const neighbors: Point[] = [];

    const directions = [
      { dr: -2, dc: 0 }, // Up
      { dr: 2, dc: 0 },  // Down
      { dr: 0, dc: -2 }, // Left
      { dr: 0, dc: 2 },  // Right
    ];

    // Shuffle directions for randomness
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }


    for (const dir of directions) {
      const nr = current.row + dir.dr;
      const nc = current.col + dir.dc;

      if (isValid(nr, nc) && !visited.has(getKey({ row: nr, col: nc }))) {
        neighbors.push({ row: nr, col: nc });
      }
    }

    if (neighbors.length > 0) {
      // Choose a random neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];

      // Carve the wall between current and next
      const wallRow = current.row + (next.row - current.row) / 2;
      const wallCol = current.col + (next.col - current.col) / 2;
      maze[wallRow][wallCol] = CellType.Path;

      carve(next);
    } else {
      stack.pop(); // Backtrack
    }
  }

  // Ensure start and end are paths (might be overwritten if generation is weird)
   maze[start.row][start.col] = CellType.Path;
   maze[end.row][end.col] = CellType.Path;


  return { maze, start, end };
}


// --- Pathfinding ---

function getNeighbors(point: Point, maze: CellType[][]): Point[] {
  const neighbors: Point[] = [];
  const rows = maze.length;
  const cols = maze[0].length;
  const directions = [
    { dr: -1, dc: 0 }, // Up
    { dr: 1, dc: 0 },  // Down
    { dr: 0, dc: -1 }, // Left
    { dr: 0, dc: 1 },  // Right
  ];

  for (const dir of directions) {
    const nr = point.row + dir.dr;
    const nc = point.col + dir.dc;

    if (
      nr >= 0 &&
      nr < rows &&
      nc >= 0 &&
      nc < cols &&
      maze[nr][nc] !== CellType.Wall
    ) {
      neighbors.push({ row: nr, col: nc });
    }
  }
  return neighbors;
}

function reconstructPath(cameFrom: Map<string, Point | null>, current: Point, start: Point): Point[] {
    const path: Point[] = [current];
    let temp: Point | null = current;
    const startKey = `${start.row}-${start.col}`;

    while (temp && `${temp.row}-${temp.col}` !== startKey) {
        const currentKey = `${temp.row}-${temp.col}`;
        temp = cameFrom.get(currentKey) ?? null;
        if (temp) {
             path.unshift(temp); // Add to the beginning
        }
    }
    return path;
}


// Heuristic function (Manhattan distance) for A* and Best-First
function heuristic(a: Point, b: Point): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}


export function findPath(
  maze: CellType[][],
  start: Point,
  end: Point,
  algorithm: Algorithm
): PathResult | null {
  switch (algorithm) {
    case Algorithm.AStar:
      return aStar(maze, start, end);
    case Algorithm.BFS:
      return bfs(maze, start, end);
    case Algorithm.BestFirst:
      return bestFirstSearch(maze, start, end);
    default:
      console.error('Unknown algorithm:', algorithm);
      return null;
  }
}

// --- A* Search ---
function aStar(maze: CellType[][], start: Point, end: Point): PathResult | null {
    const startKey = `${start.row}-${start.col}`;
    const endKey = `${end.row}-${end.col}`;

    const openSet = new PriorityQueue<Point>((a, b) => (gScore.get(`${a.row}-${a.col}`) ?? Infinity) + heuristic(a, end) < (gScore.get(`${b.row}-${b.col}`) ?? Infinity) + heuristic(b, end));
    const cameFrom = new Map<string, Point | null>();
    const gScore = new Map<string, number>(); // Cost from start to node
    const visitedForAnim: Point[] = []; // Track visited order for animation

    gScore.set(startKey, 0);
    openSet.enqueue(start);
    cameFrom.set(startKey, null);

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue()!;
        const currentKey = `${current.row}-${current.col}`;
        visitedForAnim.push(current); // Record visit for animation

        if (currentKey === endKey) {
            const path = reconstructPath(cameFrom, current, start);
            return { path, visited: visitedForAnim };
        }

        for (const neighbor of getNeighbors(current, maze)) {
            const neighborKey = `${neighbor.row}-${neighbor.col}`;
            const tentativeGScore = (gScore.get(currentKey) ?? Infinity) + 1; // Assume cost of 1 per step

            if (tentativeGScore < (gScore.get(neighborKey) ?? Infinity)) {
                // This path to neighbor is better than any previous one. Record it!
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                 if (!openSet.has((p) => `${p.row}-${p.col}` === neighborKey)) {
                     openSet.enqueue(neighbor);
                 } else {
                     // If it's already in the open set, update its position if necessary
                     // Our PriorityQueue doesn't have explicit update, re-enqueueing works
                     // but is less efficient. For simplicity, we'll stick to this.
                     // A more optimized version would update the priority.
                 }
            }
        }
    }

    // Open set is empty but goal was never reached
    return { path: [], visited: visitedForAnim }; // Return visited even if no path found
}


// --- Breadth-First Search (BFS) ---
function bfs(maze: CellType[][], start: Point, end: Point): PathResult | null {
    const startKey = `${start.row}-${start.col}`;
    const endKey = `${end.row}-${end.col}`;

    const queue: Point[] = [start];
    const visited = new Set<string>([startKey]);
    const cameFrom = new Map<string, Point | null>();
    const visitedForAnim: Point[] = []; // Track visited order for animation

    cameFrom.set(startKey, null);

    while (queue.length > 0) {
        const current = queue.shift()!; // Dequeue
        const currentKey = `${current.row}-${current.col}`;
        visitedForAnim.push(current); // Record visit for animation


        if (currentKey === endKey) {
             const path = reconstructPath(cameFrom, current, start);
             return { path, visited: visitedForAnim };
        }

        for (const neighbor of getNeighbors(current, maze)) {
            const neighborKey = `${neighbor.row}-${neighbor.col}`;
            if (!visited.has(neighborKey)) {
                visited.add(neighborKey);
                cameFrom.set(neighborKey, current);
                queue.push(neighbor);
            }
        }
    }

    // Queue is empty, but goal was never reached
    return { path: [], visited: visitedForAnim }; // Return visited even if no path found
}


// --- Best-First Search (Greedy) ---
function bestFirstSearch(maze: CellType[][], start: Point, end: Point): PathResult | null {
    const startKey = `${start.row}-${start.col}`;
    const endKey = `${end.row}-${end.col}`;

    const openSet = new PriorityQueue<Point>((a, b) => heuristic(a, end) < heuristic(b, end));
    const cameFrom = new Map<string, Point | null>();
    const visited = new Set<string>(); // Track visited to avoid cycles
    const visitedForAnim: Point[] = []; // Track visited order for animation


    openSet.enqueue(start);
    cameFrom.set(startKey, null);
    visited.add(startKey);


    while (!openSet.isEmpty()) {
        const current = openSet.dequeue()!;
        const currentKey = `${current.row}-${current.col}`;
        visitedForAnim.push(current); // Record visit for animation


        if (currentKey === endKey) {
             const path = reconstructPath(cameFrom, current, start);
             return { path, visited: visitedForAnim };
        }

        for (const neighbor of getNeighbors(current, maze)) {
            const neighborKey = `${neighbor.row}-${neighbor.col}`;
             if (!visited.has(neighborKey)) {
                 visited.add(neighborKey); // Mark as visited when adding to queue
                 cameFrom.set(neighborKey, current);
                 openSet.enqueue(neighbor);
            }
        }
    }

    // Open set is empty but goal was never reached
    return { path: [], visited: visitedForAnim }; // Return visited even if no path found
}
```