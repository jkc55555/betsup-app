# 🚀 BetsUp! - GitHub Repository Setup Instructions

## 📋 **Step-by-Step GitHub Repository Creation**

Since GitHub CLI is not available, follow these manual steps:

### **1. Create Repository on GitHub.com**

#### **Go to GitHub and Create New Repository**
1. **Navigate to**: https://github.com/new
2. **Repository name**: `betsup-app`
3. **Owner**: Your GitHub username (or create `betsup` organization)
4. **Description**: `BetsUp! - Social betting platform for friends to make bets on anything with easy Venmo payments`
5. **Visibility**: 
   - ✅ **Public** (Recommended for open source)
   - Or **Private** (If you prefer closed source initially)
6. **Initialize repository**: 
   - ❌ **DO NOT** add README file
   - ❌ **DO NOT** add .gitignore
   - ❌ **DO NOT** choose a license
   - (We already have all these files)
7. **Click**: "Create repository"

### **2. Connect Local Repository to GitHub**

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote origin (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/betsup-app.git

# Verify the remote was added correctly
git remote -v

# Push the code to GitHub
git push -u origin main
```

### **3. Verify Repository Upload**

After pushing, you should see:
- ✅ All 95+ files uploaded
- ✅ 3 commits in the history
- ✅ README.md displaying project information
- ✅ GitHub Actions workflows in `.github/workflows/`

### **4. Enable GitHub Actions**

1. **Go to**: Your repository → Actions tab
2. **Enable workflows**: Click "I understand my workflows, go ahead and enable them"
3. **Verify workflows**: You should see 4 workflows:
   - Test Suite
   - iOS Build  
   - Android Build
   - Web Deploy

### **5. Configure Repository Settings**

#### **General Settings**
1. **Go to**: Settings → General
2. **Features**:
   - ✅ Issues (for bug tracking)
   - ✅ Projects (for project management)
   - ✅ Wiki (for documentation)
   - ✅ Discussions (for community)
3. **Pull Requests**:
   - ✅ Allow merge commits
   - ✅ Allow squash merging
   - ✅ Allow rebase merging
   - ✅ Always suggest updating pull request branches
   - ✅ Automatically delete head branches

#### **Branch Protection Rules**
1. **Go to**: Settings → Branches
2. **Add rule** for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
   - ✅ Include administrators

#### **Security Settings**
1. **Go to**: Settings → Security & analysis
2. **Enable**:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning alerts

### **6. Add Repository Secrets**

Go to Settings → Secrets and variables → Actions and add these secrets:

#### **Firebase Secrets**
```
FIREBASE_API_KEY_DEV=your_development_api_key
FIREBASE_API_KEY_STAGING=your_staging_api_key  
FIREBASE_API_KEY_PROD=your_production_api_key
FIREBASE_SERVICE_ACCOUNT_DEV={"type":"service_account",...}
FIREBASE_SERVICE_ACCOUNT_STAGING={"type":"service_account",...}
FIREBASE_SERVICE_ACCOUNT_PROD={"type":"service_account",...}
```

#### **OAuth Provider Secrets**
```
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_CLIENT_TOKEN=your_facebook_client_token
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### **Mobile App Signing Secrets**
```
# iOS
IOS_DIST_SIGNING_KEY=base64_encoded_p12_certificate
IOS_DIST_SIGNING_KEY_PASSWORD=certificate_password
APPSTORE_ISSUER_ID=your_app_store_connect_issuer_id
APPSTORE_KEY_ID=your_app_store_connect_key_id
APPSTORE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...

# Android
ANDROID_KEYSTORE=base64_encoded_keystore_file
ANDROID_KEYSTORE_PASSWORD=keystore_password
ANDROID_KEY_ALIAS=betsup-key
ANDROID_KEY_PASSWORD=key_password
GOOGLE_PLAY_SERVICE_ACCOUNT={"type":"service_account",...}
```

#### **Deployment Secrets**
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
SNYK_TOKEN=your_snyk_security_token
```

### **7. Create GitHub Environments**

Go to Settings → Environments and create:

#### **Development Environment**
- **Name**: `development`
- **Deployment branches**: `feature/*`, `develop`
- **Environment secrets**: Development Firebase config
- **Required reviewers**: None (auto-deploy)

#### **Staging Environment**
- **Name**: `staging`
- **Deployment branches**: `develop`
- **Environment secrets**: Staging Firebase config
- **Required reviewers**: 1 team member

#### **Production Environment**
- **Name**: `production`
- **Deployment branches**: `main`
- **Environment secrets**: Production Firebase config
- **Required reviewers**: 2 team members
- **Wait timer**: 5 minutes

### **8. Add Collaborators (Optional)**

If working with a team:
1. **Go to**: Settings → Manage access
2. **Invite collaborators**: Add team members
3. **Set permissions**: Admin, Write, or Read access

### **9. Create Project Board**

1. **Go to**: Projects → New project
2. **Choose**: Board template
3. **Name**: "BetsUp! Development"
4. **Add columns**:
   - 📋 Backlog
   - 🏗️ In Progress  
   - 👀 In Review
   - ✅ Done

### **10. Set Up Issue Templates**

The repository already includes issue templates in `.github/ISSUE_TEMPLATE/`:
- Bug report template
- Feature request template
- Pull request template

These will automatically appear when users create issues or PRs.

## ✅ **Verification Checklist**

After completing setup, verify:

- [ ] Repository created and code pushed successfully
- [ ] All 95+ files visible in GitHub
- [ ] GitHub Actions workflows enabled and visible
- [ ] Branch protection rules configured
- [ ] Repository secrets added
- [ ] Environments configured
- [ ] Issue templates working
- [ ] README.md displaying correctly

## 🚀 **Next Steps After GitHub Setup**

Once the repository is live:

1. **Test CI/CD Pipeline**: Create a test branch and PR to verify workflows
2. **Set up Firebase Projects**: Create development, staging, and production projects
3. **Configure Domain DNS**: Point betsup.app and betsup.bet to hosting
4. **Update OAuth Providers**: Configure with new repository URLs
5. **Prepare App Store Listings**: Create App Store Connect and Play Console entries

## 🎯 **Success Metrics**

After GitHub setup, you should have:
- ✅ Professional repository with comprehensive documentation
- ✅ Automated CI/CD pipeline ready for deployment
- ✅ Security and compliance features enabled
- ✅ Team collaboration tools configured
- ✅ Issue tracking and project management ready

**BetsUp! is now ready for collaborative development and automated deployment!** 🎉

---

## 📞 **Need Help?**

If you encounter any issues:
1. Check GitHub's documentation: https://docs.github.com
2. Verify all files were pushed: `git log --oneline`
3. Test workflows: Create a test branch and push changes
4. Review secrets: Ensure all required secrets are added

**The repository setup is the foundation for everything else - take time to get it right!** 🏗️
