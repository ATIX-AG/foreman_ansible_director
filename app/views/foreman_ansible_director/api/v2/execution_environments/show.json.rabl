# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  {
    id: @execution_environment.id,
    name: @execution_environment.name,
    base_image_url: @execution_environment.base_image_url,
    ansible_version: @execution_environment.ansible_version,
    build_status: @execution_environment.build_status,
    build_job: @execution_environment.build_job,
    content: @execution_environment.execution_environment_content_units.map do |eecu|
      {
        id: eecu.content_unit.id,
        type: eecu.content_unit.type == 'ForemanAnsibleDirector::AnsibleCollection' ? 'collection' : 'role',
        identifier: eecu.content_unit.full_name,
        version: eecu.content_unit_version&.version,
      }
    end,
  }
end
