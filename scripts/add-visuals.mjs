import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const markerStart = "{/* visual-map:start */}";
const markerEnd = "{/* visual-map:end */}";

const imageMap = new Map([
  ["gameplay/gui-menus.mdx", ["inventory-menu.webp", "A chest-style Server Navigator menu rendered as a practical plugin UI."]],
  ["gameplay/inventories-items.mdx", ["inventory-menu.webp", "A practical inventory view with plugin-owned buttons and pagination controls."]],
  ["guides/inventory-items.mdx", ["inventory-menu.webp", "A practical inventory view with plugin-owned buttons and pagination controls."]],
  ["modern/custom-screens.mdx", ["inventory-menu.webp", "A server-driven inventory screen on an unmodified client."]],
  ["modern/menu-view-builders.mdx", ["inventory-menu.webp", "A typed chest view used as a server navigator."]],
  ["tutorials/gui-menu.mdx", ["inventory-menu.webp", "The finished menu layout used by this tutorial."]],
  ["tutorials/paginated-menu.mdx", ["inventory-menu.webp", "A paginated menu with previous and next controls."]],
  ["modern/dialogs.mdx", ["dialog-confirmation.webp", "A modern confirmation dialog with input and explicit actions."]],
  ["tutorials/modern-dialog-confirmation.mdx", ["dialog-confirmation.webp", "The confirmation experience built in this tutorial."]],
  ["gameplay/entities.mdx", ["display-hologram.webp", "A TextDisplay, ItemDisplay, and Interaction entity combined into one clickable hologram."]],
  ["modern/display-entities.mdx", ["display-hologram.webp", "A TextDisplay, ItemDisplay, and Interaction entity combined into one clickable hologram."]],
  ["tutorials/display-hologram.mdx", ["display-hologram.webp", "The clickable reward hologram built in this tutorial."]],
  ["gameplay/item-meta.mdx", ["item-components.webp", "Component-driven custom items with distinct models and behaviors."]],
  ["modern/item-components.mdx", ["item-components.webp", "A consumable, tool, blocking item, and equippable item powered by modern components."]],
  ["modern/resource-packs-models.mdx", ["item-components.webp", "Resource-pack models turn logical plugin items into distinct client visuals."]],
  ["tutorials/custom-consumable.mdx", ["item-components.webp", "A component-driven consumable alongside other modern custom items."]],
  ["tutorials/custom-item.mdx", ["item-components.webp", "Custom item identity, presentation, and behavior are separate concerns."]],
]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === ".git") return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return entry.isFile() && entry.name.endsWith(".mdx") ? [absolute] : [];
  });
}

