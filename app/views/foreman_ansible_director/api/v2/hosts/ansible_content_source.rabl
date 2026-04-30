# frozen_string_literal: true

node(:ansible_content_source) do
  cs, hierarchy = ::ForemanAnsibleDirector::AssignmentService.content_source_for(@host)

  if cs
    {
      id: cs.id,
      type: 'ForemanAnsibleDirector::LifecycleEnvironment',
      inherited: hierarchy.length > 1,
      hierarchy: hierarchy.reverse!.map do |node|
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
end
