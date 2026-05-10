# Contributing to ateschh-kit

Thank you for your interest in contributing!

## Ways to Contribute

- **Bug reports**: Open an issue describing the behavior and expected behavior
- **New workflows**: Add a new slash command in `workflows/`
- **New agents**: Add a specialist agent in `agents/`
- **New skills**: Add a reusable skill in `skills/`
- **Documentation**: Improve or translate README files
- **Stack support**: Add deployment playbooks for new platforms

## Guidelines

### Adding a Workflow

1. Copy `workflows/_TEMPLATE.md`
2. Fill in all sections
3. Add the command to `CLAUDE.md` command table
4. Test it with a real project

### Adding an Agent

1. Copy `agents/_TEMPLATE.md`
2. Define: role, process, output format, rules
3. Reference it from the appropriate workflow
4. Document which skill(s) it uses

### Adding a Skill

1. Create `skills/{name}/SKILL.md`
2. Keep it atomic — one skill, one responsibility
3. Document: purpose, steps, output template

## Principles

- **Stay thin**: Orchestrators coordinate. Agents and skills do the work.
- **Explicit over implicit**: Every rule, every constraint, every output format should be written down.
- **English only**: All system files are in English. Translations live in README.{lang}.md files.
- **No personal references**: All content must work for any user.

## Pull Request Process

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test with at least one real project
5. Submit a PR with a clear description

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
