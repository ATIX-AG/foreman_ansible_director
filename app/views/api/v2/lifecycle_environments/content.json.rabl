# frozen_string_literal: true

object @lifecycle_environment

node :content do |object|
  if object.content_unit_versions.empty?
    []
  else
    collections = []
    roles = []
    object.content_unit_versions.map do |lcecu|
      unit = {
        id: lcecu.versionable.id,
        name: lcecu.versionable.name,
        namespace: lcecu.versionable.namespace,
        type: lcecu.versionable.type == 'AnsibleCollection' ? 'collection' : 'role',
        identifier: lcecu.versionable.full_name,
        versions: [],
      }

      unit[:versions] = if lcecu.versionable.type == 'AnsibleCollection'
                          if @full_content
                            c_roles = lcecu.ansible_collection_roles.map do |collection_role|
                              {
                                id: collection_role.id,
                                name: collection_role.name,
                              }
                            end
                            [
                              {
                                id: lcecu.id,
                                version: lcecu.version,
                                roles: c_roles
                              },
                            ]
                          else
                            [
                              {
                                id: lcecu.id,
                                version: lcecu.version,
                              },
                            ]
                          end
                        else
                          [
                            {
                              id: lcecu.id,
                              version: lcecu.version,
                            },
                          ]
                        end

      if unit[:type] == 'collection'
        collections << unit
      else
        roles << unit
      end

    end
    {
      collections: collections,
      roles: roles,
    }
  end
end
