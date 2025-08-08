# 🔒 Security Requirements for Figma Integration

## CRITICAL: Separate Account Strategy

### DO NOT USE MCP WITH PRODUCTION FIGMA ACCOUNT

## Required Setup

### 1. Create Development Figma Account
```
Email: your-email+figma-dev@domain.com
Purpose: Development and testing only
Content: Test files and templates only
```

### 2. Production Figma Account
```
Email: your-main@domain.com
Purpose: Real client work
Access: NEVER connect to MCP
Method: Manual exports only
```

## Security Rules

### NEVER
- ❌ Use production Figma token with MCP
- ❌ Store client files in dev account
- ❌ Run MCP without authentication
- ❌ Expose MCP port to network

### ALWAYS
- ✅ Use separate accounts for dev/prod
- ✅ Whitelist specific file IDs
- ✅ Rotate tokens regularly
- ✅ Audit access logs
- ✅ Use time-limited tokens

## File Organization

```
Development Account (MCP-enabled):
├── test-templates/
│   ├── pdp-test-frame
│   ├── banner-test-frame
│   └── module-test-frame
└── sandbox/

Production Account (MCP-disabled):
├── client-work/
├── confidential/
└── internal-projects/
```

## Token Management

### Development Token
- Scope: Test account only
- Storage: Environment variable
- Rotation: Weekly
- Access: MCP server only

### Production Token
- Scope: Never created
- Storage: Never stored
- Access: Manual only

## Audit Requirements

Weekly review:
- [ ] Check MCP access logs
- [ ] Verify file access patterns
- [ ] Rotate development token
- [ ] Review account separation
- [ ] Update whitelisted files

## Incident Response

If production token is compromised:
1. Immediately revoke token in Figma
2. Audit all file access logs
3. Generate new token (if needed)
4. Review security procedures
5. Document incident

## Compliance

- Maintain complete separation of accounts
- No client data in development environment
- Regular security audits
- Document all access patterns
- Implement principle of least privilege

---

**Remember: Security is not optional. One compromised token can expose all client work.**