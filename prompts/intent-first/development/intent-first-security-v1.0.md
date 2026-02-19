# Intent-First Security Philosophy v1.0

## "Secure by Understanding, Not by Blocking"

**Core Principle:** Before implementing, modifying, or removing security controls, investigate the actual attack vectors, business risk, and user impact to ensure security measures provide genuine protection while enabling legitimate use.

**Codebase-First Focus:** Build security incrementally on existing architecture. Enhance current protections rather than wholesale replacement.

---

## Universal Investigation Framework

### Phase 1: Context Discovery

1. **Identify the security need** (threat, vulnerability, compliance requirement, or incident response)
2. **Understand the attack surface** (what assets, data, or processes need protection?)
3. **Assess current controls** (what security measures already exist and their effectiveness)
4. **Map user workflows** (how do legitimate users interact with the system?)
5. **Review existing security architecture** (what protections are already in place?)

### Phase 2: Threat Analysis

- What specific threats or attack vectors are we protecting against?
- What's the likelihood and potential impact of these threats?
- Who are the threat actors and what are their capabilities?
- What's the business impact if this security control fails or blocks legitimate use?
- **How does this integrate with existing security measures?**

### Phase 3: Security Impact Assessment

- **Threat Severity**: Likelihood and impact of the threat being mitigated
- **Business Risk**: Financial, regulatory, or reputational impact if exploited
- **User Impact**: Effect on legitimate user workflows and experience
- **Implementation Effort**: Complexity, cost, and maintenance overhead
- **Integration Fit**: How well does this fit existing security architecture?

---

## Quick Filter

Skip complex security implementation if all true:

- Very low threat probability with minimal potential impact
- Existing controls already provide adequate protection
- High user friction for minimal security benefit
- Compliance requirement can be met with simpler approach

→ **Document as acceptable security risk** in `security-debt.md`

---

## Security Priority Matrix

| Threat Severity | Business Risk | User Impact | Existing Controls | Priority |
|----------------|---------------|-------------|-------------------|----------|
| High | High | Low | Weak/None | **Critical – Implement immediately** |
| High | Medium | Low-Medium | Weak | **High – Implement this sprint** |
| Medium | High | Low | Weak | **Medium – Plan for next iteration** |
| High | High | High | Weak | **Redesign to balance security and usability** |
| High | Any | Any | Strong | **Verify existing controls, monitor** |
| Low | Low | Any | Any | **Document risk acceptance** |

---

## Codebase-First Security Rule

For *Critical* and *High* priority items:

1. **Layer on existing controls** - defense in depth
2. **Enhance incrementally** - improve current protections before adding new ones
3. **Maintain user experience** - security shouldn't block legitimate use
4. **Document security model** - ensure team understands protections
5. **Monitor effectiveness** - verify controls are working

Advanced features like complex multi-factor flows or extensive audit logging can be added later unless compliance requires them immediately.

---

## Ready-to-Use AI Prompt

```
You are to apply the Intent-First Security Philosophy to the following security concern.

### Security Context:
[Describe the threat, vulnerability, compliance requirement, or security incident]

### Investigation Requirements:
1. **Threat Analysis**:
   - Specific attack vectors being addressed
   - Threat actor capabilities and motivations
   - Likelihood and potential business impact

2. **Current Security Posture**:
   - Existing controls and their effectiveness
   - Known vulnerabilities or gaps
   - Previous incidents or near-misses
   - Current security architecture

3. **Impact Assessment**:
   - Effect on legitimate user workflows
   - Implementation complexity and cost
   - Ongoing maintenance requirements

4. **Control Options**:
   - Preventive controls (block attacks)
   - Detective controls (identify attacks)
   - Responsive controls (mitigate attacks)
   - Integration with existing controls

5. **Output Table**:
   | Factor | Assessment | Notes |
   |--------|------------|-------|
   | Threat Severity |  |  |
   | Business Risk |  |  |
   | User Impact |  |  |
   | Current Controls |  |  |
   | Recommended Approach |  |  |
   | Implementation Plan |  |  |
   | Success Metrics |  |  |

### Notes:
- Balance security effectiveness with user experience
- Consider defense in depth rather than single controls
- Focus on actual threats, not theoretical vulnerabilities
- Ensure controls can be monitored and maintained
- Build on existing security architecture
```

---

## Key Questions to Always Ask

- **"What specific attack vector does this control prevent?"**
- **"How will we know if this security control is effective?"**
- **"What legitimate user activities might this impact?"**
- **"Are there simpler ways to achieve the same security outcome?"**
- **"How will we detect if this control is being bypassed?"**
- **"What's the business justification for this level of security?"**
- **"How does this fit with existing security measures?"**

---

## Related

- See `intent-first-development-v1.0.md` for implementation
- See `intent-first-deployment-v1.0.md` for deployment security
