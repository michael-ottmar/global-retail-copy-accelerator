#!/usr/bin/env node

/**
 * MCP Figma Test Script
 * Run this locally where your MCP server is configured
 * 
 * Usage:
 * 1. Update FILE_KEY below with your test Figma file
 * 2. Run: node scripts/test-mcp-figma.js
 * 3. Copy the output JSON
 * 4. Paste into the Design tab Import dialog
 */

const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURATION - Update these values
// ========================================
const FILE_KEY = 'YOUR_FIGMA_FILE_KEY'; // Replace with your file key
const OUTPUT_FILE = 'figma-export.json';

// ========================================
// MCP Integration (if available)
// ========================================
async function fetchViaMCP() {
  console.log('🔍 Attempting to fetch via MCP...');
  
  try {
    // If you have MCP client configured
    // const mcp = require('@modelcontextprotocol/client');
    // const result = await mcp.figma.getFile(FILE_KEY);
    // return result;
    
    console.log('⚠️  MCP client not configured in this script');
    console.log('   Use the MCP tools directly in your environment');
    return null;
  } catch (error) {
    console.error('MCP fetch failed:', error);
    return null;
  }
}

// ========================================
// Direct Figma API (requires token)
// ========================================
async function fetchViaAPI() {
  const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
  
  if (!FIGMA_TOKEN) {
    console.log('⚠️  No FIGMA_ACCESS_TOKEN environment variable set');
    console.log('   Set it with: export FIGMA_ACCESS_TOKEN=your_token');
    return null;
  }
  
  console.log('🔍 Fetching via Figma API...');
  
  try {
    const fetch = require('node-fetch');
    const response = await fetch(
      `https://api.figma.com/v1/files/${FILE_KEY}`,
      {
        headers: {
          'X-Figma-Token': FIGMA_TOKEN
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API fetch failed:', error);
    return null;
  }
}

// ========================================
// Mock Data for Testing
// ========================================
function getMockData() {
  console.log('📦 Generating mock data for testing...');
  
  return {
    name: "Test File (Mock Data)",
    lastModified: new Date().toISOString(),
    version: "1.0.0",
    document: {
      id: "0:0",
      name: "Document",
      type: "FRAME",
      children: [
        {
          id: "test:1",
          name: "PDP_Gallery_Image_1",
          type: "FRAME",
          absoluteBoundingBox: { x: 0, y: 0, width: 600, height: 400 },
          constraints: { horizontal: "LEFT", vertical: "TOP" },
          layoutMode: "VERTICAL",
          itemSpacing: 16,
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 24,
          paddingBottom: 24,
          children: [
            {
              id: "test:2",
              name: "headline",
              type: "TEXT",
              characters: "Test Headline",
              absoluteBoundingBox: { x: 24, y: 24, width: 552, height: 32 },
              constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" }
            },
            {
              id: "test:3",
              name: "body",
              type: "TEXT",
              characters: "Test body copy for the product description.",
              absoluteBoundingBox: { x: 24, y: 72, width: 552, height: 60 },
              constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" }
            }
          ]
        },
        {
          id: "test:4",
          name: "Banner_Hero_1",
          type: "FRAME",
          absoluteBoundingBox: { x: 650, y: 0, width: 800, height: 200 },
          constraints: { horizontal: "LEFT", vertical: "TOP" },
          layoutMode: "HORIZONTAL",
          itemSpacing: 24,
          children: [
            {
              id: "test:5",
              name: "headline",
              type: "TEXT",
              characters: "Banner Headline",
              absoluteBoundingBox: { x: 682, y: 80, width: 300, height: 40 },
              constraints: { horizontal: "LEFT", vertical: "CENTER" }
            },
            {
              id: "test:6",
              name: "cta",
              type: "TEXT",
              characters: "Shop Now",
              absoluteBoundingBox: { x: 1006, y: 90, width: 120, height: 20 },
              constraints: { horizontal: "RIGHT", vertical: "CENTER" }
            }
          ]
        }
      ]
    }
  };
}

// ========================================
// Main Execution
// ========================================
async function main() {
  console.log('🚀 Figma MCP Test Script');
  console.log('========================\n');
  
  if (FILE_KEY === 'YOUR_FIGMA_FILE_KEY') {
    console.log('⚠️  Please update FILE_KEY in this script');
    console.log('   Using mock data instead...\n');
  }
  
  let data = null;
  
  // Try different methods
  if (FILE_KEY !== 'YOUR_FIGMA_FILE_KEY') {
    // Try MCP first
    data = await fetchViaMCP();
    
    // Try API if MCP fails
    if (!data) {
      data = await fetchViaAPI();
    }
  }
  
  // Use mock data as fallback
  if (!data) {
    data = getMockData();
  }
  
  // Save to file
  const outputPath = path.join(__dirname, '..', OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log('\n✅ Success! Data saved to:', outputPath);
  console.log('\n📋 Next steps:');
  console.log('1. Open your web app and go to the Design tab');
  console.log('2. Click the "Import" button');
  console.log('3. Copy the contents of', OUTPUT_FILE);
  console.log('4. Paste into the import dialog');
  console.log('\n💡 Tip: You can also copy the JSON to clipboard:');
  console.log('   cat', OUTPUT_FILE, '| pbcopy  (on Mac)');
  console.log('   cat', OUTPUT_FILE, '| xclip  (on Linux)');
}

// Run the script
main().catch(console.error);