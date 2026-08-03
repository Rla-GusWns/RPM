#!/bin/sh
# Preview the project page locally: ./serve.sh  then open http://localhost:8123
cd "$(dirname "$0")" || exit 1
echo "Serving on http://localhost:8123  (Ctrl+C to stop)"
exec python3 -m http.server 8123
