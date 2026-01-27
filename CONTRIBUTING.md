# Contributor Guidelines

We welcome **all contributors** to this project. Whether you're addressing a minor typo or implementing a major feature, your contributions are valued. Follow these guidelines to ensure a streamlined and collaborative development workflow.

---

## Commit Style

All commits must adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification. This ensures a consistent, meaningful history, simplifying changelog generation and code navigation.

### Supported Commit Types
Use one of the following types to describe your changes:
- `feat`: New features
- `fix`: Bug fixes
- `chore`: Maintenance tasks (e.g., dependency updates)
- `style`: Code formatting or linting changes
- `refactor`: Code restructuring without new features
- `perf`: Performance improvements
- `test`: Addition or modification of tests
- `build`: Changes to build systems or packaging
- `ci`: Changes to CI/CD configuration


**Scopes** (optional) can be used to provide additional context, such as `ui/execution_environments`.

**Example Commit Message**
```
feat(ui/execution_environments): rotate execution environment page by 180 degrees  
```  

If your work addresses a specific issue, reference the issue in the commit description (e.g., `refs #123`).

### Commit Best Practices
- Write **clear, concise, and descriptive** messages.
- Split work into **logical, atomic commits** whenever possible.
  - This is **highly recommended** to improve review efficiency and traceability.
- Use `git rebase` to maintain a clean history.
- Only squash commits to eliminate minor fixups or to simplify complex workflows.

---

## Merging Guidelines

We require **fast-forward-only merges** for all pull requests merged into the `main` branch.

To comply:
- Ensure your branch can be fast-forwarded into the base branch.
- Avoid merge commits.
- If necessary, rebase your branch to preserve a linear, readable history.

---

## Plugin Installation

### Foreman Plugin

1. **Clone the repository**:
   ```bash  
   git clone https://github.com/ATIX-AG/foreman_ansible_director.git  
   ```  

2. **Update the Gemfile**:
  - In the `foreman/bundler.d/` directory, create or edit `Gemfile.local.rb` and add:
    ```ruby  
    gem 'foreman_ansible_director', :path => '../foreman_ansible_director'  
    ```  

3. **Install dependencies**:
   ```bash  
   cd foreman  
   bundle install  
   ```  

4. **Run database migrations**:
   ```bash  
   bundle exec rake db:migrate  
   ```  

5. **Compile the UI**:  
   Since the UI is client-side, compile it using:
   ```bash  
   bundle exec foreman start webpack  
   ```  

> **Note**: This plugin requires a [custom branch](https://github.com/ATIX-AG/foreman/tree/develop_with_ts) of Foreman to support TypeScript.

For additional context, refer to:
- [Foreman Plugin Development Guide](https://github.com/theforeman/foreman/blob/develop/developer_docs/how_to_create_a_plugin.asciidoc)
- [Context-Based Permission Management](https://github.com/theforeman/foreman/blob/develop/developer_docs/handling_user_permissions.asciidoc)

---

### Smart Proxy Plugin

1. **Clone the repository**:
   ```bash  
   git clone https://github.com/ATIX-AG/smart_proxy_ansible_director.git  
   ```

2. **Update the Gemfile**:
  - In the `smart-proxy/bundler.d/` directory, create or edit `Gemfile.local.rb` and add:
    ```ruby  
    gem 'smart_proxy_ansible_director', :path => '../../smart_proxy_ansible_director'  
    ```  

3. **Install dependencies**:
   ```bash  
   cd smart-proxy  
   bundle install  
   ```  

4. **Verify Installation**:  
   Ensure the plugin is correctly loaded by checking the smart proxy logs.
