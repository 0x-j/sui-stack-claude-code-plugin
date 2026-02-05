# Sui Stack Plugin Marketplace

This repository includes a Claude Code plugin marketplace that makes it easy to distribute and install the Sui Stack development plugin.

## For Users: Installing the Plugin

### Quick Installation

Add the marketplace and install the plugin with these commands in Claude Code:

```bash
# Add the marketplace
/plugin marketplace add 0x-j/sui-stack-claude-code-plugin

# Install the plugin
/plugin install sui-stack-dev@sui-stack-plugins
```

### Updating the Plugin

To get the latest version:

```bash
# Update marketplace catalog
/plugin marketplace update sui-stack-plugins

# Update the plugin
/plugin update sui-stack-dev@sui-stack-plugins
```

### Verifying Installation

After installation, verify the plugin is active:

```bash
# List installed plugins
/plugin list

# Test a skill
Ask: "How do I write a Move contract?"
```

## For Maintainers: Managing the Marketplace

### Marketplace Structure

```
sui-stack-claude-code-plugin/
├── .claude-plugin/
│   ├── marketplace.json       # Marketplace configuration
│   └── plugin.json            # Plugin manifest
├── skills/                    # Plugin skills
├── commands/                  # Plugin commands
├── agents/                    # Plugin agents
└── README.md
```

### Marketplace Configuration

The marketplace is defined in `.claude-plugin/marketplace.json`:

```json
{
  "name": "sui-stack-plugins",
  "owner": {
    "name": "0x-j",
    "email": "contact@0x-j.com"
  },
  "metadata": {
    "description": "Official marketplace for Sui blockchain development plugins",
    "version": "1.0.0"
  },
  "plugins": [
    {
      "name": "sui-stack-dev",
      "source": {
        "source": "github",
        "repo": "0x-j/sui-stack-claude-code-plugin"
      },
      ...
    }
  ]
}
```

### Publishing a New Version

When releasing a new version:

1. **Update plugin.json:**

   ```bash
   # Edit version in .claude-plugin/plugin.json
   vi .claude-plugin/plugin.json
   ```

2. **Update marketplace.json:**

   ```bash
   # Edit version in .claude-plugin/marketplace.json
   vi .claude-plugin/marketplace.json
   ```

3. **Tag the release:**

   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

4. **Optional: Pin to specific version in marketplace:**
   ```json
   {
     "source": {
       "source": "github",
       "repo": "0x-j/sui-stack-claude-code-plugin",
       "ref": "v0.2.0"
     }
   }
   ```

### Validating Changes

Before committing marketplace changes:

```bash
# Validate marketplace configuration
/plugin validate .

# Or from terminal
claude plugin validate .
```

### Testing Locally

Test marketplace changes before pushing:

```bash
# Add local marketplace
/plugin marketplace add ./path/to/sui-stack-claude-code-plugin

# Install plugin
/plugin install sui-stack-dev@sui-stack-plugins

# Test functionality
/sui-stack-dev:init-dapp
```

## Advanced Configuration

### Version Pinning

Pin users to a specific stable version:

```json
{
  "source": {
    "source": "github",
    "repo": "0x-j/sui-stack-claude-code-plugin",
    "ref": "v0.1.0",
    "sha": "52c34e2f..."
  }
}
```

### Multiple Plugins

Add more plugins to the marketplace:

```json
{
  "plugins": [
    {
      "name": "sui-stack-dev",
      "source": {
        "source": "github",
        "repo": "0x-j/sui-stack-claude-code-plugin"
      }
    },
    {
      "name": "sui-advanced-tools",
      "source": { "source": "github", "repo": "0x-j/sui-advanced-plugin" }
    }
  ]
}
```

### Private Repository Support

For private repositories, users need authentication:

```bash
# GitHub authentication
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Then add marketplace
/plugin marketplace add 0x-j/private-sui-plugin
```

## Team Distribution

### Project-Level Installation

Add to `.claude/settings.json` in your project:

```json
{
  "extraKnownMarketplaces": {
    "sui-stack-plugins": {
      "source": {
        "source": "github",
        "repo": "0x-j/sui-stack-claude-code-plugin"
      }
    }
  },
  "enabledPlugins": {
    "sui-stack-dev@sui-stack-plugins": true
  }
}
```

Team members will be prompted to install the plugin when they trust the project.

### Organization-Level Restrictions

For organizations requiring control, use managed settings:

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "github",
      "repo": "0x-j/sui-stack-claude-code-plugin"
    }
  ]
}
```

## Troubleshooting

### Marketplace Not Found

**Issue:** Cannot add marketplace

**Solutions:**

- Verify repository is public or you have access
- Check GitHub authentication: `gh auth status`
- Try full git URL: `https://github.com/0x-j/sui-stack-claude-code-plugin`

### Plugin Installation Fails

**Issue:** Plugin installs but doesn't work

**Solutions:**

- Validate marketplace: `/plugin validate .`
- Check plugin structure: ensure `.claude-plugin/plugin.json` exists
- Review logs: Check Claude Code output for errors

### Updates Not Appearing

**Issue:** New version doesn't show up

**Solutions:**

- Update marketplace: `/plugin marketplace update sui-stack-plugins`
- Force reinstall: `/plugin uninstall sui-stack-dev@sui-stack-plugins && /plugin install sui-stack-dev@sui-stack-plugins`
- Check cache: Remove from `~/.claude/plugin-cache/` and reinstall

### Authentication Issues (Private Repos)

**Issue:** Cannot access private marketplace

**Solutions:**

- Set token: `export GITHUB_TOKEN=ghp_...`
- Verify permissions: Token needs `repo` scope
- Test manually: `git clone https://github.com/0x-j/private-repo.git`

## Resources

- [Claude Code Plugin Marketplace Docs](https://code.claude.com/docs/en/plugin-marketplaces)
- [Plugin Development Guide](https://code.claude.com/docs/en/plugins)
- [Sui Stack Plugin Repository](https://github.com/0x-j/sui-stack-claude-code-plugin)
- [Issues and Support](https://github.com/0x-j/sui-stack-claude-code-plugin/issues)

## Contributing

Want to add more Sui development plugins to this marketplace? Open an issue or PR!

1. Fork the repository
2. Add your plugin to `marketplace.json`
3. Submit a pull request with:
   - Plugin description
   - Why it's useful for Sui developers
   - Testing steps

---

**Marketplace maintained by:** 0x-j
**License:** MIT
**Support:** https://github.com/0x-j/sui-stack-claude-code-plugin/issues
