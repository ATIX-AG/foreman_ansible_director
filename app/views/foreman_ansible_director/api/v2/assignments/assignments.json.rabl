# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  {
    assignments: @assignments.map do |assignment|
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
        resolved:
          if @resolved_assignments
            resolved = @resolved_assignments.find do |r|
              r[:assignment] == assignment
            end

            unless resolved.nil?
              if resolved[:type] == 'ForemanAnsibleDirector::AnsibleCollectionRole'
                {
                  version: resolved[:cuv].ansible_collection_version.version,
                }
              else
                {
                  version: resolved[:cuv].version,
                }
              end
            end
          end,
      }
    end,
    hierarchy: @hierarchy.reverse!.map do |node|
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
