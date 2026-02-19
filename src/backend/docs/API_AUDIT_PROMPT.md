# API Audit Prompt Template

## Purpose

Audit each API endpoint as a user/developer would - testing functionality, security, error handling, and API behavior.

## Audit Checklist Per Endpoint

### 1. **Functionality**

- [ ] Endpoint responds to requests
- [ ] Returns expected response format (JSON structure)
- [ ] Data validation works correctly
- [ ] Happy path returns 200/201 status

### 2. **Security**

- [ ] Authentication required where appropriate
- [ ] Authorization checks (user can only access their own data)
- [ ] Rate limiting applied to sensitive endpoints
- [ ] No sensitive data leaked in errors

### 3. **Error Handling**

- [ ] 400 Bad Request for invalid input
- [ ] 401 Unauthorized when not authenticated
- [ ] 403 Forbidden when not authorized
- [ ] 404 Not Found for missing resources
- [ ] 422 Unprocessable Entity for validation errors
- [ ] Error messages are helpful but not revealing

### 4. **API Design**

- [ ] Consistent URL naming conventions
- [ ] Proper HTTP methods (GET, POST, PUT, DELETE, PATCH)
- [ ] Response schemas are consistent
- [ ] Pagination if applicable

### 5. **Edge Cases**

- [ ] Empty inputs handled
- [ ] Maximum length/size limits enforced
- [ ] Concurrent request handling
- [ ] SQL injection prevention

## Audit Output Format

```markdown
## Endpoint: METHOD /path

**Status:** ✅ PASS / ⚠️ WARNING / ❌ FAIL

**Findings:**
- Finding 1
- Finding 2

**Recommendations:**
- Recommendation 1
- Recommendation 2
```
