# Security Policy

## Supported Versions

The following versions of VuraKit / AgentVeil are currently supported with security updates:

| Version                | Supported |
| ---------------------- | --------- |
| Latest main branch     | ✅         |
| Previous minor release | ✅         |
| Older releases         | ❌         |

We strongly recommend using the latest version to receive security patches and improvements.

---

# Reporting a Vulnerability

We take security vulnerabilities seriously.

If you discover a security issue, vulnerability, exposed secret handling issue, proxy bypass, PII leak, authentication flaw, or compliance-related weakness, please report it responsibly.

## Please Do NOT

* Open public GitHub issues for security vulnerabilities
* Publicly disclose the vulnerability before it has been reviewed
* Share proof-of-concept exploits publicly before coordination

---

# How to Report

Please send a detailed vulnerability report including:

* Description of the issue
* Steps to reproduce
* Potential impact
* Affected versions
* Proof-of-concept (if available)
* Suggested mitigation (optional)

Report vulnerabilities via:

* GitHub Security Advisories (preferred)
* Email: [security@vurakit.dev](mailto:security@vurakit.dev)

If no security email exists yet, maintainers can temporarily use:

* Open a private GitHub security advisory draft

---

# Response Timeline

We aim to:

| Action                           | Timeline            |
| -------------------------------- | ------------------- |
| Initial acknowledgment           | Within 72 hours     |
| Vulnerability triage             | Within 7 days       |
| Security patch (critical issues) | As soon as possible |
| Public disclosure                | After patch release |

---

# Scope

This security policy applies to:

* Proxy server
* CLI tools
* SDKs
* MCP integrations
* Secret masking engine
* PII detection modules
* AI provider integrations
* Compliance and audit tooling
* Docker deployments
* Self-hosted instances

---

# Security Best Practices

When using VuraKit / AgentVeil:

## Protect Environment Variables

Never commit:

* `.env`
* API keys
* OAuth tokens
* Database credentials
* Cloud secrets

Use secret management solutions whenever possible.

---

## Use HTTPS

Always deploy behind HTTPS in production environments.

---

## Keep Dependencies Updated

Regularly update:

* Go modules
* Docker images
* AI SDK dependencies
* Reverse proxy dependencies

---

## Restrict Access

* Limit dashboard/admin access
* Use least-privilege permissions
* Rotate secrets regularly
* Monitor logs for suspicious activity

---

# Supported Security Features

Current platform security capabilities include:

* PII detection
* Secret masking
* Request proxying
* AI traffic inspection
* Compliance auditing
* Safe AI tool wrapping
* Secure SDK transport layers

---

# Responsible Disclosure

We appreciate responsible disclosure and collaboration from the security community.

Researchers acting in good faith will not be subject to legal action for responsible vulnerability disclosure efforts.

Please avoid:

* Data destruction
* Service disruption
* Privacy violations
* Accessing other users’ data
* Excessive automated scanning

---

# Security Updates

Security-related updates and advisories will be published through:

* GitHub Releases
* GitHub Security Advisories
* Project documentation

---

# Acknowledgements

We thank security researchers and contributors who help improve the safety and privacy of the project and its users.
