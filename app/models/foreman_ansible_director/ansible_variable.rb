# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleVariable < AnsibleDirectorModel
    include ::ForemanAnsibleDirector::AnsibleVariableValue::ValueResolution
    belongs_to :ownable, polymorphic: true, optional: false

    enum query: { local: 0 }
    enum transformer: { static: 0 }

    def bound_by
      if ownable.instance_of?(ForemanAnsibleDirector::AnsibleCollectionRole)
        ::ForemanAnsibleDirector::AnsibleVariableBinding.where(
          assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
          assignable_namespace: ownable.ansible_collection_version.versionable.namespace,
          assignable_name: ownable.ansible_collection_version.versionable.name,
          assignable_role_name: ownable.name,
          variable_name: name
        )
      else
        ::ForemanAnsibleDirector::AnsibleVariableBinding.where(
          assignable_type: 'ForemanAnsibleDirector::AnsibleRole',
          assignable_namespace: ownable.versionable.namespace,
          assignable_name: ownable.versionable.name,
          variable_name: name
        )
      end
    end

    def render_for_api
      {
        id: id,
        name: name,
        data_type: data_type,
        raw_value: raw_value,
        query: self[:query],
        transformer: self[:transformer],
        parsed_value: value,
        bindings_count: bound_by.count,
      }
    end
  end
end
