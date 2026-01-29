# Confidence Scoring Reference

## Scoring System Overview

The confidence scoring system uses a 0-100 scale to evaluate the certainty of identified issues. This system helps filter out false positives and ensures only high-confidence issues are reported.

## Scoring Criteria by Agent Type

### Agent #1: Agent.md Compliance (0-100)

**High Confidence (80-100)**
- Direct violation of explicitly stated rule in Agent.md
- Clear contradiction with documented standards
- Missing required patterns specified in guidelines

*Examples:*
- 95: Agent.md says "Use async/await for all database operations" but PR uses callbacks
- 90: Agent.md requires "All API endpoints must have rate limiting" but new endpoint lacks it
- 85: Agent.md specifies "Error messages must not expose internal details" but PR includes stack traces

**Medium Confidence (50-79)**
- Violation of inferred best practices from Agent.md
- Partial compliance with guidelines
- Style issues not explicitly forbidden but inconsistent

*Examples:*
- 70: Agent.md mentions "Use descriptive variable names" but PR has `x`, `y`, `z`
- 60: Agent.md suggests "Group related functions" but PR scatters related code
- 55: Inconsistent with overall codebase patterns mentioned in Agent.md

**Low Confidence (20-49)**
- Minor stylistic deviations
- Subjective improvements
- Areas where Agent.md is ambiguous

*Examples:*
- 40: Different indentation style than preferred
- 30: Could use more comments but not required
- 25: Alternative approach that might be valid

**No Confidence (0-19)**
- Personal preference only
- No basis in Agent.md or best practices
- False positives

### Agent #2: Bug Detection (0-100)

**High Confidence (80-100)**
- Clear logical errors that will cause runtime failures
- Missing error handling for known failure modes
- Resource leaks (memory, file handles, connections)
- Race conditions in concurrent code

*Examples:*
- 100: Division by zero in mathematical calculation
- 95: Missing `finally` block for resource cleanup
- 90: Unhandled promise rejection in async function
- 85: Potential null pointer dereference

**Medium Confidence (50-79)**
- Potential performance issues
- Code that might fail under edge conditions
- Inefficient algorithms or data structures
- Missing validation for user input

*Examples:*
- 75: O(n²) algorithm where O(n) is possible
- 65: Missing input sanitization for user-provided data
- 60: Could fail with very large inputs
- 55: Inefficient database query pattern

**Low Confidence (20-49)**
- Code that works but could be optimized
- Minor edge cases not handled
- Code smells without clear bugs

*Examples:*
- 45: Magic numbers that should be constants
- 35: Long function that could be split
- 30: Duplicate code that could be extracted
- 25: Minor code style issues

**No Confidence (0-19)**
- Working code with no apparent issues
- False positives from static analysis
- Linter-level issues only

### Agent #3: Historical Context (0-100)

**High Confidence (80-100)**
- Reverting a previous bug fix
- Reintroducing known problematic patterns
- Ignoring previous review feedback on same code
- Breaking established patterns in file history

*Examples:*
- 95: Reverting security fix that was previously applied
- 90: Reintroducing race condition that was fixed
- 85: Ignoring specific feedback from previous PR
- 80: Breaking established API contract

**Medium Confidence (50-79)**
- Similar to previous issues but not identical
- Potential regression based on historical patterns
- Deviating from established architectural patterns

*Examples:*
- 70: Similar to bug fixed 3 months ago
- 65: Breaking established directory structure
- 60: Similar performance issue to one previously addressed
- 55: Deviating from team's established error handling pattern

**Low Confidence (20-49)**
- Minor deviations from historical patterns
- Subjective improvements over previous approaches
- Areas with limited historical context

*Examples:*
- 45: Different approach than previous implementation
- 35: Minor style change from historical patterns
- 30: Limited git history for this file
- 25: Subjective improvement suggestion

**No Confidence (0-19)**
- No relevant historical context
- First implementation of new feature
- Files with no previous modifications

### Agent #4: Previous PR Analysis (0-100)

**High Confidence (80-100)**
- Direct contradiction with previous review comments
- Ignoring specific feedback from team members
- Repeating mistakes from previous PRs
- Breaking agreements established in previous discussions

*Examples:*
- 95: Ignoring specific security feedback from previous PR
- 90: Repeating architectural mistake that was discussed
- 85: Breaking API contract established in previous PR
- 80: Contradicting team decision from recent discussion

