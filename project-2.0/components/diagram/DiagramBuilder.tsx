"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  DiagramNode,
  Connection,
  SHAPE_DEFAULTS,
} from "../../lib/diagram";
import ShapeToolbar from "./ShapeToolbar";
import DiagramCanvas from "./DiagramCanvas";
import PropertiesPanel from "./PropertiesPanel";
import Link from "next/link";
import { ArrowLeft, Workflow, Save, Image, CheckCircle } from "lucide-react";

const STORAGE_KEY = "productos_diagram_v1";

export default function DiagramBuilder() {
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "connect" | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { nodes: n, connections: c } = JSON.parse(raw);
        if (n) setNodes(n);
        if (c) setConnections(c);
      }
    } catch {}
  }, []);

  // Save to localStorage
  const handleSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, connections }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  }, [nodes, connections]);

  // Export SVG diagram as PNG
  const handleExportPNG = useCallback(() => {
    const svg = document.querySelector("svg") as SVGSVGElement | null;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svg.clientWidth * 2;
      canvas.height = svg.clientHeight * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f0f1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = "roadmap-diagram.png";
      a.click();
    };
    img.src = url;
  }, []);


  // ---- NODE MUTATIONS ----
  const addNode = useCallback((node: DiagramNode) => {
    setNodes((prev) => [...prev, node]);
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<DiagramNode>) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const updated = { ...n, ...updates };
        // If shape type changed, update dimensions to match default
        if (updates.type && updates.type !== n.type) {
          const defaults = SHAPE_DEFAULTS[updates.type];
          updated.width = defaults.width;
          updated.height = defaults.height;
        }
        return updated;
      })
    );
  }, []);

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== id));
      // Also delete all connections involving this node
      setConnections((prev) =>
        prev.filter((c) => c.fromNodeId !== id && c.toNodeId !== id)
      );
      if (selectedNodeId === id) {
        setSelectedNodeId(null);
      }
    },
    [selectedNodeId]
  );

  // ---- CONNECTION MUTATIONS ----
  const addConnection = useCallback((conn: Connection) => {
    setConnections((prev) => [...prev, conn]);
  }, []);

  const deleteConnection = useCallback(
    (id: string) => {
      setConnections((prev) => prev.filter((c) => c.id !== id));
      if (selectedConnectionId === id) {
        setSelectedConnectionId(null);
      }
    },
    [selectedConnectionId]
  );

  // ---- TOOLBAR ACTIONS ----
  const handleClearAll = useCallback(() => {
    if (nodes.length === 0) return;
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
  }, [nodes.length]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    } else if (selectedConnectionId) {
      deleteConnection(selectedConnectionId);
    }
  }, [selectedNodeId, selectedConnectionId, deleteNode, deleteConnection]);

  // ---- KEYBOARD SHORTCUTS ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editingNodeId) return; // don't handle shortcuts during edit

      if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected();
      }
      if (e.key === "Escape") {
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
        setActiveTool(null);
      }
    },
    [editingNodeId, handleDeleteSelected]
  );

  // ---- INLINE EDIT ----
  const handleStartEdit = useCallback((id: string) => {
    setEditingNodeId(id);
    // Prompt for label
    const node = nodes.find((n) => n.id === id); // not reactive, just for immediate use
    const newLabel = prompt("Enter label:", node?.label || "");
    if (newLabel !== null) {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, label: newLabel } : n))
      );
    }
    setEditingNodeId(null);
  }, [nodes]);

  return (
    <div
      className="h-screen flex flex-col bg-[#0f0f1a] overflow-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Top bar */}
      <header className="h-14 bg-[#1a1a2e] border-b border-white/5 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Workflow size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">
                Roadmapping
              </h1>
              <p className="text-[10px] text-gray-500 font-medium">
                User Journeys & Flows
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/5 text-gray-400 px-3 py-1.5 rounded-lg text-xs font-mono border border-white/5">
            {nodes.length} nodes · {connections.length} connections
          </div>
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white rounded-lg text-xs font-medium transition"
          >
            <Image size={14} />
            Export PNG
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              saved
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white"
            }`}
          >
            {saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Left toolbar */}
        <ShapeToolbar
          activeTool={activeTool}
          onSetTool={setActiveTool}
          onClearAll={handleClearAll}
          onDeleteSelected={handleDeleteSelected}
          hasSelection={!!selectedNodeId || !!selectedConnectionId}
        />

        {/* Canvas */}
        <DiagramCanvas
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId}
          selectedConnectionId={selectedConnectionId}
          activeTool={activeTool}
          onAddNode={addNode}
          onUpdateNode={updateNode}
          onSelectNode={setSelectedNodeId}
          onSelectConnection={setSelectedConnectionId}
          onAddConnection={addConnection}
          onStartEdit={handleStartEdit}
        />

        {/* Right properties panel */}
        <PropertiesPanel
          node={selectedNode}
          connections={connections}
          nodes={nodes}
          onUpdateNode={updateNode}
          onDeleteNode={deleteNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}
