# GitHub Integration Reference

## GitHub CLI Setup and Authentication

### Installation and Configuration

**Installation:**
```bash
# macOS with Homebrew
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Windows
winget install GitHub.cli
```

**Authentication:**
```bash
# Interactive login (recommended)
gh auth login

# With token (for CI/CD)
gh auth login --with-token < token.txt

# Check authentication status
gh auth status
```

### Required Scopes

For code review functionality, ensure your token has these scopes:
- `repo` - Full repository access
- `read:org` - Read organization information (if applicable)
- `read:user` - Read user information

## GitHub API Usage Patterns

### PR Information Retrieval

**Basic PR information:**
```bash
# Get PR details
gh pr view {pr_number} --json number,title,state,isDraft,additions,deletions,files

# Get PR diff
gh pr diff {pr_number}

# List files changed
gh pr view {pr_number} --json files
```

**JSON output parsing examples:**
```bash
# Extract PR state
gh pr view 123 --json state | jq -r .state

# Check if draft
gh pr view 123 --json isDraft | jq -r .isDraft

# Get file count
gh pr view 123 --json files | jq '.files | length'
```

### Comment Management

**Posting review comments:**
```bash
# Post single comment
gh pr comment {pr_number} --body "Your review comment"

# Post comment on specific line
gh pr review {pr_number} --comment --body "Comment body" --file path/to/file --line 42

# Post multiple comments (using heredoc)
gh pr comment {pr_number} --body-file - << EOF
First comment

Second comment with more details
EOF
```

**Comment formatting best practices:**
- Use markdown for readability
- Include code snippets with backticks
- Reference specific lines using GitHub's line linking syntax
- Keep comments concise but informative

## GitHub URL Formatting

### Code Link Format

**Standard format:**
```
https://github.com/{owner}/{repo}/blob/{full-sha}/{file-path}#L{start}-L{end}
```

**Examples:**
- Single line: `https://github.com/owner/repo/blob/abc123/src/file.js#L42`
- Line range: `https://github.com/owner/repo/blob/abc123/src/file.js#L42-L45`
- Multiple ranges: Separate with commas

**Requirements:**
- Use full 40-character SHA (not abbreviated)
- Include at least 1 line of context before and after
- Use `#L` notation (uppercase L)
- Ensure line numbers are within file bounds

### PR Link Format

**Basic PR links:**
- PR overview: `https://github.com/owner/repo/pull/{pr_number}`
- PR files: `https://github.com/owner/repo/pull/{pr_number}/files`
- PR commits: `https://github.com/owner/repo/pull/{pr_number}/commits`

## Integration Patterns

### CI/CD Integration

**GitHub Actions workflow:**
```yaml
name: Automated Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  code-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Get full history for git blame
      
      - name: Setup GitHub CLI
        run: |
          curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
          echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
          sudo apt update
          sudo apt install gh
      
      - name: Authenticate with GitHub
        run: echo "${{ secrets.GITHUB_TOKEN }}" | gh auth login --with-token
      
      - name: Run Code Review
        run: |
          # Your code review script here
          python code_review.py ${{ github.event.pull_request.number }}
```

### Local Development Setup

**Environment setup script:**
```bash
#!/bin/bash
# setup_review_env.sh

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI not found. Installing..."
    # Install gh CLI
    brew install gh  # or appropriate package manager
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "Please authenticate with GitHub CLI:"
    gh auth login
fi

# Verify repository access
if ! gh repo view &> /dev/null; then
    echo "Not in a GitHub repository or no access"
    exit 1
fi

echo "GitHub integration setup complete"
```

## Error Handling and Rate Limits

### GitHub API Rate Limits

**Unauthenticated:** 60 requests per hour
**Authenticated:** 5,000 requests per hour
**With GitHub Apps:** Higher limits based on plan

**Rate limit checking:**
```bash
# Check rate limits
gh api rate_limit

# Example response parsing
remaining=$(gh api rate_limit | jq -r '.resources.core.remaining')
if [ "$remaining" -lt 100 ]; then
    echo "Warning: Low API rate limit remaining: $remaining"
fi
```

### Error Handling Patterns

**Transient failures:**
```bash
# Retry with exponential backoff
max_retries=3
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    if gh pr view $pr_number &> /dev/null; then
        break
    fi
    
    retry_count=$((retry_count + 1))
    sleep $((2 ** retry_count))
done
```

**Common error scenarios:**
- PR not found (404)
- Access denied (403)
- Rate limit exceeded (429)
- Network timeouts
- Authentication failures

## Performance Optimization

### Efficient API Usage

**Batch operations:**
```bash
# Get multiple PR properties in one call
gh pr view $pr_number --json number,title,state,isDraft,additions,deletions,files,commits

# Use graphql for complex queries
gh api graphql -f query='
  query($prNumber: Int!, $repoOwner: String!, $repoName: String!) {
    repository(owner: $repoOwner, name: $repoName) {
      pullRequest(number: $prNumber) {
        # Complex query here
      }
    }
  }
'
```

**Caching strategies:**
- Cache PR metadata for repeated access
- Store diff content locally to avoid re-fetching
- Use conditional requests with ETags
- Implement local file-based caching

### Memory Management

**For large PRs:**
- Stream diff content instead of loading entirely
- Process files in batches
- Use temporary files for large data
- Clear memory between PR reviews

## Security Considerations

### Token Security

**Best practices:**
- Use fine-grained personal access tokens
- Set appropriate expiration times
- Store tokens securely (not in code)
- Use environment variables or secret management
- Regularly rotate tokens

**Environment setup:**
```bash
# Store token in environment variable
export GITHUB_TOKEN="your_token_here"

# Or use gh config
gh config set github.token "your_token_here"
```

### Repository Access

**Access control:**
- Ensure token has minimal required permissions
- Use repository-specific tokens when possible
- Regularly audit token usage and access
- Implement proper error handling for access denied scenarios

## Testing and Validation

### Integration Testing

**Test scenarios:**
- PR eligibility checks
- Comment posting functionality
- Error handling for various failure modes
- Rate limit handling
- Authentication and authorization

**Test script example:**
```bash
#!/bin/bash
# test_github_integration.sh

# Test basic functionality
echo "Testing GitHub CLI installation..."
if ! command -v gh &> /dev/null; then
    echo "FAIL: GitHub CLI not found"
    exit 1
fi

echo "Testing authentication..."
if ! gh auth status &> /dev/null; then
    echo "FAIL: Not authenticated"
    exit 1
fi

echo "Testing repository access..."
if ! gh repo view &> /dev/null; then
    echo "FAIL: Cannot access repository"
    exit 1
fi

echo "All tests passed"
```

This reference provides comprehensive guidance for integrating with GitHub's API and CLI for automated code review functionality.