---
name: publish
description: Deploy the application to production using MCP tools
---

# Skill: Publish

## Deployment Decision Tree

```
What's the deploy target? (from REQUIREMENTS.md)
├── Vercel → use Vercel CLI or Vercel MCP
├── Cloudflare → use Wrangler
├── Firebase → use Firebase MCP
├── Supabase → use Supabase MCP (for functions/migrations)
└── Expo → use EAS CLI
```

## Commands

### Vercel

```bash
npx vercel --prod
```

Post-deploy:
- Set all env vars in Vercel dashboard
- Confirm live URL loads

### Cloudflare Workers

```bash
npx wrangler deploy
# Set secrets:
npx wrangler secret put MY_SECRET
```

### Cloudflare Pages

```bash
npx wrangler pages deploy ./out --project-name my-app
```

### Firebase

```bash
firebase deploy
# or via Firebase MCP
```

### Expo Mobile

```bash
# Production build:
eas build --platform all --profile production

# OTA update (no store submission):
eas update --branch production --message "v{version}"

# Submit to stores:
eas submit --platform ios
eas submit --platform android
```

### Supabase DB Migration

```bash
supabase db push
# or via Supabase MCP → apply_migration
```

## Post-Deploy Checklist

- [ ] Live URL is accessible
- [ ] Core user flow works on production
- [ ] No 5xx errors in logs
- [ ] Env vars are set correctly in production
- [ ] Auth works on production DB
