# Stdio adapter so Glama (and any container host) can start the server and
# introspect tools. The product itself is the hosted remote endpoint:
# https://domainsearchking.com/api/mcp (no install, no API key).
#
# Glama only needs initialize + tools/list to score quality; tools/call is
# forwarded to the live remote server when the container has network.

FROM node:22-slim
WORKDIR /app
COPY stdio-server.mjs .
ENTRYPOINT ["node", "stdio-server.mjs"]
