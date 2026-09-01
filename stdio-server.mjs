#!/usr/bin/env node
// Stdio MCP adapter for directory scanners (Glama). Product path is remote HTTP:
// https://domainsearchking.com/api/mcp
const REMOTE = "https://domainsearchking.com/api/mcp";
const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = { name: "domain-search-king", version: "1.0.0" };

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

const TOOLS = [
  {
    name: "find_available_domains",
    description:
      "Generate brandable .com names for a business idea and return ONLY names currently available to register, each verified live against the Verisign RDAP registry. Use this when the user wants name ideas they can actually buy. Do not use for a single known domain (use check_domain) or an exhaustive starts/ends/contains scan (use find_available_domains_by_pattern). Read-only: does not register or transfer domains. Availability can change; re-check before purchase. Free, no API key; subject to a daily rate limit.",
    annotations: READ_ONLY,
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "Core keyword or seed word, e.g. 'coffee'.",
        },
        description: {
          type: "string",
          description:
            "Optional. What the business does, e.g. 'a cozy late-night coffee roaster'. Improves name fit.",
        },
        count: {
          type: "integer",
          description: "How many available names to return (1-24). Default 12.",
          minimum: 1,
          maximum: 24,
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "find_available_domains_by_pattern",
    description:
      "Enumerate every currently available domain matching a keyword pattern (starts-with, ends-with, contains, or all) across chosen TLDs. Use this when the user already has a keyword and wants an exhaustive list, not invented brandables. Do not use to brainstorm creative names (use find_available_domains) or to inspect one known domain (use check_domain). Every candidate is verified live against the registry; taken names are omitted. Default TLDs: .com and .net. Read-only; does not register domains.",
    annotations: READ_ONLY,
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description:
            "Keyword(s) to build around, e.g. 'bear' or 'bear, bigbear' (comma/or-separated).",
        },
        position: {
          type: "string",
          enum: ["starts", "ends", "contains", "all"],
          description:
            "Where the keyword sits in the label: starts-with, ends-with, contains, or all. Default 'all'.",
        },
        tlds: {
          type: "array",
          items: {
            type: "string",
            enum: ["com", "net", "org", "io", "co", "info"],
          },
          description: "TLDs to enumerate. Default ['com','net'].",
        },
        limit: {
          type: "integer",
          description: "Max available domains to return (1-200). Default 60.",
          minimum: 1,
          maximum: 200,
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "check_domain",
    description:
      "Due-diligence report for one known domain: live RDAP registration/age/expiry/status, backlinks and authority from our Common Crawl graph, toxic-linker flags, Wayback history, and trademark search links. Use this before buying a specific name. Do not use to generate names (use find_available_domains) or to list pattern matches (use find_available_domains_by_pattern). Read-only lookup; does not register, transfer, or change DNS. No composite appraisal score — flags and per-section detail only.",
    annotations: READ_ONLY,
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Domain to inspect, e.g. 'example.com'.",
        },
      },
      required: ["domain"],
    },
  },
];

function rpc(id, result) {
  return { jsonrpc: "2.0", id, result };
}
function rpcErr(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

async function handleMessage(msg) {
  const { id, method, params } = msg || {};
  if (!method) return null;
  switch (method) {
    case "initialize":
      return rpc(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          "Three tools: find_available_domains (brandable available .coms for a business idea), find_available_domains_by_pattern (exhaustive starts/ends/contains lists across TLDs), check_domain (due-diligence on one known domain). Naming tools return only Verisign-RDAP-verified available names. Hosted endpoint: https://domainsearchking.com/api/mcp",
      });
    case "ping":
      return rpc(id, {});
    case "notifications/initialized":
    case "notifications/cancelled":
      return null;
    case "tools/list":
      return rpc(id, { tools: TOOLS });
    case "tools/call":
      return forwardCall(id, params);
    default:
      if (id === undefined || id === null) return null;
      return rpcErr(id, -32601, `Method not found: ${method}`);
  }
}

async function forwardCall(id, params) {
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: id ?? 1,
    method: "tools/call",
    params: params || {},
  });
  try {
    const res = await fetch(REMOTE, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      body,
    });
    const text = await res.text();
    const parsed = parseRpcBody(text);
    if (parsed && Object.prototype.hasOwnProperty.call(parsed, "result")) {
      return rpc(id, parsed.result);
    }
    if (parsed && parsed.error) {
      return rpcErr(id, parsed.error.code || -32000, parsed.error.message || "remote error");
    }
    return rpcErr(id, -32000, `Remote MCP HTTP ${res.status}`);
  } catch (err) {
    return rpcErr(id, -32000, `Remote MCP unreachable: ${err.message}`);
  }
}

function parseRpcBody(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) {
    const line = trimmed
      .split(/\r?\n/)
      .map((l) => l.replace(/^data:\s?/, ""))
      .find((l) => l.startsWith("{"));
    if (line) {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function writeMessage(obj) {
  if (!obj) return;
  // mcp-proxy (Glama) speaks newline-delimited JSON, not LSP Content-Length.
  process.stdout.write(JSON.stringify(obj) + "\n");
}

if (process.stdout._handle && typeof process.stdout._handle.setBlocking === "function") {
  process.stdout._handle.setBlocking(true);
}

let buf = Buffer.alloc(0);
let draining = false;
process.stdin.on("data", (chunk) => {
  buf = Buffer.concat([buf, chunk]);
  drain().catch((err) => {
    process.stderr.write(String(err.stack || err) + "\n");
  });
});
process.stdin.on("end", () => process.exit(0));
process.stdin.resume();

async function drain() {
  if (draining) return;
  draining = true;
  try {
    while (true) {
      const msg = takeMessage();
      if (!msg) return;
      const reply = await handleMessage(msg);
      writeMessage(reply);
    }
  } finally {
    draining = false;
    if (buf.indexOf("\n") !== -1) {
      drain().catch((err) => {
        process.stderr.write(String(err.stack || err) + "\n");
      });
    }
  }
}

function takeMessage() {
  const nl = buf.indexOf("\n");
  if (nl === -1) return null;
  const line = buf.slice(0, nl).toString("utf8").replace(/\r$/, "").trim();
  buf = buf.slice(nl + 1);
  if (!line.startsWith("{")) return takeMessage();
  return JSON.parse(line);
}
