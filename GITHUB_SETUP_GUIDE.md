# 🚀 BetsUp! - GitHub Repository Setup Guide

## 📋 **Repository Creation Steps**

### **1. Create GitHub Repository**

#### **Option A: GitHub CLI (Recommended)**
```bash
# Install GitHub CLI if not already installed
# macOS: brew install gh
# Login to GitHub
gh auth login

# Create repository
gh repo create betsup/betsup-app --public --description "BetsUp! - Social betting platform for friends"

# Add remote origin
git remote add origin https://github.com/betsup/betsup-app.git

# Push initial commit
git push -u origin main
```

#### **Option B: GitHub Web Interface**
1. Go to https://github.com/new
2. **Repository name**: `betsup-app`
3. **Owner**: Create organization `betsup` or use personal account
4. **Description**: "BetsUp! - Social betting platform for friends"
5. **Visibility**: Public (or Private for initial development)
6. **Initialize**: Don't initialize (we already have files)
7. Click "Create repository"

```bash
# Add remote origin (replace with your actual repository URL)
git remote add origin https://github.com/betsup/betsup-app.git

# Push initial commit
git push -u origin main
```

### **2. Repository Configuration**

#### **Branch Protection Rules**
Go to Settings → Branches → Add rule:

**Main Branch Protection:**
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require approvals (1)
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Restrict pushes that create files larger than 100MB

**Required Status Checks:**
- `test (18.x)`
- `test (20.x)`
- `security`
- `build (iOS)`
- `build (Android)`

#### **Repository Settings**
- ✅ **Issues**: Enable for bug tracking and feature requests
- ✅ **Projects**: Enable for project management
- ✅ **Wiki**: Enable for documentation
- ✅ **Discussions**: Enable for community engagement
- ✅ **Sponsorships**: Enable if seeking funding
- ✅ **Security**: Enable vulnerability alerts

### **3. GitHub Secrets Configuration**

Go to Settings → Secrets and variables → Actions:

#### **Firebase Secrets**
```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
FIREBASE_SERVICE_ACCOUNT_STAGING={"type":"service_account",...}
FIREBASE_SERVICE_ACCOUNT_PROD={"type":"service_account",...}
```

#### **OAuth Provider Secrets**
```
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_CLIENT_TOKEN=your_facebook_client_token
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### **iOS Deployment Secrets**
```
IOS_DIST_SIGNING_KEY=base64_encoded_p12_certificate
IOS_DIST_SIGNING_KEY_PASSWORD=certificate_password
APPSTORE_ISSUER_ID=your_app_store_connect_issuer_id
APPSTORE_KEY_ID=your_app_store_connect_key_id
APPSTORE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----
```

#### **Android Deployment Secrets**
```
ANDROID_KEYSTORE=base64_encoded_keystore_file
ANDROID_KEYSTORE_PASSWORD=keystore_password
ANDROID_KEY_ALIAS=key_alias
ANDROID_KEY_PASSWORD=key_password
GOOGLE_PLAY_SERVICE_ACCOUNT={"type":"service_account",...}
```

#### **Deployment Secrets**
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
SNYK_TOKEN=your_snyk_token_for_security_scanning
```

#### **Admin System Secrets**
```
ADMIN_API_BASE_URL=https://api.betsup.app
ADMIN_JWT_SECRET=your_jwt_secret_key
ADMIN_DATABASE_URL=your_admin_database_connection_string
```

### **4. Environment Configuration**

#### **Create Environment Files**
```bash
# Development environment
echo "REACT_APP_ENVIRONMENT=development
REACT_APP_FIREBASE_API_KEY=your_dev_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=betsup-dev.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=betsup-dev
REACT_APP_API_BASE_URL=http://localhost:5001" > .env.development

# Staging environment  
echo "REACT_APP_ENVIRONMENT=staging
REACT_APP_FIREBASE_API_KEY=your_staging_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=betsup-staging.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=betsup-staging
REACT_APP_API_BASE_URL=https://api-staging.betsup.app" > .env.staging

# Production environment
echo "REACT_APP_ENVIRONMENT=production
REACT_APP_FIREBASE_API_KEY=your_prod_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=betsup-production.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=betsup-production
REACT_APP_API_BASE_URL=https://api.betsup.app" > .env.production
```

### **5. GitHub Environments Setup**

#### **Create Environments**
Go to Settings → Environments:

**Development Environment:**
- Name: `development`
- Deployment branches: `feature/*`, `develop`
- Environment secrets: Development Firebase config
- Required reviewers: None (auto-deploy)

**Staging Environment:**
- Name: `staging`
- Deployment branches: `develop`
- Environment secrets: Staging Firebase config
- Required reviewers: 1 team member

**Production Environment:**
- Name: `production`
- Deployment branches: `main`
- Environment secrets: Production Firebase config
- Required reviewers: 2 team members
- Wait timer: 5 minutes

### **6. Issue and PR Templates**

#### **Bug Report Template**
```bash
mkdir -p .github/ISSUE_TEMPLATE
```

