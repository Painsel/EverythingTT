# PageDrop Public Upload API Skill

This skill helps AI agents programmatically upload HTML content to PageDrop via the public API endpoint.

---

name: pagedrop-upload-api
description: Upload HTML content to PageDrop via public API. Use when agents need to publish HTML content programmatically without browser interaction. Supports short TTLs (1h, 1d, 3d, once), custom paths, and password protection. Returns shareable URLs immediately. Works with curl, Node.js fetch, or any HTTP client. No API key required.
license: MIT
compatibility: Requires HTTP client (curl, fetch, axios). No browser access.
metadata:
author: PageDrop
version: "1.0"
endpoint: "https://pagedrop.io/api/upload"

---

## Overview

PageDrop provides a **public API endpoint** specifically designed for AI agents and programmatic uploads. This endpoint:

- **No API key required** - Open for agent use
- **Browser access blocked** - Designed for curl/agents only
- **Short TTLs only** - 1h, 1d, 3d, once (no long-term storage)
- **Returns shareable URLs** - Get public links immediately
- **Security workflows** - All uploads scanned automatically

## When to Use This Skill

Use this skill when:

- Building AI agents that need to publish/share HTML content
- Creating automated workflows that generate web pages
- Developing tools that need temporary hosting for HTML output
- Building integrations that need shareable links to HTML content
- Any scenario where programmatic HTML publishing is needed

**Don't use when:**

- User is uploading via browser (use the web UI instead)
- You need long-term storage beyond 3 days
- You want content in Explore/discovery mode (not available via API)

## API Endpoint

```
POST https://pagedrop.io/api/upload
```

## Request Format

### Required Headers

```
Content-Type: application/json
```

### Request Body (JSON)

```json
{
  "html": "<!DOCTYPE html><html>...</html>",
  "ttl": "3d",
  "fileName": "optional.html",
  "customPath": "optional-slug",
  "password": "optional-password",
  "visibility": "private"
}
```

### Field Reference

| Field        | Type   | Required | Default   | Description                                          |
| ------------ | ------ | -------- | --------- | ---------------------------------------------------- |
| `html`       | string | Yes      | -         | HTML content (max 16MB)                              |
| `ttl`        | enum   | Yes      | -         | Time-to-live: `1h`, `1d`, `3d`, `once`               |
| `fileName`   | string | No       | null      | Filename for display                                 |
| `customPath` | string | No       | random    | Custom URL slug (3-63 chars, alphanumeric + hyphens) |
| `password`   | string | No       | null      | Password protection (max 128 chars)                  |
| `visibility` | enum   | No       | `private` | Must be `private` (explore not available)            |

## Response Format

### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "url": "https://abc123.pagedrop.io",
    "slug": "abc123",
    "customPath": "optional-custom-path",
    "isExplore": false
  }
}
```

### Duplicate Content (200 OK)

If identical content was uploaded recently:

```json
{
  "success": true,
  "data": {
    "url": "https://existing.pagedrop.io",
    "slug": "existing",
    "isExplore": false,
    "duplicate": true
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Description of what went wrong",
  "code": "ERROR_CODE"
}
```

Common error codes:

- `BROWSER_ACCESS_BLOCKED` - Request appears to be from a browser (use curl/fetch)
- `INVALID_CONTENT_TYPE` - Missing or wrong Content-Type header
- `REQUEST_TOO_LARGE` - Body exceeds 17MB
- `VALIDATION_ERROR` - Invalid field values (see error message)
- `PATH_UNAVAILABLE` - Custom path already taken
- `ACTOR_BLOCKED` - IP banned due to violations
- `CONTENT_BLOCKED` - Content flagged as malicious

## Usage Examples

### Basic Upload with curl

```bash
curl -X POST https://pagedrop.io/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>",
    "ttl": "3d"
  }'
```

### With Custom Path

```bash
curl -X POST https://pagedrop.io/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<!DOCTYPE html><html>...</html>",
    "ttl": "1d",
    "customPath": "my-project-demo"
  }'
```

Response URL will be: `https://my-project-demo.pagedrop.io`

### With Password Protection

```bash
curl -X POST https://pagedrop.io/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<!DOCTYPE html><html>...</html>",
    "ttl": "3d",
    "password": "secret123",
    "fileName": "report.html"
  }'
```

### One-Time View

Content auto-deletes after first access:

```bash
curl -X POST https://pagedrop.io/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<!DOCTYPE html><html>...</html>",
    "ttl": "once"
  }'
```

### Using Node.js fetch

```javascript
const response = await fetch("https://pagedrop.io/api/upload", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    html: "<!DOCTYPE html><html><body><h1>Hello from Agent</h1></body></html>",
    ttl: "3d",
    fileName: "agent-output.html",
  }),
})

const result = await response.json()
if (result.success) {
  console.log("Published at:", result.data.url)
} else {
  console.error("Error:", result.error)
}
```

### Using Python requests

