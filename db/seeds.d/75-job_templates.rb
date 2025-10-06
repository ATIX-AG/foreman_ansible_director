User.as_anonymous_admin do
  JobTemplate.without_auditing do
    template_files = Dir[File.join("#{ForemanAnsibleDirector::Engine.root}/app/views/foreman_ansible_director/job_templates/**/*.erb")]

    template_files.each do |template|
      sync = !Rails.env.test? && Setting[:remote_execution_sync_templates]
      template = JobTemplate.import_raw!(File.read(template), :default => true, :lock => true, :update => sync)

      template.organizations << Organization.unscoped.all if template&.organizations&.empty?
      template.locations << Location.unscoped.all if template&.locations&.empty?
    end
  end
end