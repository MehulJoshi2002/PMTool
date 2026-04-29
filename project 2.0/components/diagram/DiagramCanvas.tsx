"use client";

import React, { useRef, useState, useCallback } from "react";
import {
  DiagramNode as DiagramNodeType,
  Connection,
  ShapeType,
  PortPosition,
  SHAPE_DEFAULTS,
  NODE_COLORS,
  getPortPosition,
  findClosestPort,
} from "../../lib/diagram";
import DiagramNodeComponent from "./DiagramNode";
import ConnectionLine from "./ConnectionLine";

interface DiagramCanvasProps {
  nodes: DiagramNodeType[];
  connections: Connection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  activeTool: "select" | "connect" | null;
  onAddNode: (node: DiagramNodeType) => void;
  onUpdateNode: (id: string, updates: Partial<DiagramNodeType>) => void;
  onSelectNode: (id: string | null) => void;
  onSelectConnection: (id: string | null) => void;
  onAddConnection: (conn: Connection) => void;
  onStartEdit: (id: string) => void;
}

const GRID_SIZE = 20;

export default function DiagramCanvas({
  nodes,
  connections,
  selectedNodeId,
  selectedConnectionId,
  activeTool,
  onAddNode,
  onUpdateNode,
  onSelectNode,
  onSelectConnection,
  onAddConnection,
  onStartEdit,
}: DiagramCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Pan & zoom state
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 3000, h: 2000 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  // Drag node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Connection creation state
  const [pendingConnection, setPendingConnection] = useState<{
    fromNodeId: string;
    fromPort: PortPosition;
  } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredPort, setHoveredPort] = useState<{
    nodeId: string;
    port: PortPosition;
  } | null>(null);

  // Convert screen coordinates to SVG coordinates
  const screenToSVG = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = viewBox.w / rect.width;
      const scaleY = viewBox.h / rect.height;
      return {
        x: (clientX - rect.left) * scaleX + viewBox.x,
        y: (clientY - rect.top) * scaleY + viewBox.y,
      };
    },
    [viewBox]
  );

  // ---- DROP HANDLER ----
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const shapeType = e.dataTransfer.getData("application/shape-type") as ShapeType;
      if (!shapeType) return;

      const pos = screenToSVG(e.clientX, e.clientY);
      const defaults = SHAPE_DEFAULTS[shapeType];
      const color = NODE_COLORS[nodes.length % NODE_COLORS.length];

      const newNode: DiagramNodeType = {
        id: crypto.randomUUID(),
        type: shapeType,
        x: Math.round((pos.x - defaults.width / 2) / GRID_SIZE) * GRID_SIZE,
        y: Math.round((pos.y - defaults.height / 2) / GRID_SIZE) * GRID_SIZE,
        width: defaults.width,
        height: defaults.height,
        label:
          shapeType === "terminal"
            ? "Start"
            : shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
        description: "",
        color,
      };
      onAddNode(newNode);
      onSelectNode(newNode.id);
    },
    [screenToSVG, nodes.length, onAddNode, onSelectNode]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // ---- MOUSE HANDLERS ----

  // Canvas background click = deselect
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === svgRef.current || (e.target as SVGElement).classList.contains("grid-bg")) {
        onSelectNode(null);
        onSelectConnection(null);
        setPendingConnection(null);

        // Start panning
        setIsPanning(true);
        panStart.current = {
          x: e.clientX,
          y: e.clientY,
          vx: viewBox.x,
          vy: viewBox.y,
        };
      }
    },
    [onSelectNode, onSelectConnection, viewBox]
  );

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (activeTool === "connect") return; // don't drag in connect mode
      onSelectNode(nodeId);
      onSelectConnection(null);
      setPendingConnection(null);

      const pos = screenToSVG(e.clientX, e.clientY);
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      dragOffset.current = { x: pos.x - node.x, y: pos.y - node.y };
      setDraggingNodeId(nodeId);
    },
    [activeTool, screenToSVG, nodes, onSelectNode, onSelectConnection]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = screenToSVG(e.clientX, e.clientY);
      setMousePos(pos);

      if (isPanning) {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const scaleX = viewBox.w / rect.width;
        const scaleY = viewBox.h / rect.height;
        setViewBox((prev) => ({
          ...prev,
          x: panStart.current.vx - (e.clientX - panStart.current.x) * scaleX,
          y: panStart.current.vy - (e.clientY - panStart.current.y) * scaleY,
        }));
        return;
      }

      if (draggingNodeId) {
        const newX = Math.round((pos.x - dragOffset.current.x) / GRID_SIZE) * GRID_SIZE;
        const newY = Math.round((pos.y - dragOffset.current.y) / GRID_SIZE) * GRID_SIZE;
        onUpdateNode(draggingNodeId, { x: newX, y: newY });
      }
    },
    [isPanning, draggingNodeId, screenToSVG, viewBox.w, viewBox.h, onUpdateNode]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);

  // ---- ZOOM ----
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      const pos = screenToSVG(e.clientX, e.clientY);

      setViewBox((prev) => {
        const newW = Math.max(800, Math.min(8000, prev.w * zoomFactor));
        const newH = Math.max(500, Math.min(5000, prev.h * zoomFactor));
        const newX = pos.x - ((pos.x - prev.x) / prev.w) * newW;
        const newY = pos.y - ((pos.y - prev.y) / prev.h) * newH;
        return { x: newX, y: newY, w: newW, h: newH };
      });
    },
    [screenToSVG]
  );

  // ---- CONNECTION CREATION ----
  const handlePortClick = useCallback(
    (nodeId: string, port: PortPosition) => {
      if (!pendingConnection) {
        // First click: start connection
        setPendingConnection({ fromNodeId: nodeId, fromPort: port });
      } else {
        // Second click: finish connection
        if (pendingConnection.fromNodeId === nodeId) {
          // Can't connect to self
          setPendingConnection(null);
          return;
        }

        // Check for duplicate connections
        const exists = connections.some(
          (c) =>
            c.fromNodeId === pendingConnection.fromNodeId &&
            c.toNodeId === nodeId
        );
        if (exists) {
          setPendingConnection(null);
          return;
        }

        const newConn: Connection = {
          id: crypto.randomUUID(),
          fromNodeId: pendingConnection.fromNodeId,
          fromPort: pendingConnection.fromPort,
          toNodeId: nodeId,
          toPort: port,
        };
        onAddConnection(newConn);
        setPendingConnection(null);
      }
    },
    [pendingConnection, connections, onAddConnection]
  );

  // Pending connection preview line
  const renderPendingLine = () => {
    if (!pendingConnection) return null;
    const fromNode = nodes.find((n) => n.id === pendingConnection.fromNodeId);
    if (!fromNode) return null;
    const start = getPortPosition(fromNode, pendingConnection.fromPort);

    // Snap to hovered port if available
    let end = mousePos;
    if (hoveredPort) {
      const targetNode = nodes.find((n) => n.id === hoveredPort.nodeId);
      if (targetNode) {
        end = getPortPosition(targetNode, hoveredPort.port);
      }
    }

    return (
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="#3B82F6"
        strokeWidth={2}
        strokeDasharray="6 4"
        style={{ pointerEvents: "none" }}
      />
    );
  };

  // ---- RENDER ----
  return (
    <div className="flex-1 relative overflow-hidden bg-[#0f0f1a]">
      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 z-10 bg-white/5 backdrop-blur-sm text-gray-400 text-xs px-3 py-1.5 rounded-lg border border-white/5 font-mono">
        {Math.round((3000 / viewBox.w) * 100)}%
      </div>

      {/* Connection mode indicator */}
      {pendingConnection && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-blue-600/20 backdrop-blur-sm text-blue-300 text-xs px-4 py-2 rounded-full border border-blue-500/30 font-medium animate-pulse">
          Click a port on another shape to connect
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="w-full h-full"
        style={{ cursor: isPanning ? "grabbing" : draggingNodeId ? "move" : "default" }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Grid pattern */}
        <defs>
          <pattern id="grid-small" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
            <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r={0.8} fill="rgba(255,255,255,0.06)" />
          </pattern>
          <pattern id="grid-large" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
            <circle cx={GRID_SIZE * 2.5} cy={GRID_SIZE * 2.5} r={1.2} fill="rgba(255,255,255,0.1)" />
          </pattern>
        </defs>

        {/* Grid background */}
        <rect
          x={viewBox.x - 1000}
          y={viewBox.y - 1000}
          width={viewBox.w + 2000}
          height={viewBox.h + 2000}
          fill="url(#grid-small)"
          className="grid-bg"
        />
        <rect
          x={viewBox.x - 1000}
          y={viewBox.y - 1000}
          width={viewBox.w + 2000}
          height={viewBox.h + 2000}
          fill="url(#grid-large)"
          className="grid-bg"
        />

        {/* Connections */}
        {connections.map((conn) => (
          <ConnectionLine
            key={conn.id}
            connection={conn}
            nodes={nodes}
            isSelected={selectedConnectionId === conn.id}
            onClick={(id) => {
              onSelectConnection(id);
              onSelectNode(null);
            }}
          />
        ))}

        {/* Pending connection line */}
        {renderPendingLine()}

        {/* Nodes */}
        {nodes.map((node) => (
          <DiagramNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isConnecting={activeTool === "connect" || !!pendingConnection || true}
            onMouseDown={handleNodeMouseDown}
            onDoubleClick={onStartEdit}
            onPortClick={handlePortClick}
            onPortMouseEnter={(nodeId, port) => setHoveredPort({ nodeId, port })}
            onPortMouseLeave={() => setHoveredPort(null)}
          />
        ))}
      </svg>
    </div>
  );
}
