# 🤝 Contributing to WFM.ai

Thank you for your interest in contributing to WFM.ai! This document provides guidelines for contributing to our AI-native workforce management platform.

## 🏢 **Enterprise Contributions Welcome**

We especially welcome contributions from:
- **Contact center operators** implementing AI deflection strategies
- **Workforce management professionals** with domain expertise
- **Enterprise developers** building integrations
- **UI/UX designers** improving user experience

## 📋 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Git and GitHub account
- Basic understanding of workforce management concepts
- Familiarity with React + TypeScript (for code contributions)

### **Development Setup**
1. **Fork the repository** to your organization/personal account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/wfm-ai.git
   cd wfm-ai
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Add your ANTHROPIC_API_KEY
   ```
5. **Start development server**:
   ```bash
   npm run dev
   ```

## 🎯 **Types of Contributions**

### **🐛 Bug Reports**
- **Use the bug report template** when creating issues
- **Include browser/device information** for UI bugs
- **Provide steps to reproduce** the issue
- **Include screenshots/videos** when helpful
- **Test against the latest version** before reporting

### **💡 Feature Requests**
- **Check existing issues** to avoid duplicates
- **Describe the business problem** you're trying to solve
- **Explain the proposed solution** in detail
- **Consider enterprise impact** and scalability
- **Provide mockups/wireframes** for UI changes

### **📝 Documentation Improvements**
- **Fix typos and improve clarity**
- **Add examples and use cases**
- **Update installation instructions**
- **Enhance API documentation**
- **Translate content** (future internationalization)

### **🚀 Code Contributions**
- **Follow our coding standards** (see below)
- **Include comprehensive tests**
- **Update documentation** as needed
- **Ensure mobile responsiveness**
- **Maintain enterprise-grade quality**

## 🛠️ **Development Guidelines**

### **Code Style & Standards**
- **TypeScript**: All new code must be strongly typed
- **ESLint**: Follow the configured linting rules
- **Prettier**: Use automatic code formatting
- **Component Structure**: Follow existing patterns
- **Naming Conventions**: Use descriptive, enterprise-appropriate names

### **Coding Standards**
```typescript
// ✅ Good: Descriptive names and proper typing
interface WorkforceMetrics {
  currentFTE: number;
  requiredFTE: number;
  utilizationPercentage: number;
  deflectionRate: number;
}

// ❌ Avoid: Generic names and weak typing
interface Data {
  current: any;
  required: any;
  util: number;
  rate: number;
}
```

### **Component Guidelines**
- **Single Responsibility**: Each component should have one clear purpose
- **Props Interface**: Always define TypeScript interfaces for props
- **Error Boundaries**: Wrap components that might fail
- **Loading States**: Provide skeleton states for async operations
- **Accessibility**: Include ARIA labels and keyboard navigation

### **Performance Standards**
- **Bundle Size**: Keep additions under 50KB when possible
- **Lazy Loading**: Use React.lazy() for large components
- **Memoization**: Use React.memo() and useMemo() appropriately
- **Code Splitting**: Split large features into separate chunks

## 🧪 **Testing Requirements**

### **Before Submitting**
```bash
# Type checking
npm run type-check

# Code quality
npm run lint

