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
          existing_unit = ::ForemanAnsibleDirector::ContentUnit.find_by(namespace: unit.unit_namespace,
            name: unit.unit_name)
          op_type = operation_type! existing_unit, unit

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
                content_unit_id: existing_unit.id,
                organization_id: organization_id)
            else
              raise NotImplementedError
            end
          end
        end

        private

        # This function also mutates the versions array of unit to filter out existing units
        def operation_type!(existing_unit, unit)
          return :import unless existing_unit

          existing_versions = existing_unit.content_unit_versions.map(&:version).map(&:to_s)

          unit.versions = unit.versions.map(&:to_s) - existing_versions

          if unit.versions.empty?
            :noop
            # Also import if source_type = :galaxy and no galaxy version exists
          elsif unit.source_type == :git || !(existing_unit.content_unit_versions.pluck(:source_type).include? 'galaxy')
            :import
          else
            :update
          end
        end
      end
    end
  end
end
