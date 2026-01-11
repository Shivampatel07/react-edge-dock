# Publishing Guide

## Option 1: Publish to npm

### Step 1: Build the library
```bash
npm install
npm run build
```

### Step 2: Login to npm
```bash
npm login
```

### Step 3: Publish
```bash
# Public package (free)
npm publish

# Private package (requires paid npm account)
npm publish --access restricted
```

### Step 4: Use in another project
```bash
npm install react-edge-dock
```

```tsx
import { EdgeDock } from 'react-edge-dock';

function App() {
  return (
    <EdgeDock
      dockMode="auto"
      animation={true}
      button={<button>🚀</button>}
      popup={<div>Hello!</div>}
    />
  );
}
```

---

## Option 2: Use locally without publishing (npm link)

### Step 1: Build and link in this project
```bash
cd /home/shivam/Shivam/Learning/Projects/react-edge-dock
npm install
npm run build
npm link
```

### Step 2: Link in your other project
```bash
cd /path/to/your-other-project
npm link react-edge-dock
```

### Step 3: Use it
```tsx
import { EdgeDock } from 'react-edge-dock';

function App() {
  return <EdgeDock dockMode="auto" button={<button>Hi</button>} />;
}
```

### Step 4: Unlink when done
```bash
# In your project
npm unlink react-edge-dock

# In react-edge-dock directory
npm unlink
```

---

## Option 3: Use as local file dependency

Add to your project's `package.json`:
```json
{
  "dependencies": {
    "react-edge-dock": "file:../react-edge-dock"
  }
}
```

Then run:
```bash
npm install
```

---

## Option 4: GitHub Package Registry

### Step 1: Update package.json
```json
{
  "name": "@yourusername/react-edge-dock",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### Step 2: Create .npmrc
```
@yourusername:registry=https://npm.pkg.github.com
```

### Step 3: Authenticate and publish
```bash
npm login --registry=https://npm.pkg.github.com
npm publish
```

---

## Before Publishing Checklist

- [ ] Update package.json with correct name, version, author, repository
- [ ] Add LICENSE file (MIT recommended)
- [ ] Test the build: `npm run build`
- [ ] Test in another project using `npm link`
- [ ] Update README.md with installation instructions
- [ ] Add .npmignore if needed (or use "files" in package.json)
- [ ] Check package contents: `npm pack --dry-run`

---

## Updating the Package

1. Make your changes
2. Update version in package.json:
   - Patch: 1.0.0 → 1.0.1 (bug fixes)
   - Minor: 1.0.0 → 1.1.0 (new features)
   - Major: 1.0.0 → 2.0.0 (breaking changes)
3. Build: `npm run build`
4. Publish: `npm publish`

Or use npm version:
```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
npm publish
```