# Build verification
npm run build && npm run preview
```

### **Browser Testing**
- **Chrome/Edge**: Primary enterprise browser support
- **Firefox**: Secondary compatibility
- **Safari**: Mobile and desktop testing
- **Mobile devices**: Touch interactions and responsiveness
- **Demo modes**: Verify all URL parameters work

### **Manual Testing Checklist**
- [ ] **Landing page** loads and is responsive
- [ ] **Feature modals** open and display correctly
- [ ] **WFM Copilot** chat interface functions
- [ ] **Charts and metrics** display accurately
- [ ] **Demo mode** (`?demo=true`) works
- [ ] **Screenshot mode** (`?screenshots=true`) works
- [ ] **Keyboard shortcuts** function in development
- [ ] **Error handling** shows appropriate messages

## 📝 **Pull Request Process**

### **PR Guidelines**
1. **Create feature branch** from `main`:
   ```bash
   git checkout -b feature/describe-your-change
   ```
2. **Make focused commits** with clear messages:
   ```bash
   git commit -m "Add AI deflection rate slider to forecast chart

   - Implements interactive slider for real-time deflection adjustment
   - Updates chart data automatically when slider changes
   - Maintains enterprise-appropriate styling
   - Includes TypeScript interfaces for props"
   ```
3. **Test thoroughly** using the checklist above
4. **Update documentation** if needed
5. **Submit PR** with detailed description

### **PR Template**
```markdown
## 📊 Business Impact
Describe how this change benefits enterprise users.

## 🛠️ Technical Changes
List the specific technical modifications made.

## 🧪 Testing Performed
- [ ] Manual testing completed
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness checked
- [ ] Demo modes functional

## 📝 Additional Notes
Any additional context or considerations.
```

### **Review Process**
- **Automated checks** must pass (TypeScript, linting, build)
- **Code review** by at least one maintainer
- **Manual testing** of new functionality
- **Performance review** for significant changes
- **Security review** for API or data handling changes

## 🏢 **Enterprise Integration Contributions**

### **Priority Areas**
- **UJET-specific enhancements**: Contact center integrations
- **SSO authentication**: Enterprise login systems
- **Custom metrics**: Organization-specific KPIs
- **API integrations**: Existing WFM system connections
- **Advanced analytics**: Enhanced reporting capabilities

### **Integration Guidelines**
- **Maintain backward compatibility**
- **Use environment variables** for configuration
- **Provide clear documentation**
- **Include migration guides** if needed
- **Test with enterprise data volumes**

## 🔒 **Security Considerations**

### **Security Standards**
- **Never expose API keys** in client-side code
- **Validate all user inputs** on both client and server
- **Use HTTPS** for all external communications
- **Follow OWASP guidelines** for web security
- **Sanitize data** before database operations

### **Data Handling**
- **No PII in logs** or error messages
- **Secure API endpoints** with proper authentication
- **Input validation** for all user-provided data
- **Error messages** should not expose system details

## 🚀 **Release Process**

### **Version Management**
- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Feature branches**: For new functionality
- **Hotfix branches**: For critical bug fixes
- **Release tags**: For stable versions

### **Documentation Updates**
- **Update RELEASES.md** with change descriptions
- **Update README.md** if installation process changes
- **Update API documentation** for new endpoints
- **Create migration guides** for breaking changes

## 💬 **Community & Support**

### **Getting Help**
- **GitHub Discussions**: For general questions and ideas
- **GitHub Issues**: For specific bugs and feature requests
- **Email support@wfm.ai**: For enterprise inquiries
- **Review existing documentation** before asking questions

### **Community Standards**
- **Be respectful** and professional in all interactions
- **Provide constructive feedback** during code reviews
- **Help others** when you can share knowledge
- **Focus on business impact** in discussions
- **Maintain enterprise-appropriate language**

## 📊 **Recognition**

### **Contributors**
All significant contributors will be:
- **Credited in releases** and documentation
- **Added to contributors list** in the repository
- **Mentioned in release notes** for major contributions
- **Invited to maintainer discussions** for ongoing contributors

### **Enterprise Partners**
Organizations providing significant contributions may be:
- **Featured as technology partners**
- **Included in case studies** (with permission)
- **Given early access** to new features
- **Consulted on roadmap decisions**

---

## 🙏 **Thank You**

Your contributions help make WFM.ai the leading solution for AI-native workforce management. Together, we're building the future of contact center operations!

For questions about contributing, please reach out via [GitHub Discussions](https://github.com/BingerPhoenix/wfm-ai/discussions) or email support@wfm.ai.