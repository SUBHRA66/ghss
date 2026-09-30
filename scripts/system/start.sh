#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

pm2 start "$PROJECT_ROOT/common/ecosystem.config.js"
