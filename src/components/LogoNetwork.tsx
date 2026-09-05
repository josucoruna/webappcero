export function LogoNetwork({ className }: { className?: string }) {
  const nodes = {
    top: { x: 50, y: 20 },
    left: { x: 25, y: 46 },
    right: { x: 75, y: 46 },
    bottomLeft: { x: 33, y: 79 },
    bottomRight: { x: 67, y: 79 },
  };

  const edges: [keyof typeof nodes, keyof typeof nodes][] = [
    ["top", "left"],
    ["top", "right"],
    ["left", "right"],
    ["left", "bottomLeft"],
    ["right", "bottomRight"],
    ["bottomLeft", "bottomRight"],
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="LuaOne"
      className={className}
    >
      <rect x="0" y="0" width="100" height="100" rx="22" fill="#0f766e" />
      {edges.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="#ffffff"
          strokeOpacity={a === "left" && b === "right" ? 0.6 : 1}
          strokeWidth="2.5"
        />
      ))}
      {Object.values(nodes).map((node, i) => (
        <circle key={i} cx={node.x} cy={node.y} r="8" fill="#ffffff" />
      ))}
    </svg>
  );
}
