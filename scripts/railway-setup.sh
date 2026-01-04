#!/bin/bash

# Goal Quest - Railway Setup Script
# This script helps you deploy Goal Quest to Railway

set -e

echo "🚂 Goal Quest - Railway Deployment Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
    echo -e "${GREEN}✓ Railway CLI installed${NC}"
fi

echo ""
echo "Step 1: Railway Login"
echo "====================="
railway login

echo ""
echo "Step 2: Initialize Project"
echo "=========================="
echo "Creating a new Railway project..."
railway init

echo ""
echo "Step 3: Add PostgreSQL Database"
echo "==============================="
echo "Adding PostgreSQL service..."
railway add --database postgres

echo ""
echo "Step 4: Environment Variables"
echo "============================="
echo ""
echo -e "${YELLOW}You need to provide the following API keys:${NC}"
echo ""

# Get OpenAI API Key
echo -n "Enter your OpenAI API key (from https://platform.openai.com): "
read -r OPENAI_KEY
railway variables set OPENAI_API_KEY="$OPENAI_KEY"
echo -e "${GREEN}✓ OpenAI API key set${NC}"

# Get Anthropic API Key
echo ""
echo -n "Enter your Anthropic API key (from https://console.anthropic.com): "
read -r ANTHROPIC_KEY
railway variables set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"
echo -e "${GREEN}✓ Anthropic API key set${NC}"

# Generate Session Secret
echo ""
echo "Generating secure session secret..."
SESSION_SECRET=$(openssl rand -base64 32)
railway variables set SESSION_SECRET="$SESSION_SECRET"
echo -e "${GREEN}✓ Session secret generated and set${NC}"

# Set Node Environment
railway variables set NODE_ENV=production
echo -e "${GREEN}✓ NODE_ENV set to production${NC}"

echo ""
echo "Step 5: Deploy Application"
echo "=========================="
echo "Deploying to Railway..."
railway up

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. View your app: railway open"
echo "2. Check logs: railway logs"
echo "3. Get your URL: railway domain"
echo ""
echo "Your Goal Quest app should be live in a few minutes!"
echo ""
echo "To get a custom domain:"
echo "  railway domain add your-domain.com"
echo ""
echo "For help:"
echo "  railway help"
echo "  https://docs.railway.app"
echo ""
echo -e "${GREEN}Happy tracking! 🎮✨${NC}"
