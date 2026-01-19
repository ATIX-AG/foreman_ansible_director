# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      class Import < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        input_format do
          param :unit, Object, required: true # SimpleAnsibleContentUnit
          param :organization_id, required: true
        end

        def plan(args)
          unit = args[:unit]
          organization_id = args[:organization_id]
          op_type = operation_type unit

          case op_type
          when :import
            case unit.source_type
            when :git
              plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ImportProviders::Git::Import,
                unit: unit,
                organization_id: organization_id)
            when :galaxy
              plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ImportProviders::Galaxy::Import,
                unit: unit,
                organization_id: organization_id)
            else
              raise NotImplementedError
            end
          when :update
            case unit.source_type
            when :git
              raise NotImplementedError
            when :galaxy
              plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ImportProviders::Galaxy::Update,
                unit: unit,
                organization_id: organization_id)
            else
              raise NotImplementedError
            end
          else
            raise NotImplementedError
          end
        end

        private

        # Helper method to decide the operation type:
        # e = Unit exists; v = Unit.version exists; s = Force override
        # | e | v | s | operation |
        # | 0 | 0 | 0 | :import |
        # | 0 | 0 | 1 | :import |
        # | 0 | 1 | 0 | INVALID |
        # | 0 | 1 | 1 | INVALID |
        # | 1 | 0 | 0 | :update |
        # | 1 | 0 | 1 | :update |
        # | 1 | 1 | 0 | NOOP    |
        # | 1 | 1 | 1 | :update |
        # TODO: Unit test this
        def operation_type(unit)
          force_override = Setting[:ad_content_import_override]

          existing_unit = ::ForemanAnsibleDirector::ContentUnit.find_by(namespace: unit.unit_namespace,
            name: unit.unit_name)
          return :import unless existing_unit

          existing_unit_versions = existing_unit.content_unit_versions.select do |x|
            unit.versions.include? x.version
          end

          return :noop if !existing_unit_versions.empty? && !force_override
          :update
        end
      end
    end
  end
end
