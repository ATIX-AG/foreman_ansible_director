# Foreman Ansible Director

Foreman Ansible Director is a plugin that is currently under development and aims to integrate basic and advanced Ansible features into Foreman.

## Features
### Supported Features
- Manage Ansible roles and collections from different organizations
- Use lifecycle management like `Development` -> `Test` -> `Production` for your Ansible content
- Ansible content is automatically synchronized to Smart Proxies
- Ansible Execution Environments are used to run Ansible
- Possibility to use different Ansible/Python versions in Ansible runs

### Planned Features
- Importing Ansible roles from version control systems
- Secret management
- Application centric approach

## Installation

Enable Ansible Director on Foreman Server:

```sh
dnf install rubygem-foreman_ansible_director

foreman-installer
```

### Smart Proxy Installation
You need to install [Smart Proxy Ansible Director](https://github.com/ATIX-AG/smart_proxy_ansible_director) to use this plugin.

## Documentation

The documentation will be available, soon.

## Contributing

Fork and send a Pull Request. Thanks!

## Copyright

Copyright (c) 2025 ATIX AG - https://atix.de

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
