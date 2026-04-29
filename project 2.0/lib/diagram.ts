export type ShapeType = 'process' | 'decision' | 'terminal' | 'data' | 'note';
export type PortPosition = 'top' | 'right' | 'bottom' | 'left';

export interface DiagramNode {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  description: string;
  color: string;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  fromPort: PortPosition;
  toNodeId: string;
  toPort: PortPosition;
  label?: string;
}

export interface DiagramState {
  nodes: DiagramNode[];
  connections: Connection[];
}

// Default dimensions for each shape type
export const SHAPE_DEFAULTS: Record<ShapeType, { width: number; height: number }> = {
  process: { width: 160, height: 80 },
  decision: { width: 120, height: 120 },
  terminal: { width: 140, height: 60 },
  data: { width: 160, height: 80 },
  note: { width: 160, height: 100 },
};

// Color palette for nodes
export const NODE_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#6366F1', // indigo
  '#84CC16', // lime
  '#F97316', // orange
];

// Get the anchor point for a port on a node
export function getPortPosition(
  node: DiagramNode,
  port: PortPosition
): { x: number; y: number } {
  switch (port) {
    case 'top':
      return { x: node.x + node.width / 2, y: node.y };
    case 'right':
      return { x: node.x + node.width, y: node.y + node.height / 2 };
    case 'bottom':
      return { x: node.x + node.width / 2, y: node.y + node.height };
    case 'left':
      return { x: node.x, y: node.y + node.height / 2 };
  }
}

// Find the closest port on a target node from a source point
export function findClosestPort(
  sourcePoint: { x: number; y: number },
  targetNode: DiagramNode
): PortPosition {
  const ports: PortPosition[] = ['top', 'right', 'bottom', 'left'];
  let closest: PortPosition = 'left';
  let minDist = Infinity;

  for (const port of ports) {
    const pos = getPortPosition(targetNode, port);
    const dist = Math.hypot(pos.x - sourcePoint.x, pos.y - sourcePoint.y);
    if (dist < minDist) {
      minDist = dist;
      closest = port;
    }
  }
  return closest;
}
