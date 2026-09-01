# Stdio adapter so Glama (and any container host) can start the server and
# introspect tools. The product itself is the hosted remote endpoint:
# https://domainsearchking.com/api/mcp (no install, no API key).
#
# Glama ignores this file and wraps: mcp-proxy -- node stdio-server.mjs
# stdout MUST be newline-delimited JSON (no LSP Content-Length headers).

FROM node:22-slim
WORKDIR /app
COPY stdio-server.mjs .
ENTRYPOINT ["node", "stdio-server.mjs"]
