"use client";

import React from "react";
import { DiagramNode as DiagramNodeType, PortPosition } from "../../lib/diagram";

interface DiagramNodeProps {
  node: DiagramNodeType;
  isSelected: boolean;
  isConnecting: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onDoubleClick: (nodeId: string) => void;
  onPortClick: (nodeId: string, port: PortPosition) => void;
  onPortMouseEnter: (nodeId: string, port: PortPosition) => void;
  onPortMouseLeave: () => void;
}

// Render the correct SVG shape for the node type
function renderShape(node: DiagramNodeType, isSelected: boolean) {
  const strokeColor = isSelected ? "#3B82F6" : "rgba(255,255,255,0.12)";
  const strokeWidth = isSelected ? 2.5 : 1;
  const fillColor = node.color + "22"; // very transparent fill
  const solidFill = node.color;

  switch (node.type) {
    case "process":
      return (
        <rect
          x={0}
          y={0}
          width={node.width}
          height={node.height}
          rx={12}
          ry={12}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          style={{ filter: isSelected ? `drop-shadow(0 0 12px ${node.color}44)` : undefined }}
        />
      );
    case "decision":
      const cx = node.width / 2;
      const cy = node.height / 2;
      return (
        <polygon
          points={`${cx},0 ${node.width},${cy} ${cx},${node.height} 0,${cy}`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          style={{ filter: isSelected ? `drop-shadow(0 0 12px ${node.color}44)` : undefined }}
        />
      );
    case "terminal":
      return (
        <rect
          x={0}
          y={0}
          width={node.width}
          height={node.height}
          rx={node.height / 2}
          ry={node.height / 2}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          style={{ filter: isSelected ? `drop-shadow(0 0 12px ${node.color}44)` : undefined }}
        />
      );
    case "data":
      const skew = 20;
      return (
        <polygon
          points={`${skew},0 ${node.width},0 ${node.width - skew},${node.height} 0,${node.height}`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          style={{ filter: isSelected ? `drop-shadow(0 0 12px ${node.color}44)` : undefined }}
        />
      );
    case "note":
      const fold = 16;
      return (
        <>
          <path
            d={`M0,0 L${node.width - fold},0 L${node.width},${fold} L${node.width},${node.height} L0,${node.height} Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            style={{ filter: isSelected ? `drop-shadow(0 0 12px ${node.color}44)` : undefined }}
          />
          <path
            d={`M${node.width - fold},0 L${node.width - fold},${fold} L${node.width},${fold}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth * 0.7}
          />
        </>
      );
  }
}

// Port dots in the 4 cardinal positions
const PORT_POSITIONS: PortPosition[] = ["top", "right", "bottom", "left"];

function getPortOffset(
  port: PortPosition,
  width: number,
  height: number
): { cx: number; cy: number } {
  switch (port) {
    case "top":
      return { cx: width / 2, cy: 0 };
    case "right":
      return { cx: width, cy: height / 2 };
    case "bottom":
      return { cx: width / 2, cy: height };
    case "left":
      return { cx: 0, cy: height / 2 };
  }
}

export default function DiagramNodeComponent({
  node,
  isSelected,
  isConnecting,
  onMouseDown,
  onDoubleClick,
  onPortClick,
  onPortMouseEnter,
  onPortMouseLeave,
}: DiagramNodeProps) {
  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e, node.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(node.id);
      }}
      className="cursor-move"
      style={{ transition: "filter 0.2s" }}
    >
      {/* Shape */}
      {renderShape(node, isSelected)}

      {/* Label text */}
      <foreignObject x={0} y={0} width={node.width} height={node.height}>
        <div
          style={{
            width: node.width,
            height: node.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 12px",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              color: "#e2e8f0",
              fontSize: 13,
              fontWeight: 600,
              textAlign: "center",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical" as const,
              wordBreak: "break-word",
            }}
          >
            {node.label || "Untitled"}
          </span>
        </div>
      </foreignObject>

      {/* Connection Ports — always visible so users can click to connect */}
      {PORT_POSITIONS.map((port) => {
          const pos = getPortOffset(port, node.width, node.height);
          return (
            <g key={port}>
              {/* Larger invisible hit target */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={14}
                fill="transparent"
                style={{ cursor: "crosshair" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPortClick(node.id, port);
                }}
                onMouseEnter={() => onPortMouseEnter(node.id, port)}
                onMouseLeave={onPortMouseLeave}
              />
              {/* Visible dot — always visible but subtle, brighter on selected/connecting */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={isSelected || isConnecting ? 6 : 4}
                fill={isSelected || isConnecting ? "#3B82F6" : "#475569"}
                stroke="#1e293b"
                strokeWidth={2}
                style={{
                  cursor: "crosshair",
                  transition: "r 0.15s, fill 0.15s",
                  pointerEvents: "none",
                  opacity: isSelected || isConnecting ? 1 : 0.6,
                }}
              />
            </g>
          );
        })}
    </g>
  );
}