```python
import requests

response = requests.post(
    'https://pagedrop.io/api/upload',
    headers={'Content-Type': 'application/json'},
    json={
        'html': '<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>',
        'ttl': '3d',
        'fileName': 'output.html'
    }
)

result = response.json()
if result['success']:
    print(f"Published at: {result['data']['url']}")
else:
    print(f"Error: {result['error']}")
```

## Implementation Guide for Agents

### Step 1: Validate HTML Content

Before uploading, ensure the HTML is complete:

```javascript
function validateHtml(html) {
  if (!html || html.trim().length === 0) {
    throw new Error("HTML content is required")
  }
  if (html.length > 16 * 1024 * 1024) {
    throw new Error("HTML content exceeds 16MB limit")
  }
  if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
    console.warn("HTML may be incomplete (missing DOCTYPE or html tag)")
  }
  return html
}
```

### Step 2: Upload with Error Handling

```javascript
async function uploadToPageDrop(html, options = {}) {
  const payload = {
    html: validateHtml(html),
    ttl: options.ttl ?? "3d",
    ...(options.customPath && { customPath: options.customPath }),
    ...(options.password && { password: options.password }),
    ...(options.fileName && { fileName: options.fileName }),
    visibility: "private",
  }

  const response = await fetch("https://pagedrop.io/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  if (!result.success) {
    throw new Error(`${result.code}: ${result.error}`)
  }

  return {
    url: result.data.url,
    slug: result.data.slug,
    isDuplicate: result.data.duplicate ?? false,
  }
}
```

### Step 3: Handle Duplicate Content

The API returns duplicate content with `duplicate: true`. Decide whether to:

- **Use existing URL** (default behavior - saves storage)
- **Force new upload** (modify content slightly to change hash)

```javascript
if (result.isDuplicate && options.forceNewUpload) {
  // Add comment with timestamp to change content hash
  const modifiedHtml = html + `<!-- ${Date.now()} -->`
  return uploadToPageDrop(modifiedHtml, options)
}
```

## Security & Limitations

### Browser Detection

The API actively blocks browser-based requests by checking:

- `Sec-Fetch-*` headers (sent by modern browsers)
- Browser-like `Origin` headers
- `Accept: text/html` without `application/json`

**Agents must not send browser headers.** Use minimal headers:

```
Content-Type: application/json
```

### Rate Limiting

Rate limits are enforced at the WAF level (not application level). If you hit limits:

- Wait before retrying
- Consider adding exponential backoff
- Monitor response status codes

### Content Restrictions

- Max HTML size: 16MB (17MB request limit with JSON overhead)
- Max password length: 128 characters
- Max filename length: 255 characters
- Custom path: 3-63 characters, alphanumeric + hyphens only
- TTL options: `1h`, `1d`, `3d`, `once` only
- No Explore mode (not available via API)

### Content Security

All uploads undergo automated security scanning:

- AI-powered threat detection
- Malicious content blocking
- 3-strike actor ban system

**Never attempt to upload:**

- Phishing content
- Malware or exploits
- Content that violates laws
- Spam or duplicate content repeatedly

## Terms of Service & Policy Restrictions

### Prohibited Content

By using the PageDrop API, you agree NOT to upload content that:

- **Phishing or social engineering** - Attempts to steal credentials, personal information, or deceive users
- **Malware or exploits** - Code designed to harm users, systems, or data
- **Illegal content** - Content violating local, national, or international laws
- **Spam or abuse** - Excessive uploads, bot-generated junk, or content meant to abuse the service
- **Copyright violations** - Content you do not have rights to distribute
- **Harmful or dangerous** - Content promoting violence, self-harm, or dangerous activities
- **Explicit adult content** - Pornographic or sexually explicit material
- **Harassment** - Content targeting individuals with abuse, threats, or hate speech

### Acceptable Use Policy

**You MAY use the API for:**

- Sharing AI-generated HTML content (ChatGPT, Claude, Gemini outputs)
- Hosting temporary demos and prototypes
- Educational projects and student assignments
- Personal apps and micro tools
- One-time secure sharing with auto-deletion
- Automated workflows that generate legitimate HTML content

**You MAY NOT:**

- Use the API to build a competing service
- Resell PageDrop hosting without permission
- Circumvent security measures or rate limits
- Attempt to access other users' content
- Use the API for any illegal purposes
- Upload content on behalf of others without their knowledge
- Scrape or systematically download content from PageDrop

### Enforcement & Consequences

**Automated Detection:**

- All uploads are scanned by AI for threats
- Malicious content is blocked immediately
- Content hashes are added to blocklists

**3-Strike Actor Ban System:**

- 1st malicious upload: Content blocked, warning logged
- 2nd malicious upload: Content blocked, strike recorded
- 3rd malicious upload: **Permanent ban** - IP and client ID blocked forever

**Ban Appeals:**

- Contact support@pagedrop.io with your IP address
- Explain the situation and commit to compliance
- Bans are reviewed case-by-case

### Content Moderation

**User Reporting:**

- Any shared page can be reported by viewers
- Multiple reports trigger automatic removal
- False reporting also violates our terms

**AI Moderation:**

