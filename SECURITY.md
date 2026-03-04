# EverythingTT Security Policy

## Overview
This document outlines the security architecture and reporting procedures for the EverythingTT Security Research Center. Our goal is to provide a robust framework for monitoring, detecting, and mitigating browser-level and desktop-level security threats.

## Security Architecture
The EverythingTT ecosystem consists of three main components:

1.  **Research Dashboard (Frontend)**: A centralized interface for monitoring security events, managing agents, and simulating cross-site injections.
2.  **C2 & Detection Service (Backend)**: A local Python-based service (`detector.py`) that acts as a Command & Control (C2) server, scanning for automation processes and tracking active monitoring sessions.
3.  **Security Agents (Remote)**: Lightweight scripts (UserScripts/Bookmarklets) that can be deployed to any website to report back to the C2 server and provide visual monitoring indicators.

## Developer Guide

### Core Detection Mechanisms
- **DevTools Killer**: Uses timing-based detection and debugger statements to prevent unauthorized inspection.
- **Incognito Detection**: Analyzes storage and filesystem APIs to identify private browsing modes.
- **Desktop Scanner**: Interfaces with the OS to detect common automation frameworks (Selenium, Puppeteer, Playwright).
- **DOM Monitoring**: Tracks unauthorized element injections and mutations.

### Deployment & Testing
- **Local Research**: Run `python detector.py` to start the local C2 server.
- **Remote Monitoring**: Deploy the Global Security Agent via GreasyFork or the built-in Bookmarklet.
- **Cross-Site Simulation**: Use the "Remote Target" feature to test cross-context message passing.

### Contribution Guidelines
1.  **Module Isolation**: Ensure all new detection modules are self-contained in `script.js`.
2.  **Performance First**: Avoid blocking the main thread; use asynchronous polling for backend checks.
3.  **CSP Compliance**: Maintain strict Content Security Policy headers in `index.html`.

## Reporting Vulnerabilities
If you discover a security vulnerability within the EverythingTT project, please do not use the public issue tracker. Instead, report it through the following channels:
- **Email**: security@everythingtt.example.com (Simulated)
- **Encryption**: Please use our PGP key for sensitive communications.

## Disclaimer
EverythingTT is intended for **authorized security research and educational purposes only**. Unauthorized use against systems without explicit permission is strictly prohibited and may be illegal.
