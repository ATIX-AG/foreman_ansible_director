# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  {
    assignments: @assignments.map do |assignment|
      {
        id: assignment.respond_to?(:id) ? assignment.id : 'preresolved',
        assignable_namespace: assignment[:assignable_namespace],
        assignable_name: assignment[:assignable_name],
        **(
          if assignment[:assignable_type] == 'ForemanAnsibleDirector::AnsibleCollectionRole'
            { assignable_role_name: assignment[:assignable_role_name] }
          else
            {}
          end
        ),
        assignable_type: assignment[:assignable_type],
        **(
          if assignment[:consumable_type].nil?
            {
              consumable_id: -1,
              consumable_type: @node_type || 'preresolved',
            }
          else
            {
              consumable_id: assignment[:consumable_id],
              consumable_type: assignment[:consumable_type],
            }
          end
        ),
        subtractive: assignment[:subtractive],
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
    content_source: {
      id: @effective_content_source.id,
      type: @effective_content_source.class.name,
    },
  }
end
