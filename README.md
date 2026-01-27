# Foreman Ansible Director

Foreman Ansible Director is a foreman plugin integrating Ansible into Foreman.

## Current Status
> [!WARNING]  
> At the time of publishing (2026-02-01), this plugin is in an intermediate state.
> It is not ready for production use.

Several sections of code need to be refactored and cleaned up.
The API is not stable yet and may change without notice.
Test coverage is very low.
Breaking changes are expected until version 1.0.0 is reached.

## Features
- Explicit management of both Ansible Roles and Collections
- Native multi-version support for Ansible content
- Organizations can be used to taxonomize Ansible content
- Simplified Ansible content management:
  - Importing and deletion of Ansible content can be done via the Foreman web-UI
  - Ansible content can be imported from Ansible Galaxy and Git repositories
- A dedicated lifecycle management system for Ansible content allows promotion of configurations along a path such as `Development` -> `Test` -> `Production` similar to Katello lifecycle environments.
- Ansible and its dependencies are encapsulated in execution environments, which are used to run Ansible content.
- Use of different ansible-core versions through execution environments.
- Automatic provisioning of execution environments and Ansible content based on user-defined Ansible configurations.
- Unified interface (REST API) for both UI and external tools.


## Installation and contribution

Because we are still in the early stages of development, facilities for packaging this plugin do not exist yet.
If you want to test this plugin or contribute to it, you can install it manually.
Please see the instructions in [the contribution guidelines](CONTRIBUTING.md) for more details.

### Smart Proxy Installation
You need to install [Smart Proxy Ansible Director](https://github.com/ATIX-AG/smart_proxy_ansible_director) to use this plugin.

## Copyright

Copyright (c) 2026 ATIX AG - https://atix.de

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