**Medium Confidence (50-79)**
- Similar issues to those raised in previous PRs
- Potential pattern of similar problems
- Areas where previous feedback might apply

*Examples:*
- 70: Similar performance issue to one raised last month
- 65: Pattern of missing error handling across PRs
- 60: Similar code style issue to previous feedback
- 55: Potential regression based on previous PR patterns

**Low Confidence (20-49)**
- Minor similarities to previous PRs
- Areas where previous feedback is only loosely related
- Limited PR history for context

*Examples:*
- 45: Similar but not identical to previous comment
- 35: Limited PR history for this code area
- 30: Previous feedback was subjective
- 25: Weak connection to previous discussions

**No Confidence (0-19)**
- No relevant previous PR context
- First PR for this code area
- Previous feedback doesn't apply to current changes

### Agent #5: Code Comments Compliance (0-100)

**High Confidence (80-100)**
- Adding TODO comments for incomplete functionality
- Leaving FIXME comments for known bugs
- Adding performance warnings without addressing
- Security notes that should be resolved before merge

*Examples:*
- 95: TODO: "Implement authentication" in security-critical code
- 90: FIXME: "This will crash with large inputs"
- 85: Performance warning: "O(n²) algorithm, needs optimization"
- 80: Security note: "Validate user input here" left unaddressed

**Medium Confidence (50-79)**
- Minor TODO comments for non-critical features
- Documentation comments that could be improved
- Code that would benefit from additional comments

*Examples:*
- 70: TODO: "Add more test cases" for non-critical function
- 65: Complex algorithm with minimal comments
- 60: API method without usage examples in comments
- 55: Could benefit from inline documentation

**Low Confidence (20-49)**
- Subjective comment improvements
- Minor documentation gaps
- Areas where comments are adequate but could be better

*Examples:*
- 45: Comment could be more descriptive
- 35: Minor grammatical issues in comments
- 30: Adequate but not excellent documentation
- 25: Subjective preference for more comments

**No Confidence (0-19)**
- Comments are appropriate and sufficient
- No issues with comment quality or content
- False positives from comment analysis

## Scoring Adjustment Factors

### Contextual Modifiers

**Increase confidence (+10-20 points):**
- Multiple agents flag the same issue
- Issue is in security-critical code
- Issue affects core functionality
- Recent similar issues caused problems

**Decrease confidence (-10-20 points):**
- Issue is in test or example code
- Code is marked as experimental
- Limited context available for analysis
- Subjective or stylistic issue only

### Threshold Application

**Strict 80-point threshold:**
- Issues scoring 80+ are included in final review
- Issues scoring 79 or below are discarded
- No rounding or exceptions to threshold
- Ensures only high-confidence issues are reported

## Scoring Examples in Practice

### Example 1: High Confidence Bug
```javascript
// PR adds this function
function calculateTotal(items) {
    let total = 0;
    for (let i = 0; i <= items.length; i++) {
        total += items[i].price;
    }
    return total;
}
```

**Scoring:**
- Agent #2: Off-by-one error (95 confidence)
- Agent #3: Similar bug fixed last month (85 confidence)
- **Final score**: 95 (included in review)

### Example 2: Medium Confidence Style Issue
```python
# PR changes variable naming
x = get_user_data()  # was: user_data = get_user_data()
y = process_data(x)   # was: processed_data = process_data(user_data)
```

**Scoring:**
- Agent #1: Agent.md suggests descriptive names (65 confidence)
- Agent #4: Previous PR had similar feedback (60 confidence)
- **Final score**: 65 (discarded)

### Example 3: Low Confidence Optimization
```java
// PR uses ArrayList instead of HashSet for membership checks
List<String> items = new ArrayList<>();
// ... many add operations
if (items.contains(target)) { ... }  // O(n) instead of O(1)
```

**Scoring:**
- Agent #2: Performance issue for large datasets (45 confidence)
- **Final score**: 45 (discarded)

## Implementation Notes

### Scoring Consistency
- Use consistent criteria across all agents
- Document scoring rationale for transparency
- Regular calibration against real PR outcomes
- Adjust scoring based on false positive/negative rates

### Performance Considerations
- Cache scoring results for similar patterns
- Use efficient scoring algorithms
- Parallelize scoring across agents
- Monitor scoring time for optimization

This reference ensures consistent, reliable confidence scoring across all code review activities.