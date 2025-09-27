#!/bin/sh
npm run start &    # Start Next.js in the background
caddy run --config /etc/caddy/Caddyfile   # Start Caddy in the foreground