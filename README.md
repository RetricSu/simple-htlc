# Simple-HTLC

A smart contract demo built with [ckb-js-vm](https://github.com/nervosnetwork/ckb-js-vm) in TypeScript that demonstrates how to use a Hashed Timelock Contract (HTLC) to enable trustless, conditional payments on CKB.

## What is HTLC?

A **Hashed Timelock Contract (HTLC)** is a type of smart contract that enables trustless, conditional payments between two parties. It uses a cryptographic hash to ensure that funds can only be claimed if the recipient provides the correct preimage of the hash within a set time limit. If the preimage isn’t revealed before the deadline, the sender can safely refund their funds. 

## Why it Matters

- **Atomic swaps:** Enable cross-chain token exchanges without needing a centralized exchange or trusted third party.
- **Payment channels:** Power off-chain micropayment systems (like Lightning Network) by ensuring safe settlement on-chain.
- **Escrow protection:** Guarantee that either the recipient gets paid if conditions are met, or the sender gets refunded if not.
- **Trustless automation:** Remove the need for intermediaries by enforcing conditions (hash + timelock) directly on-chain.

## How HTLC Works on CKB

On CKB, this HTLC is enforced through a [Lock Script](https://docs.nervos.org/docs/tech-explanation/lock-script) that protects a [Cell](https://docs.nervos.org/docs/tech-explanation/cell) with two mutually-exclusive branches:

- **Fund:**
    - Anyone who reveals the correct preimage of the stored hash can unlock the Cell.
    - The output must go to the recipient address specified when the Cell was created.
- **Refund:**
    - If the timelock has expired (using CKB’s `since` field in block height or epoch), the original depositor can reclaim the funds.
    - The refund transaction must include another input Cell locked by the same refund Lock Script to validate the refund address.

> ⚠️ This is an educational prototype—do not use it in production or with real assets.

## Overview

This project uses the CKB JavaScript VM (ckb-js-vm) to write smart contracts in typescript. The contracts are compiled to bytecode and can be deployed to the CKB blockchain.

## Project Structure

```bash
simple-htlc
├── contracts                  # Smart contract source code
│   └── htlc                   # HTLC contract implementation
│       └── src
│           ├── index.ts       # Main entry point
│           ├── type.ts        # Type definitions
│           └── util.ts        # Utility functions
├── deployment                 # Deployment configuration and scripts
│   ├── README.md              # Deployment instructions
│   ├── scripts.json           # Deployment script config
│   └── system-scripts.json    # System-level script definitions
├── scripts                    # Helper scripts for building and deploying
│   ├── add-contract.js        # Register a new contract
│   ├── build-all.js           # Build all contracts
│   ├── build-contract.js      # Build a single contract
│   └── deploy.js              # Deploy contracts
├── tests                      # Test suite
│   ├── core                   # Core testing utilities
│   │   ├── helper.ts          # Helper functions
│   │   ├── type.ts            # Type definitions
│   │   └── util.ts            # Utility functions
│   ├── htlc.devnet.test.ts    # Integration tests on devnet
│   ├── htlc.mock.test.ts      # Mock-based tests
│   └── htlc.unit.test.ts      # Unit tests
├── jest.config.cjs            # Jest test runner configuration
├── package.json               # Project metadata, dependencies, and scripts
├── tsconfig.base.json         # Shared TypeScript config
├── tsconfig.json              # Project-specific TypeScript config
└── README.md                  # Project overview and documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- pnpm package manager

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

### Building Contracts

Build all contracts:

```bash
pnpm run build
```

Build a specific contract:

```bash
pnpm run build:contract hello-world
```

### Running Tests

Run all tests:

```bash
pnpm test
```

Run tests for a specific contract:

```bash
pnpm test -- hello-world
```

### Adding New Contracts

Create a new contract:

```bash
pnpm run add-contract my-new-contract
```

This will:

- Create a new contract directory under `contracts/`
- Generate a basic contract template
- Create a corresponding test file

## Development

### Contract Development

1. Edit your contract in `contracts/<contract-name>/src/index.typescript`
2. Build the contract: `pnpm run build:contract <contract-name>`
3. Run tests: `pnpm test -- <contract-name>`

### Build Output

All contracts are built to the global `dist/` directory:

- `dist/{contract-name}.js` - Bundled JavaScript code
- `dist/{contract-name}.bc` - Compiled bytecode for CKB execution

### Testing

Tests use the `ckb-testtool` framework to simulate CKB blockchain execution. Each test:

1. Sets up a mock CKB environment
2. Deploys the contract bytecode
3. Executes transactions
4. Verifies results

## Available Scripts

- `build` - Build all contracts
- `build:contract <name>` - Build a specific contract
- `test` - Run all tests
- `add-contract <name>` - Add a new contract
- `deploy` - Deploy contracts to CKB network
- `clean` - Remove all build outputs
- `format` - Format code with Prettier

## Deployment

Deploy your contracts to CKB networks using the built-in deploy script:

### Basic Usage

```bash
# Deploy to devnet (default)
pnpm run deploy

# Deploy to testnet
pnpm run deploy -- --network testnet

# Deploy to mainnet
pnpm run deploy -- --network mainnet
```

### Advanced Options

```bash
# Deploy with upgradable type ID
pnpm run deploy -- --network testnet --type-id

# Deploy with custom private key
pnpm run deploy -- --network testnet --privkey 0x...

# Combine multiple options
pnpm run deploy -- --network testnet --type-id --privkey 0x...
```

### Available Options

- `--network <network>` - Target network: `devnet`, `testnet`, or `mainnet` (default: `devnet`)
- `--privkey <privkey>` - Private key for deployment (default: uses offckb's deployer account)
- `--type-id` - Enable upgradable type ID for contract updates

### Deployment Artifacts

After successful deployment, artifacts are saved to the `deployment/` directory:

- `deployment/scripts.json` - Contract script information
- `deployment/<network>/<contract>/deployment.toml` - Deployment configuration
- `deployment/<network>/<contract>/migrations/` - Migration history

## Dependencies

### Core Dependencies

- `@ckb-js-std/bindings` - CKB JavaScript VM bindings
- `@ckb-js-std/core` - Core CKB JavaScript utilities

### Development Dependencies

- `ckb-testtool` - Testing framework for CKB contracts
- `esbuild` - Fast JavaScript bundler
- `jest` - JavaScript testing framework
- `typescript` - TypeScript compiler
- `ts-jest` - TypeScript support for Jest
- `prettier` - Code formatter

## Resources

- [CKB JavaScript VM Documentation](https://github.com/nervosnetwork/ckb-js-vm)
- [CKB Developer Documentation](https://docs.nervos.org/docs/script/js/js-quick-start)
- [The Little Book of ckb-js-vm ](https://nervosnetwork.github.io/ckb-js-vm/)

## License

MIT
