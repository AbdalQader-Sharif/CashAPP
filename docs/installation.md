# Installation & Packaging

## Development
1. Copy `.env.example` to `.env` if needed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize DB and seed:
   ```bash
   npm run prisma:migrate
   npm run seed
   ```
4. Start web apps:
   ```bash
   npm run dev

   ```

## Desktop Development (Electron)
```bash
npm run dev:desktop
```

## Build Desktop
- Installer (`installer.exe`):
  ```bash

  ```
- Portable EXE:
  ```bash
  npm run build:portable --workspace=desktop
  ```
- Production build:
  ```bash
  npm run build --workspace=desktop
  ```

Outputs are generated under `apps/desktop/dist/`.
