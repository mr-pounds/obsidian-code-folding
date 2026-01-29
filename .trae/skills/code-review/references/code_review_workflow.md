# Code Review Workflow Reference

## Complete Workflow Details

### Step 1: Eligibility Check (Detailed)

**What to check:**
- **Closed PRs**: Skip immediately - no action needed
- **Draft PRs**: Skip - wait for PR to be ready for review
- **Trivial changes**: Skip if changes are obviously safe (e.g., typo fixes in comments)
- **Automated PRs**: Skip dependency updates, automated formatting
- **Already reviewed**: Check if you already posted a review comment

**Implementation notes:**
- Use `gh pr view` to get PR status
- Check `state` field for "CLOSED" or "MERGED"
- Check `isDraft` field for draft status
- Review diff for triviality assessment

### Step 2: Agent.md File Gathering

**File discovery strategy:**
1. Check for root Agent.md: `/Agent.md`
2. For each modified file, check its directory for Agent.md
3. Also check parent directories up to root
4. Include all unique Agent.md files found

**Example file paths to check:**
- Modified file: `src/auth/oauth.ts`
- Check directories:
  - `src/auth/Agent.md`
  - `src/Agent.md`
  - `/Agent.md`

### Step 3: PR Summary Generation

**What to include in summary:**
- Number of files changed
- Lines added/removed
- Key areas affected (e.g., authentication, database, UI)
- Any breaking changes mentioned in PR description
- Dependencies added/removed

### Step 4: Agent Configuration

#### Agent #1: Agent.md Compliance
**Focus areas:**
- Naming conventions
- Error handling patterns
- Security requirements
- Performance guidelines
- Documentation standards

#### Agent #2: Bug Detection
**Common bug patterns to detect:**
- Missing null/undefined checks
- Resource leaks (file handles, connections)
- Race conditions in concurrent code
- Incorrect API usage
- Logic errors in conditional statements

#### Agent #3: Historical Context
**What to analyze:**
- Git blame for recent changes to modified files
- Bug fix patterns in file history
- Previous refactoring attempts
- Known problematic patterns in the codebase

#### Agent #4: Previous PR Analysis
**Review strategy:**
- Find PRs that modified the same files in last 6 months
- Look for recurring comments or issues
- Check for patterns in feedback
- Note any specific guidelines mentioned

#### Agent #5: Code Comments Compliance
**Comment types to check:**
- TODO comments indicating incomplete work
- FIXME comments for known issues
- Performance warnings
- Security notes
- API contract comments

### Step 5: Confidence Scoring Examples

#### High Confidence (75-100)
- **Agent.md explicitly mentions**: "Always validate user input" + PR adds user input without validation
- **Clear bug**: Missing `finally` block for resource cleanup
- **Security issue**: Hardcoded API keys added

#### Medium Confidence (50-74)
- **Potential performance issue**: Nested loops with large datasets
- **Code style**: Inconsistent naming but not explicitly in Agent.md
- **Minor logic issue**: Edge case not handled

#### Low Confidence (25-49)
- **Stylistic preference**: Different but valid approach
- **Minor optimization**: Could be faster but works correctly
- **Subjective improvement**: Readability could be better

#### No Confidence (0-24)
- **Pre-existing issue**: Bug existed before PR
- **False positive**: Code looks suspicious but is correct
- **Linter territory**: Formatting issue that linter would catch

### Step 6: Issue Filtering Logic

**Filter criteria:**
- Score < 80: Discard completely
- Score ≥ 80: Include in final review
- If no issues ≥ 80: Skip review comment

**Edge cases:**
- Multiple agents flag same issue: Use highest confidence score
- Conflicting feedback: Review manually if needed
- Borderline scores (79-81): Use strict 80 threshold

### Step 7: Final Eligibility Re-check

**Why re-check:**
- PR might have been closed during review process
- Draft status might have changed
- Another reviewer might have posted comments
- PR might have been merged

### Step 8: Comment Formatting

#### Code Link Format
```markdown
https://github.com/{owner}/{repo}/blob/{full-sha}/{file-path}#L{start}-L{end}
```

**Requirements:**
- Full 40-character SHA (not abbreviated)
- Include at least 1 line of context before and after
- Use `#L` notation (not `#l` or other variations)
- Line numbers must be valid (within file bounds)

#### Issue Description Guidelines
- **Be specific**: "Missing error handling" not "Code could be better"
- **Include evidence**: Reference Agent.md section or bug pattern
- **Provide context**: Explain why it's an issue
- **Be constructive**: Suggest improvement if possible

## Workflow Examples

### Example 1: Successful Review with Issues
```bash
# PR: Add OAuth authentication
# Changes: 3 files, 150 lines

# Step 1: Eligible (open, not draft, meaningful changes)
# Step 2: Found Agent.md in root and src/auth/
# Step 3: Summary: Adds OAuth flow with Google and GitHub
# Step 4: Agents find 5 potential issues
# Step 5: Confidence scores: 85, 92, 45, 78, 95
# Step 6: Filtered: 85, 92, 95 (3 issues)
# Step 7: Still eligible
# Step 8: Post comment with 3 high-confidence issues
```

### Example 2: No High-Confidence Issues
```bash
# PR: Fix typo in comment
# Changes: 1 file, 1 line

# Step 1: Skip (trivial change)
# Process stops here
```

### Example 3: All Issues Below Threshold
```bash
# PR: Refactor utility functions
# Changes: 2 files, 80 lines

# Steps 1-5 complete
# Step 6: All issues scored <80 (highest: 75)
# Step 7: Skip posting comment
```

## Troubleshooting Workflow Issues

### Common Problems

**Agent timeout**: Large PRs may take longer. Consider:
- Setting reasonable timeouts
- Splitting large PRs
- Using more efficient agent configurations

**GitHub API limits**:
- Use authenticated `gh` CLI for higher rate limits
- Implement retry logic for transient failures
- Batch operations where possible

**Missing Agent.md files**:
- Proceed with review using general best practices
- Note absence of guidelines in review comment
- Suggest creating Agent.md for future reviews

### Performance Optimization

**For large PRs:**
- Process files in batches
- Use incremental analysis
- Cache intermediate results
- Parallelize independent operations

**Memory management:**
- Clear agent contexts between reviews
- Use streaming for large diffs
- Limit concurrent agent count based on system resources

## Integration Patterns

### CI/CD Integration
```yaml
# GitHub Actions example
name: Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Code Review
        run: |
          # Install gh CLI
          # Authenticate with token
          # Run code review skill
```

### Pre-commit Hooks
```bash
#!/bin/bash
# Pre-commit hook to run basic checks
# Can integrate with code review skill for local validation
```

This reference provides comprehensive guidance for implementing and troubleshooting the code review workflow.