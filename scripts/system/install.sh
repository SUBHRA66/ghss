#!/usr/bin/env bash

# ============================================================
# Development Environment Setup
# Ubuntu
#
# Installs:
#   - Build tools
#   - NVM
#   - Node.js LTS
#   - npm
#   - NestJS CLI
#   - PostgreSQL
#   - Prisma CLI
# ============================================================

set -e

echo
echo "=================================================="
echo "   Development Environment Setup"
echo "=================================================="
echo

# ------------------------------------------------------------
# 1. Update system packages
# ------------------------------------------------------------

echo "[1/7] Updating package lists..."

sudo apt update

# ------------------------------------------------------------
# 2. Install system dependencies
# ------------------------------------------------------------

echo
echo "[2/7] Installing system dependencies..."

sudo apt install -y \
    curl \

# ------------------------------------------------------------
# 4. Install NVM
# ------------------------------------------------------------

echo
echo "[3/7] Setting up NVM..."

export NVM_DIR="$HOME/.nvm"

if [ ! -d "$NVM_DIR" ]; then

    echo "Installing NVM..."

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash

else

    echo "NVM already installed."

fi

# Load NVM into the current shell
if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
else
    echo "ERROR: Could not load NVM."
    exit 1
fi

# ------------------------------------------------------------
# 5. Install Node.js
# ------------------------------------------------------------

echo
echo "[4/7] Installing Node.js LTS..."

if ! nvm ls --no-colors | grep -q "lts/"; then
    nvm install --lts
else
    echo "Node.js LTS already installed."
fi

nvm alias default 'lts/*'
nvm use default

echo
echo "Node.js version:"
node --version

echo "npm version:"
npm --version

# ------------------------------------------------------------
# 6. Install global Node.js tools
# ------------------------------------------------------------

echo
echo "[5/7] Installing Node.js development tools..."

# NestJS CLI
if ! command -v nest >/dev/null 2>&1; then
    npm install --global @nestjs/cli
else
    echo "NestJS CLI already installed."
fi

# ------------------------------------------------------------
# 7. Install PostgreSQL
# ------------------------------------------------------------

echo
echo "[6/7] Configuring PostgreSQL..."

sudo apt install postgresql -y
sudo apt install postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

echo
echo "PostgreSQL status:"
sudo systemctl is-active postgresql

# ------------------------------------------------------------
# Verification
# ------------------------------------------------------------

echo
echo "[7/7] Verifying installation..."

echo
echo "------------------------------"
echo "Installed versions"
echo "------------------------------"

echo "Git:        $(git --version)"
echo "Node.js:    $(node --version)"
echo "npm:        $(npm --version)"
echo "NestJS:     $(nest --version)"
echo "PostgreSQL: $(psql --version)"

echo
echo "=================================================="
echo "   Setup completed successfully!"
echo "=================================================="
echo

