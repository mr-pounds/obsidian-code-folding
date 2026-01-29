# Obsidian Code Folding

A lightweight Obsidian plugin that adds smart folding functionality to code blocks.

[中文文档](README.md)

## Core Principles

- **Minimal Changes**: Focus solely on code block folding, no additional features
- **Performance First**: Lean and efficient code implementation
- **Theme Compatible**: Uses Obsidian native CSS variables, compatible with all themes

## Features

| Code Lines | Behavior                                                              |
| ---------- | --------------------------------------------------------------------- |
| ≤ 5 lines  | Display full code with one-click copy                                 |
| > 5 lines  | Auto-fold overflow, click to expand/collapse, supports one-click copy |

## Installation

### Via Obsidian (Recommended)

1. Open Obsidian Settings → Community Plugins
2. Turn off Safe Mode
3. Click Browse Community Plugins
4. Search for "Code Folding"
5. Click Install and Enable

### Manual Installation

1. Download the latest `main.js`, `styles.css`, and `manifest.json`
2. Place files in your Vault's `.obsidian/plugins/obsidian-code-folding/` directory
3. Enable the plugin in Obsidian settings

## Usage

- Click the code block header to expand/collapse folded content
- Click the 📋 button to copy code
- Adjust the folding threshold in settings (default: 5 lines)

## Settings

| Option         | Description                              | Default |
| -------------- | ---------------------------------------- | ------- |
| Fold Threshold | Auto-fold when exceeding this line count | 5       |

## Compatibility

- Obsidian version: ≥ 0.15.0
- Supports desktop and mobile
- Compatible with all Obsidian themes
