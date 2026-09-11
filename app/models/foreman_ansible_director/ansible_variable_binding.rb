# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleVariableBinding < AnsibleDirectorModel
    include ::ForemanAnsibleDirector::AnsibleVariableValue::ValueResolution

    belongs_to :consumable, polymorphic: true

    enum query: { local: 0 }
    enum transformer: { static: 0 }

    def render_for_api
      {
        id: id,
        variable_name: variable_name,
        data_type: data_type,
        raw_value: raw_value,
        query: self[:query],
        transformer: self[:transformer],
        parsed_value: value,
        consumable_type: if consumable_type == 'Host::Managed' || consumable_type == 'Host::Base'
                           'Host'
                         else
                           consumable_type
                         end,
        consumable_id: consumable_id,
        # Use title attribute for host groups
        consumable_name: consumable.try(:title) || consumable.try(:name),
        assignable_type: assignable_type,
        assignable_namespace: assignable_namespace,
        assignable_name: assignable_name,
        **(
          if assignable_type == 'ForemanAnsibleDirector::AnsibleCollectionRole'
            { assignable_role_name: assignable_role_name }
          else
            {}
          end
        ),
      }
    end
  end
end
