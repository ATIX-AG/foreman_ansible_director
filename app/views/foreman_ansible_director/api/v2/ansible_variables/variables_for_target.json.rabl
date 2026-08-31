# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  {
    assignments: @resolved_variables.map do |resolved_variable|
      assignment = resolved_variable[:assignment]
      {

        id: assignment.id,
        assignable_namespace: assignment.assignable_namespace,
        assignable_name: assignment.assignable_name,
        **(
          if assignment.assignable_type == 'ForemanAnsibleDirector::AnsibleCollectionRole'
            { assignable_role_name: assignment.assignable_role_name }
          else
            {}
          end
        ),
        assignable_type: assignment.assignable_type,
        consumable_id: assignment.consumable_id,
        consumable_type: if assignment.consumable_type == 'Host::Managed' || assignment.consumable_type == 'Host::Base'
                           'Host'
                         else
                           assignment.consumable_type
                         end,
        consumable_name: assignment.consumable.name,
        subtractive: assignment.subtractive,

        variables: resolved_variable[:variables].map do |variable|
          {
            id: variable[:id],
            name: variable[:name],
            data_type: variable[:data_type],
            raw_value: variable[:raw_value],
            binding: if variable[:binding].nil?
                       nil
                     else
                       variable[:binding].render_for_api
                     end,
          }
        end,
      }
    end,
    hierarchy: @hierarchy.reverse.map do |node|
      {
        id: node.id,
        name: node.cr_name,
        type: if node.instance_of?(Host::Managed) || node.instance_of?(Host::Base)
                'Host'
              else
                node.class.name
              end,
      }
    end,
  }
end
