# macOS `EPERM` (Operation Not Permitted) Diagnostic Report

**Date**: 2026-02-24
**Issue**: `EPERM: operation not permitted` errors during `npm install` and file manipulation operations within the `node_modules` directory specifically when executed by this AI agent.

## Description of the Issue
When the agent executes standard package manager commands (e.g., `npm install`, `rm -rf`) against the project's `node_modules` directory, macOS rejects the operation with an `EPERM` code. This prevents the agent from creating new folders, linking binaries, or deleting old cached packages. 

Because the installation fails midway, packages are left incomplete or missing, causing subsequent pipeline operations like TypeScript compilation (`tsc`) to fail due to missing type definitions (e.g., `@types/react`, `vite/client`).

## Execution Context Differences
This specific agent runtime encounters these `EPERM` locks while standard CLI-based agents running directly within a terminal (like iTerm2 or macOS Terminal) do not. This is because:

1. **App Sandbox Context**: This agent operates within a macOS application sandbox. macOS imposes strict Endpoint Security and Sandbox rules on GUI applications that do not apply to raw terminal windows.
2. **Missing Full Disk Access (FDA)**: The sandboxed host application does not inherit the broader Transparency, Consent, and Control (TCC) privileges that a standard terminal window possesses.
3. **Privilege Boundary**: macOS prevents the sandboxed app from modifying or deleting files within `node_modules` if they were previously created by a higher-privileged process or are otherwise restricted by the OS security policy. The agent's environment explicitly blocks commands like `sudo`, `ps`, `lsof`, or `rsync` outside its allowed capability matrix.
