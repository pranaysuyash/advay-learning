# DEPENDENCY AUDIT v1.0 - Frontend & Backend Dependencies

**Scope**: both (frontend and backend dependencies)  
**Repo Access**: YES  

---

## A) Tooling Status

### Frontend (npm audit)
- **Status**: ✅ **RAN SUCCESSFULLY**
- **Command**: `npm audit --audit-level=moderate`
- **Exit Code**: 1 (vulnerabilities found)
- **Output**: 4 moderate severity vulnerabilities detected

### Backend (pip-audit)
- **Status**: ❌ **TOOL NOT AVAILABLE**
- **Command**: `pip-audit`
- **Exit Code**: 127 (command not found)
- **Alternative Attempted**: None (pip-audit not installed)
- **Result**: Unable to scan Python dependencies for vulnerabilities

---

## B) Findings List (Prioritized)

### HIGH Priority Findings

#### F1: esbuild Development Server Vulnerability
**Package**: esbuild ≤0.24.2  
**Severity**: moderate (CVSS score not specified)  
**Exposure**: development only (dev dependency)  
**Description**: Enables any website to send requests to development server and read response  
**Affected Chain**: esbuild → vite → vite-node → vitest  
**CVE**: GHSA-67mh-4wv8-2f99  
**Current Version**: Unknown (via vite dependency)  
**Suggested Action**: Upgrade vite to 7.3.1+ (breaking change)  
**Risk**: Development server compromise during local development  

### MEDIUM Priority Findings

#### F2: vite Development Server Exposure
**Package**: vite 0.11.0 - 6.1.6  
**Severity**: moderate (inherited from esbuild)  
**Exposure**: development only  
**Description**: Inherits esbuild vulnerability through dependency chain  
**Suggested Action**: Upgrade to vite 7.3.1+  
**Risk**: Same as esbuild - dev server request interception  

#### F3: vite-node Vulnerability Inheritance
**Package**: vite-node ≤2.2.0-beta.2  
**Severity**: moderate  
**Exposure**: development/testing only  
**Description**: Depends on vulnerable vite version  
**Suggested Action**: Upgrade via vite upgrade  
**Risk**: Testing framework vulnerability  

#### F4: vitest Testing Framework Exposure
**Package**: vitest 0.0.1-0.0.12, 0.0.29-0.0.122, 0.3.3-2.2.0-beta.2  
**Severity**: moderate  
**Exposure**: development/testing only  
**Description**: Depends on vulnerable vite/vite-node  
**Suggested Action**: Upgrade via vite upgrade  
**Risk**: Test execution vulnerability  

### Backend Findings
- **Status**: ❓ **UNKNOWN** - pip-audit tool not available
- **Risk Assessment**: Cannot determine Python dependency vulnerabilities
- **Recommended Action**: Install pip-audit or safety.py for backend scanning

---

## C) Ticket Recommendations

### TCK-20240128-012 :: Fix Frontend Development Vulnerabilities
**Type**: SECURITY  
**Priority**: HIGH  
**Scope**: Upgrade vite and related packages to fix esbuild vulnerability  
**Acceptance Criteria**:
- [ ] Upgrade vite to 7.3.1+ 
- [ ] Test development server functionality
- [ ] Verify no breaking changes in build process
- [ ] Run npm audit --audit-level=moderate (should pass)

### TCK-20240128-013 :: Install Backend Dependency Scanning
**Type**: SECURITY  
**Priority**: MEDIUM  
**Scope**: Set up pip-audit or safety.py for Python dependency vulnerability scanning  
**Acceptance Criteria**:
- [ ] Install pip-audit or safety.py
- [ ] Run vulnerability scan on Python dependencies
- [ ] Document findings and remediation plan
- [ ] Add to CI pipeline

### TCK-20240128-014 :: Dependency Audit Automation
**Type**: INFRASTRUCTURE  
**Priority**: LOW  
**Scope**: Add automated dependency auditing to development workflow  
**Acceptance Criteria**:
- [ ] Add npm audit to package.json scripts
- [ ] Add pip-audit to Python workflow
- [ ] Set up alerts for new vulnerabilities
- [ ] Document dependency update process

---

## Summary

**Overall Security Posture**: ⚠️ **MODERATE RISK** - Frontend has known development vulnerabilities, backend scanning unavailable.

**Immediate Actions**:
1. Upgrade vite to fix esbuild vulnerability (HIGH priority)
2. Install backend dependency scanning tools (MEDIUM priority)
3. Add automated auditing to prevent future issues (LOW priority)

**Production Impact**: LOW - Vulnerabilities are development-only, not affecting production builds.

**Next Steps**: Address HIGH priority frontend fixes, then enable backend scanning.</content>
<parameter name="filePath">/Users/pranay/Projects/learning_for_kids/docs/audit/dependency-audit__frontend_backend.md