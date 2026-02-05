---
name: init-dapp
description: Initialize a new Sui dApp project using official scaffolding tool
argument-hint: "[project-name] [template]"
allowed-tools:
  - Bash
  - AskUserQuestion
  - Read
---

# Initialize Sui dApp

Create a new Sui dApp project using the official `@mysten/dapp` scaffolding tool. This command sets up a complete frontend project with wallet integration, Sui SDK, and your choice of framework.

## What This Command Does

1. Prompts for project configuration (or uses arguments)
2. Runs `npm create @mysten/dapp` with selected options
3. Explains the generated structure
4. Provides next steps for development

## Template Options

The official scaffold supports multiple templates:

- **react-client-dapp** - React with Vite (recommended for most dApps)
- **react-e2e-counter** - React with Move counter contract example
- **next-client-dapp** - Next.js client-side dApp
- **next-server-dapp** - Next.js with server actions
- **vue-client-dapp** - Vue.js dApp

## Instructions

### Step 1: Gather Requirements

If arguments not provided, ask user:

1. **Project name** - What should the project be called?
   - Use for directory name
   - Default: "my-sui-dapp"

2. **Template choice** - Which template to use?
   - Offer options from above
   - Recommend: react-client-dapp (most common, works with Walrus upload relay)
   - Default: react-client-dapp

3. **Package manager** - npm, pnpm, or yarn?
   - Default: npm

### Step 2: Verify Prerequisites

Check that Node.js is installed:

```bash
node --version
```

Must be v18 or higher. If not installed, inform user to install from https://nodejs.org/

### Step 3: Run Scaffold Command

Execute the create command based on gathered info:

```bash
npm create @mysten/dapp@latest -- --template [TEMPLATE] [PROJECT_NAME]
```

Or with pnpm:

```bash
pnpm create @mysten/dapp@latest --template [TEMPLATE] [PROJECT_NAME]
```

### Step 4: Explain Generated Structure

After successful creation, explain the project structure:

```
project-name/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point with dApp Kit providers
│   └── ...              # Other components
├── package.json         # Dependencies
├── vite.config.ts       # Vite configuration (for React/Vue)
├── next.config.js       # Next.js config (for Next templates)
└── ...
```

**Key files:**
- `src/main.tsx` - dApp Kit providers (SuiClientProvider, WalletProvider)
- `src/App.tsx` - Main app with wallet connection
- `package.json` - Includes @mysten/sui, @mysten/dapp-kit

### Step 5: Provide Next Steps

Give user clear next steps:

1. **Navigate to project:**
   ```bash
   cd [PROJECT_NAME]
   ```

2. **Install dependencies** (if not auto-installed):
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Typically http://localhost:5173 (Vite) or http://localhost:3000 (Next.js)
   - App shows wallet connection button

5. **Next development steps:**
   - Add Move contracts to `move/` directory (if needed)
   - Build UI components in `src/`
   - Configure network in `src/networkConfig.ts` or `src/main.tsx`
   - Add transaction logic using `useSignAndExecuteTransaction` hook

### Step 6: Template-Specific Guidance

Provide additional context based on template:

**For react-client-dapp:**
- Uses Vite for fast development
- Compatible with Walrus upload relay (client-side WASM works)
- Ideal for most dApps

**For next-client-dapp:**
- Next.js App Router
- Client-side wallet integration
- Note: Walrus SDK has WASM issues on Next.js client - use server actions or Vite template

**For next-server-dapp:**
- Uses Next.js server actions
- Good for apps where server handles Sui operations
- Compatible with Walrus publisher pattern

**For react-e2e-counter:**
- Includes Move counter contract example
- Shows complete flow from contract to frontend
- Good for learning

## Examples

### Basic Usage

```
User: /sui-stack-dev:init-dapp

Claude: Asks for project name, template, package manager
Claude: Runs npm create @mysten/dapp@latest
Claude: Explains structure and next steps
```

### With Arguments

```
User: /sui-stack-dev:init-dapp my-nft-marketplace react-client-dapp

Claude: Creates project with specified name and template
Claude: Uses npm by default
Claude: Explains structure and next steps
```

## Important Notes

- **Walrus Integration**: If user plans to use Walrus upload relay, recommend react-client-dapp or vue-client-dapp (not Next.js client-side)
- **Network Configuration**: Default is testnet - user can change in network config
- **Wallet Installation**: User needs a Sui wallet browser extension (Sui Wallet, Suiet, Ethos) to test
- **Contract Deployment**: If template includes Move contracts, they must be deployed before frontend can interact

## Documentation References

- **dApp Kit Getting Started**: https://sdk.mystenlabs.com/dapp-kit/getting-started/create-dapp
- **React Template Guide**: https://sdk.mystenlabs.com/dapp-kit/getting-started/react
- **Next.js Template Guide**: https://sdk.mystenlabs.com/dapp-kit/getting-started/nextjs
- **Vue Template Guide**: https://sdk.mystenlabs.com/dapp-kit/getting-started/vue

## Error Handling

**If npm create fails:**
- Check Node.js version (needs v18+)
- Try with `--legacy-peer-deps` flag
- Check network connection
- Try different package manager (pnpm/yarn)

**If directory exists:**
- Ask user if they want to use different name
- Or ask if they want to delete existing directory

## Tips

- Start with react-client-dapp for most projects
- Use react-e2e-counter if new to Sui development (includes example contract)
- Choose Next.js only if you need SSR or specific Next.js features
- Always test wallet connection before building features

---

Focus on getting user started quickly with working scaffold. Explain what was created and guide them to first successful run.
