# Dev Command Policy

This document explains the development server commands and when each one should be used.

## Default command

```bash
npm run dev
```

Current script:

```text
vite --port=3000
```

Purpose:

```text
Local development on the developer machine.
Default-safe behavior.
No intentional LAN/network exposure.
```

## Network command

```bash
npm run dev:network
```

Current script:

```text
vite --port=3000 --host
```

Purpose:

```text
Explicit opt-in network/LAN development preview.
Useful for device testing or remote browser access.
Should not be the default development command.
```

## Policy

```text
Keep local development local by default.
Make network exposure intentional and visible in the command name.
Do not use the network command in CI.
Do not treat network dev mode as a production deployment path.
```

## Related security policy

See:

```text
docs/runtime-security-policy.md
```

The same principle applies across runtime work:

```text
safe defaults
explicit opt-in for broader access
clear operator decision points
```
