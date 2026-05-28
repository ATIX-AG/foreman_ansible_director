# frozen_string_literal: true

module ForemanAnsibleDirector
  module AnsibleContent
    class AnsibleContentHelpers
      class << self
        def decode_requirements_yml(raw_file)
          decoded_yml = base64_to_yml(raw_file)

          collections = []
          roles = []

          decoded_yml['collections']&.each do |collection|
            collections.push(ParsedAnsibleContentUnit.new(:collection, **collection))
          end

          decoded_yml['roles']&.each do |role|
            roles.push(ParsedAnsibleContentUnit.new(:role, **role))
          end

          [].concat(collections).concat(roles)
        end

        def resolve_destroy_payload(payload)
          unit_ids = payload.map { |u| u[:unit_id] }

          units = ::ForemanAnsibleDirector::ContentUnit
                  .where(id: unit_ids)
                  .includes(:content_unit_versions)
                  .index_by(&:id)

          unit_versions = Hash.new { |h, k| h[k] = { versions: { galaxy: Set.new, git: Set.new }, complete: false } }

          payload.each do |unit|
            unit_id = unit[:unit_id]
            unit_record = units[unit_id]
            raise(ActiveRecord::RecordNotFound, "Content unit with id #{unit_id} not found") unless unit_record

            all_version_ids = unit_record.content_unit_versions.pluck(:id).to_set

            if (requested_versions = unit[:unit_version_ids]).nil?
              unit_versions[unit_id][:complete] = true # Key not given -> Full deletion
            else
              requested_versions.each do |version_id|
                cuv = ContentUnitVersion.find_by(id: version_id)
                raise(ActiveRecord::RecordNotFound, "Version with id #{version_id} not found") unless cuv

                source_type = cuv.source_type.to_sym
                unit_versions[unit_id][:versions][source_type].add(version_id)
              end
            end

            supplied_galaxy_versions = unit_versions[unit_id][:versions][:galaxy]
            supplied_git_versions = unit_versions[unit_id][:versions][:git]

            if (supplied_galaxy_versions + supplied_git_versions).to_set.superset?(all_version_ids)
              unit_versions[unit_id][:complete] = true
            end
          end

          unit_versions.transform_values do |types|
            {
              versions: {
                galaxy: types[:versions][:galaxy].to_a,
                git: types[:versions][:git].to_a,
              },
              complete: types[:complete],
            }
          end
        end

        def resolve_import_payload(payload)
          units = {}
          payload.each do |unit|
            unit_type = valid_unit_type! unit[:unit_type]
            unit_name = valid_unit_name! unit[:unit_name]
            unit_source_type = valid_unit_source_type! unit[:unit_source_type] || 'galaxy'
            unit_source = valid_unit_source! unit[:unit_source]
            unit_versions = if unit_source_type != :git
                              valid_unit_versions! unit[:unit_versions]
                            else
                              unit[:unit_versions]
                            end
            unit_id = "#{unit_name}_#{Base64.encode64(unit_source)}" # Uniquely identifiable by name and source

            if (existing_unit = units[unit_id])
              existing_unit.versions = existing_unit.versions | unit_versions
            else
              sacu = SimpleAnsibleContentUnit.new(
                unit_type: unit_type,
                unit_name: unit_name,
                unit_source_type: unit_source_type,
                unit_source: unit_source,
                unit_versions: unit_versions
              )
              units[unit_id] = sacu
            end
          end
          units.values
        end

        private

        def valid_unit_name!(unit_name)
          return unit_name if /^(.*)\.(.*)$/.match?(unit_name)
          raise # TODO: Exception
        end

        def valid_unit_type!(unit_type)
          if (type = { 'collection' => :collection, 'role' => :role }[unit_type])
            return type
          end
          raise # TODO: Exception
        end

        def valid_unit_source_type!(unit_source_type)
          if (type = { 'galaxy' => :galaxy, 'git' => :git }[unit_source_type])
            return type
          end
          raise # TODO: Exception
        end

        def valid_unit_source!(unit_source)
          unit_source || Setting[:ansible_director_default_galaxy_url]
        end

        def valid_unit_versions!(unit_versions)
          unit_versions&.each do |version|
            unless /^\d+\.\d+\.\d+$/.match?(version)
              raise # TODO: Exception
            end
          end
          unit_versions
        end

        def base64_to_yml(base64_string)
          base64_string = base64_string.split(',')[1] if base64_string.start_with?('data:application/x-yaml;base64,')
          YAML.safe_load(Base64.decode64(base64_string))
        end
      end
    end
  end
end