function frontmatterValue(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, "m"));
  return match ? match[1].replace(/^["']|["']$/g, "") : null;
}

function cleanLabel(value, fallback) {
  const text = (value || fallback)
    .replace(/[`*_{}[\]<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 34 ? `${text.slice(0, 31)}...` : text;
}

function quote(value) {
  return `"${value.replace(/"/g, "'")}"`;
}

function diagramFor(relative, title) {
  const p = relative.toLowerCase();
  const topic = cleanLabel(title, path.basename(relative, ".mdx"));

  if (p.includes("event")) {
    return [
      "flowchart LR",
      `  A["Server action"] --> B[${quote(topic)}]`,
      '  B --> C["Registered listener"]',
      '  C --> D{"Validate state"}',
      '  D -->|Allowed| E["Apply result"]',
      '  D -->|Rejected| F["Leave unchanged"]',
    ].join("\n");
  }

  if (p.includes("command")) {
    return [
      "flowchart LR",
      '  A["Command sender"] --> B["Parse arguments"]',
      '  B --> C{"Permission and input valid?"}',
      '  C -->|Yes| D["Call service"]',
      '  C -->|No| E["Return feedback"]',
      `  D --> F[${quote(topic)}]`,
    ].join("\n");
  }

  if (p.includes("permission")) {
    return [
      "flowchart TD",
      '  A["Player or sender"] --> B{"Has permission?"}',
      '  B -->|Yes| C["Run protected action"]',
      '  B -->|No| D["Explain denial"]',
      '  C --> E["Audit or persist result"]',
    ].join("\n");
  }

  if (p.includes("scheduler") || p.includes("async") || p.includes("performance")) {
    return [
      "flowchart LR",
      '  A["Main thread snapshot"] --> B["Async I/O or CPU work"]',
      '  B --> C["Schedule continuation"]',
      '  C --> D{"State still valid?"}',
      '  D -->|Yes| E["Apply on main thread"]',
      '  D -->|No| F["Discard stale result"]',
    ].join("\n");
  }

  if (
    p.includes("inventory") ||
    p.includes("menu") ||
    p.includes("custom-screen") ||
    p.includes("dialog")
  ) {
    return [
      "flowchart TD",
      '  A["Create view or dialog"] --> B["Open for player"]',
      '  B --> C["Receive interaction"]',
      '  C --> D{"Session and action valid?"}',
      '  D -->|Yes| E["Run domain action"]',
      '  D -->|No| F["Ignore or close"]',
      '  E --> G["Render next state"]',
    ].join("\n");
  }

  if (
    p.includes("entity") ||
    p.includes("mob") ||
    p.includes("projectile") ||
    p.includes("display-hologram")
  ) {
    return [
      "flowchart LR",
      '  A["Spawn or obtain entity"] --> B["Configure public API"]',
      '  B --> C["Listen for lifecycle events"]',
      '  C --> D["Update owned state"]',
      '  D --> E["Remove and clean up"]',
    ].join("\n");
  }

  if (
    p.includes("world") ||
    p.includes("chunk") ||
    p.includes("block") ||
    p.includes("structure") ||
    p.includes("generator") ||
    p.includes("noise") ||
    p.includes("region")
  ) {
    return [
      "flowchart TD",
      '  A["Server"] --> B["World"]',
      '  B --> C["Loaded chunk"]',
      '  C --> D["Block state"]',
      '  C --> E["Entities"]',
      '  D --> F["Events and updates"]',
      '  E --> F',
    ].join("\n");
  }

  if (
    p.includes("item") ||
    p.includes("recipe") ||
    p.includes("loot") ||
    p.includes("potion") ||
    p.includes("enchant") ||
    p.includes("consumable") ||
    p.includes("trim")
  ) {
    return [
      "flowchart LR",
      '  A["Logical item ID"] --> B["ItemStack"]',
      '  B --> C["ItemMeta and components"]',
      '  C --> D["Client presentation"]',
      '  B --> E["Persistent data"]',
      '  E --> F["Server-side validation"]',
    ].join("\n");
  }

  if (
    p.includes("config") ||
    p.includes("serial") ||
    p.includes("database") ||
    p.includes("persistent") ||
    p.includes("metadata") ||
    p.includes("data-pack") ||
    p.includes("registry") ||
    p.includes("tag")
  ) {
    return [
      "flowchart LR",
      '  A["External or stored data"] --> B["Parse"]',
      '  B --> C{"Validate schema"}',
      '  C -->|Valid| D["Domain model"]',
      '  C -->|Invalid| E["Targeted error"]',
      `  D --> F[${quote(topic)}]`,
    ].join("\n");
  }

  if (
    p.includes("plugin-messaging") ||
    p.includes("proxies") ||
    p.includes("external-apis") ||
    p.includes("cross-server")
  ) {
    return [
      "sequenceDiagram",
      "  participant P as Plugin",
      "  participant S as Server",
      "  participant X as External system",
      "  P->>S: Validate request",
      "  S->>X: Send bounded message",
      "  X-->>S: Return response",
      "  S-->>P: Apply on main thread",
    ].join("\n");
  }

  if (
    p.includes("getting-started") ||
    p.endsWith("quickstart.mdx") ||
    p.endsWith("introduction.mdx") ||
    p.endsWith("index.mdx") ||
    p.includes("first-plugin") ||
    p.includes("maven") ||
    p.includes("gradle") ||
    p.includes("project-structure") ||
    p.includes("test-server")
  ) {
    return [
      "flowchart LR",
      '  A["Java source"] --> B["Maven or Gradle"]',
      '  B --> C["Plugin JAR"]',
      '  C --> D["Test server plugins folder"]',
      '  D --> E["Enable, test, iterate"]',
    ].join("\n");
  }

  if (p.includes("lifecycle") || p.includes("java-plugin")) {
    return [
      "stateDiagram-v2",
      '  [*] --> Loaded',
      '  Loaded --> Enabled: onEnable',
      '  Enabled --> Runtime: listeners and tasks',
      '  Runtime --> Disabled: onDisable',
      '  Disabled --> [*]',
    ].join("\n");
  }

  if (
    p.includes("architecture") ||
    p.includes("services") ||
    p.includes("dependencies") ||
    p.includes("plugin-api")
  ) {
    return [
      "flowchart TD",
      '  A["Commands and listeners"] --> B["Application services"]',
      '  B --> C["Domain rules"]',
      '  B --> D["Bukkit adapter"]',
      '  B --> E["Repository or integration"]',
      '  D --> F["Minecraft server"]',
    ].join("\n");
  }

  if (p.includes("tutorials/")) {
    return [
      "flowchart LR",
      `  A[${quote(topic)}] --> B["Build the core"]`,
      '  B --> C["Register entry points"]',
      '  C --> D["Handle edge cases"]',
      '  D --> E["Test and ship"]',
    ].join("\n");
  }

  if (p.includes("api-reference/packages/")) {
    return [
      "flowchart LR",
      '  A["Your plugin"] --> B["Public package types"]',
      '  B --> C["Interfaces and events"]',
      '  C --> D["Server implementation"]',
      '  D --> E["Minecraft behavior"]',
    ].join("\n");
  }

  if (p.includes("api-reference/") || p.includes("api/")) {
    return [
      "flowchart LR",
      '  A["Plugin code"] --> B["Public API contract"]',
      '  B --> C["Server-owned object"]',
      '  C --> D["Validated mutation"]',
      '  D --> E["Observable game state"]',
    ].join("\n");
  }

  if (
    p.includes("player") ||
    p.includes("profile") ||
    p.includes("message") ||
    p.includes("scoreboard") ||
    p.includes("boss-bar") ||
    p.includes("server-links")
  ) {
    return [
      "flowchart LR",
      '  A["Player state"] --> B["Plugin service"]',
      '  B --> C["Bukkit player API"]',
      '  C --> D["Client feedback"]',
      '  C --> E["Server-side result"]',
    ].join("\n");
  }

  return [
    "flowchart LR",
    '  A["Plugin entry point"] --> B["Validate context"]',
    `  B --> C[${quote(topic)}]`,
    '  C --> D["Bukkit API"]',
    '  D --> E["Server result"]',
  ].join("\n");
}

function insertAfterIntro(content, block) {
  const frontmatter = content.match(/^---\n[\s\S]*?\n---\n/);
  let position = frontmatter ? frontmatter[0].length : 0;

  while (content[position] === "\n" || content[position] === "\r") position += 1;

  if (content.startsWith("# ", position)) {
    const headingEnd = content.indexOf("\n", position);
    position = headingEnd === -1 ? content.length : headingEnd + 1;
    while (content[position] === "\n" || content[position] === "\r") position += 1;
  }

  const nextBreak = content.indexOf("\n\n", position);
  const firstLine = content.slice(position, content.indexOf("\n", position));
  if (
    position < content.length &&
    !firstLine.startsWith("<") &&
    !firstLine.startsWith("#") &&
    !firstLine.startsWith("```")
  ) {
    position = nextBreak === -1 ? content.length : nextBreak;
  }

  return (
    content.slice(0, position).trimEnd() +
    "\n\n" +
    block +
    "\n\n" +
    content.slice(position).trimStart()
  );
}

let updated = 0;
for (const absolute of walk(root)) {
  const relative = path.relative(root, absolute).replaceAll(path.sep, "/");
  let content = fs.readFileSync(absolute, "utf8");
  if (content.includes(markerStart)) {
    const start = content.indexOf(markerStart);
    const end = content.indexOf(markerEnd, start);
    if (end !== -1) {
      content =
        content.slice(0, start).trimEnd() +
        "\n\n" +
        content.slice(end + markerEnd.length).trimStart();
    }
  }

  const title = frontmatterValue(content, "title") || path.basename(relative, ".mdx");
  const image = imageMap.get(relative);
  const imageBlock = image
    ? `<Frame caption="${image[1]}">\n  ![${title} example](/assets/modern/${image[0]})\n</Frame>\n\n`
    : "";
  const diagram = diagramFor(relative, title);
  const visualBlock = `${markerStart}\n${imageBlock}## Visual map\n\n\`\`\`mermaid\n${diagram}\n\`\`\`\n${markerEnd}`;

  content = insertAfterIntro(content, visualBlock);
  fs.writeFileSync(absolute, content);
  updated += 1;
}

console.log(`Added visuals to ${updated} MDX pages.`);