- Content is analyzed for subtle threats
- Social engineering attempts are detected
- Deceptive UI patterns are flagged

### Legal Compliance

**Data Retention:**

- Content auto-expires per TTL settings
- No backups kept after expiration
- Actor tracking data expires after 90 days

**Privacy:**

- IPs are used for security only (rate limiting, abuse prevention)
- No personal data is sold or shared
- See full Privacy Policy at https://pagedrop.io/privacy

**Jurisdiction:**

- Service operated under US law
- Users responsible for compliance with local laws
- Illegal content will be removed and reported to authorities if required

### Changes to Terms

- Terms may be updated without notice
- Continued use constitutes acceptance
- Check https://pagedrop.io/terms for current version

## Common Patterns

### Pattern 1: Generate and Share Report

```javascript
async function generateAndShareReport(data) {
  const html = generateReportHtml(data)
  const { url } = await uploadToPageDrop(html, {
    ttl: "3d",
    fileName: "report.html",
  })
  return url
}
```

### Pattern 2: Create Temporary Demo

```javascript
async function createDemo(content) {
  const html = wrapInPageTemplate(content)
  const { url } = await uploadToPageDrop(html, {
    ttl: "1h",
    customPath: `demo-${Date.now()}`,
    password: "demo123",
  })
  return { url, password: "demo123" }
}
```

### Pattern 3: One-Time Secret Sharing

```javascript
async function shareSecretOnce(secretContent) {
  const html = `<!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; padding: 40px;">
      <h1>Secret Message</h1>
      <pre>${escapeHtml(secretContent)}</pre>
      <p><em>This message will self-destruct after viewing.</em></p>
    </body>
    </html>`

  const { url } = await uploadToPageDrop(html, {
    ttl: "once",
    password: generateSecurePassword(),
  })

  return url
}
```

## Troubleshooting

### "Browser access not allowed" Error

You're sending browser headers. Ensure:

- No `Origin` header
- No `Sec-Fetch-*` headers
- Minimal headers: only `Content-Type: application/json`

### "Request body too large" Error

Content exceeds 17MB. Solutions:

- Compress/remove images (use external hosting)
- Minify HTML
- Split content into multiple pages

### "This custom path is already taken" Error

The slug is in use. Solutions:

- Use random path (omit `customPath`)
- Try a different custom path
- Check if you already uploaded this content (duplicate detection)

### "Upload blocked" Error

Your IP may be banned. Causes:

- Uploading malicious content
- Excessive uploads triggering rate limits
- Multiple violations of content policy

Contact support@pagedrop.io to appeal.

## Best Practices

1. **Use appropriate TTLs** - Don't use `3d` for temporary content, use `1h` or `once`
2. **Handle duplicates gracefully** - Check `duplicate` flag and decide whether to reuse
3. **Validate before upload** - Check HTML completeness and size before API call
4. **Implement retries** - Network failures happen; retry with exponential backoff
5. **Respect rate limits** - Don't hammer the API; implement proper rate limiting
6. **Secure sensitive content** - Use password protection for confidential information
7. **Clean up after use** - For `3d` TTLs, consider if content should be deleted sooner
8. **Monitor errors** - Log API errors to detect issues early

## References

- **Specification**: https://agentskills.io/specification
- **PageDrop Docs**: https://pagedrop.io/docs
- **Agent Skills**: https://github.com/anthropics/skills
- **OpenCode Skills**: https://opencode.ai/docs/skills/

## Example: Complete Agent Integration

```javascript
class PageDropUploader {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || "https://pagedrop.io/api/upload"
    this.defaultTtl = options.defaultTtl || "3d"
  }

  async upload(html, options = {}) {
    const payload = {
      html: this.validateHtml(html),
      ttl: options.ttl || this.defaultTtl,
      visibility: "private",
    }

    if (options.customPath) payload.customPath = options.customPath
    if (options.password) payload.password = options.password
    if (options.fileName) payload.fileName = options.fileName

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!result.success) {
      throw new PageDropError(result.code, result.error)
    }

    return {
      url: result.data.url,
      slug: result.data.slug,
      isDuplicate: result.data.duplicate ?? false,
      expiresAt: this.calculateExpiry(result.data.ttl),
    }
  }

  validateHtml(html) {
    if (!html || html.trim().length === 0) {
      throw new Error("HTML content is required")
    }
    if (html.length > 16 * 1024 * 1024) {
      throw new Error("HTML content exceeds 16MB limit")
    }
    return html
  }

  calculateExpiry(ttl) {
    const ttlMs = { "1h": 3600000, "1d": 86400000, "3d": 259200000, once: 86400000 }
    return Date.now() + (ttlMs[ttl] || ttlMs["3d"])
  }
}

class PageDropError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
    this.name = "PageDropError"
  }
}

// Usage
const uploader = new PageDropUploader()
const { url } = await uploader.upload("<h1>Hello World</h1>")
console.log("Published:", url)
```

---

**Note**: This skill is designed for AI agents using the PageDrop public API. For browser-based uploads, use the PageDrop web interface at https://pagedrop.io