Create `.github/ISSUE_TEMPLATE/bug_report.md`:
```markdown
---
name: Bug report
about: Create a report to help us improve BetsUp!
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Device Information:**
- Device: [e.g. iPhone 14, Samsung Galaxy S23]
- OS: [e.g. iOS 16.1, Android 13]
- App Version: [e.g. 1.2.3]

**Additional context**
Add any other context about the problem here.
```

#### **Feature Request Template**
Create `.github/ISSUE_TEMPLATE/feature_request.md`:
```markdown
---
name: Feature request
about: Suggest an idea for BetsUp!
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.

**User Tier Impact**
Which subscription tiers should have access to this feature?
- [ ] Free
- [ ] Standard
- [ ] Pro
- [ ] Premium
```

#### **Pull Request Template**
Create `.github/pull_request_template.md`:
```markdown
## 📋 **Pull Request Description**

### **What does this PR do?**
Brief description of the changes made.

### **Type of Change**
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration change
- [ ] 🎨 UI/UX improvement

### **Testing**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] iOS testing completed
- [ ] Android testing completed

### **Screenshots (if applicable)**
Add screenshots or GIFs showing the changes.

### **Checklist**
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

### **Related Issues**
Closes #(issue number)
```

### **7. GitHub Actions Workflow Status**

After pushing to GitHub, verify workflows are working:

1. Go to Actions tab in your repository
2. Check that all workflows are enabled
3. Verify the initial commit triggered the workflows
4. Check for any configuration issues

**Expected Workflows:**
- ✅ **Test Suite** - Runs on every push/PR
- ✅ **iOS Build** - Builds iOS app
- ✅ **Android Build** - Builds Android app  
- ✅ **Web Deploy** - Deploys web app (main branch only)

### **8. Repository Labels**

Create labels for better issue organization:

```bash
# Priority labels
gh label create "priority: high" --color "d73a4a" --description "High priority issue"
gh label create "priority: medium" --color "fbca04" --description "Medium priority issue"
gh label create "priority: low" --color "0e8a16" --description "Low priority issue"

# Type labels
gh label create "type: bug" --color "d73a4a" --description "Something isn't working"
gh label create "type: feature" --color "a2eeef" --description "New feature or request"
gh label create "type: enhancement" --color "84b6eb" --description "Enhancement to existing feature"
gh label create "type: documentation" --color "0075ca" --description "Improvements or additions to documentation"

# Platform labels
gh label create "platform: ios" --color "000000" --description "iOS specific issue"
gh label create "platform: android" --color "a4c639" --description "Android specific issue"
gh label create "platform: web" --color "1f77b4" --description "Web platform issue"

# Component labels
gh label create "component: auth" --color "c5def5" --description "Authentication related"
gh label create "component: bets" --color "f9d0c4" --description "Betting functionality"
gh label create "component: admin" --color "d4c5f9" --description "Admin portal"
gh label create "component: payments" --color "c2e0c6" --description "Payment processing"
```

### **9. Project Management Setup**

#### **Create GitHub Project**
1. Go to Projects tab → New project
2. Choose "Board" template
3. Name: "BetsUp! Development"
4. Add columns:
   - 📋 **Backlog** - New issues and ideas
   - 🏗️ **In Progress** - Currently being worked on
   - 👀 **In Review** - Pull requests under review
   - ✅ **Done** - Completed items

#### **Milestones**
Create milestones for major releases:
- **v1.0.0 - MVP Launch** - Core betting functionality
- **v1.1.0 - Enhanced Features** - Bet series and templates
- **v1.2.0 - Premium Features** - Subscription tiers
- **v2.0.0 - Admin Portal** - Complete admin system

### **10. Repository README Badge Setup**

Add status badges to your README.md:

```markdown
# BetsUp! - Social Betting Platform

[![Build Status](https://github.com/betsup/betsup-app/workflows/Test%20Suite/badge.svg)](https://github.com/betsup/betsup-app/actions)
[![iOS Build](https://github.com/betsup/betsup-app/workflows/iOS%20Build/badge.svg)](https://github.com/betsup/betsup-app/actions)
[![Android Build](https://github.com/betsup/betsup-app/workflows/Android%20Build/badge.svg)](https://github.com/betsup/betsup-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
```

## 🎯 **Next Steps After Repository Setup**

### **Immediate Actions**
1. **Push code to GitHub** - `git push -u origin main`
2. **Verify CI/CD pipelines** - Check Actions tab
3. **Set up Firebase projects** - Development, Staging, Production
4. **Configure domain DNS** - Point betsup.app and betsup.bet to hosting
5. **Set up monitoring** - Error tracking and performance monitoring

### **Team Setup**
1. **Invite collaborators** - Add team members to repository
2. **Set up team permissions** - Admin, Write, Read access levels
3. **Create teams** - Frontend, Backend, Mobile, DevOps
4. **Assign code owners** - CODEOWNERS file for automatic reviews

### **Security Setup**
1. **Enable security features** - Dependabot, security advisories
2. **Set up code scanning** - CodeQL for vulnerability detection
3. **Configure secrets scanning** - Prevent accidental secret commits
4. **Set up branch protection** - Require reviews and status checks

This comprehensive GitHub setup ensures BetsUp! has a professional, scalable development workflow from day one! 🚀
