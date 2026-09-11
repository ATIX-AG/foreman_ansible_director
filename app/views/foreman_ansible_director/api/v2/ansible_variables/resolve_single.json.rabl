# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  {
    variable: if @mapped_variable.nil?
                nil
              else
                @mapped_variable.render_for_api
              end,
    bindings: @hierarchical_bindings.map do |node|
      binding = node[:binding]
      crn = node[:node]

      {
        binding: if binding.nil?
                   nil
                 else
                   binding.render_for_api
                 end,
        content_resolution_node: {
          id: crn.id,
          name: crn.cr_name,
          type: if crn.instance_of?(Host::Managed) || crn.instance_of?(Host::Base)
                  'Host'
                else
                  crn.class.name
                end,
        },
      }
    end,
  }
end
