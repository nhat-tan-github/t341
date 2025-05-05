
// Keep enum values in English for consistency in logic
export enum Algorithm {
  AStar = 'A*',
  BFS = 'BFS',
  BestFirst = 'Best-First',
}

// Optional: Map for display names if needed elsewhere,
// but ControlPanel handles display directly now.
/*
export const AlgorithmDisplayNames: { [key in Algorithm]: string } = {
  [Algorithm.AStar]: 'Tìm Kiếm A*',
  [Algorithm.BFS]: 'Tìm Kiếm Theo Chiều Rộng (BFS)',
  [Algorithm.BestFirst]: 'Tìm Kiếm Best-First',
};
*/
