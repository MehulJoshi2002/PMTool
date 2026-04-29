"use client";

import React from "react";
import { Connection, DiagramNode, getPortPosition } from "../../lib/diagram";

interface ConnectionLineProps {
  connection: Connection;
  nodes: DiagramNode[];
  isSelected: boolean;
  onClick: (connectionId: string) => void;
}

export default function ConnectionLine({
  connection,
  nodes,
  isSelected,
  onClick,
}: ConnectionLineProps) {
  const fromNode = nodes.find((n) => n.id === connection.fromNodeId);
  const toNode = nodes.find((n) => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const start = getPortPosition(fromNode, connection.fromPort);
  const end = getPortPosition(toNode, connection.toPort);

  // Calculate control points for a smooth cubic bezier curve
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy);
  const curvature = Math.min(dist * 0.4, 80);

  let cp1 = { x: start.x, y: start.y };
  let cp2 = { x: end.x, y: end.y };

  // Push control points outward from port direction
  switch (connection.fromPort) {
    case "top":
      cp1 = { x: start.x, y: start.y - curvature };
      break;
    case "right":
      cp1 = { x: start.x + curvature, y: start.y };
      break;
    case "bottom":
      cp1 = { x: start.x, y: start.y + curvature };
      break;
    case "left":
      cp1 = { x: start.x - curvature, y: start.y };
      break;
  }

  switch (connection.toPort) {
    case "top":
      cp2 = { x: end.x, y: end.y - curvature };
      break;
    case "right":
      cp2 = { x: end.x + curvature, y: end.y };
      break;
    case "bottom":
      cp2 = { x: end.x, y: end.y + curvature };
      break;
    case "left":
      cp2 = { x: end.x - curvature, y: end.y };
      break;
  }

  const pathD = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;

  // Calculate arrow head at the end
  const arrowLength = 10;
  const arrowAngle = Math.PI / 6;
  // Tangent at end: derivative of cubic bezier at t=1
  const tx = 3 * (end.x - cp2.x);
  const ty = 3 * (end.y - cp2.y);
  const angle = Math.atan2(ty, tx);
  const a1x = end.x - arrowLength * Math.cos(angle - arrowAngle);
  const a1y = end.y - arrowLength * Math.sin(angle - arrowAngle);
  const a2x = end.x - arrowLength * Math.cos(angle + arrowAngle);
  const a2y = end.y - arrowLength * Math.sin(angle + arrowAngle);

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onClick(connection.id);
      }}
      style={{ cursor: "pointer" }}
    >
      {/* Invisible fat hit area */}
      <path d={pathD} fill="none" stroke="transparent" strokeWidth={16} />

      {/* Visible line */}
      <path
        d={pathD}
        fill="none"
        stroke={isSelected ? "#3B82F6" : "#475569"}
        strokeWidth={isSelected ? 2.5 : 1.8}
        strokeLinecap="round"
        style={{
          transition: "stroke 0.2s, stroke-width 0.2s",
          filter: isSelected ? "drop-shadow(0 0 6px #3B82F644)" : undefined,
        }}
      />

      {/* Arrow head */}
      <polygon
        points={`${end.x},${end.y} ${a1x},${a1y} ${a2x},${a2y}`}
        fill={isSelected ? "#3B82F6" : "#475569"}
        style={{ transition: "fill 0.2s" }}
      />

      {/* Connection label */}
      {connection.label && (
        <text
          x={(start.x + end.x) / 2}
          y={(start.y + end.y) / 2 - 8}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={11}
          fontWeight={600}
          style={{ pointerEvents: "none" }}
        >
          {connection.label}
        </text>
      )}
    </g>
  );
}
