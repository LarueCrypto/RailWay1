# Contributing to Goal Quest

First off, thank you for considering contributing to Goal Quest! It's people like you that make Goal Quest such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Note your environment** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **A clear and descriptive title**
- **Detailed description of the proposed feature**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write descriptive commit messages**
6. **Submit a pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/goal-quest.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` types when possible
- Use meaningful variable names

### React Components

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components small and focused
- Use proper prop types

### Styling

- Use Tailwind CSS utility classes
- Follow existing component patterns
- Maintain responsiveness
- Ensure accessibility (a11y)

### File Structure

```
client/src/
  components/     # Reusable UI components
  pages/          # Page components
  hooks/          # Custom hooks
  lib/            # Utilities
```

## Commit Message Guidelines

We follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(habits): add streak counter
fix(xp-bar): correct progress calculation
docs(readme): update installation instructions
```

## Testing

- Write tests for new features
- Update tests when modifying existing features
- Ensure all tests pass before submitting PR

```bash
npm test
```

## Documentation

- Update README.md for user-facing changes
- Add inline code comments for complex logic
- Update API documentation for backend changes
- Include JSDoc comments for public functions

## SVG Asset Guidelines

When contributing SVG assets for Figma:

1. **Optimize SVGs** - Remove unnecessary metadata
2. **Use consistent naming** - `kebab-case.svg`
3. **Include proper viewBox** attributes
4. **Use semantic grouping** with `<g>` tags
5. **Add descriptive IDs** and classes
6. **Test in Figma** before submitting

### SVG Structure

```svg
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradients, filters, patterns -->
  </defs>
  <g id="descriptive-name">
    <!-- Main content -->
  </g>
</svg>
```

## Design System

- Follow Solo Leveling aesthetic guidelines
- Maintain consistent color schemes
- Use defined spacing scale
- Follow typography hierarchy

### Color Palette

```
Primary: #8B5CF6 (Purple)
Secondary: #A78BFA (Light Purple)
Accent: #FFD700 (Gold)
Background: #1F2937 (Dark Gray)
```

## Review Process

1. **Automated checks** must pass (linting, tests)
2. **Code review** by maintainers
3. **Design review** for UI changes
4. **Testing** in development environment
5. **Approval** and merge

## Questions?

Feel free to:
- Open an issue for questions
- Join our Discord community
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Goal Quest! 🎮✨
