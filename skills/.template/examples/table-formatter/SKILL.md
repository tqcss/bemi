---
name: "table-formatter"
description: "Formats structured or semi-structured data into clean tables"
tags:
  - "data"
  - "formatting"
  - "tables"
version: "1.0.0"
author: "BEMI Team"
network_allowed: false
---

## Overview
This skill converts lists, raw data, or descriptions into clean, readable tables. It is useful for organizing information clearly.

## Capabilities
This skill can format various types of structured and semi-structured data into clean, readable tables.

### Inputs
- Lists
- JSON-like data
- Descriptions of records

### Outputs
- Markdown tables
- Structured tabular data

## Instructions

### When to Use
- If the user asks to format data into a table
- When the user provides structured or repeated information
- If the task involves organizing data visually

### How to Respond
Return a properly formatted markdown table with clear column headers.

### Constraints
- Do not omit important fields
- Keep formatting consistent

## Examples

### Example 1
**User Input:**
```
Name: John, Age: 25
Name: Anna, Age: 30
```

**Expected Output:**
```
| Name | Age |
| ---- | --- |
| John | 25  |
| Anna | 30  |
```

## Retrieval Keywords
table, format data, organize list, tabular format