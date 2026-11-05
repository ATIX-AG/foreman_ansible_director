# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class CuvStillReferencedError < BaseError
        def initialize(cuv:,
                       references:) # references returned by referenced_by: {lce: <LCE>, via: <LCECUV | CSCUV>}[]
          @cuv = cuv
          @references = references
          super
        end

        def title
          _('Version still referenced')
        end

        def message
          plural = if @references.length > 1
                     _('lifecycle environments')
                   else
                     _('lifecycle environment')
                   end

          <<~MESSAGE
            Version #{@cuv.version} is in use by #{@references.length} #{plural}.

            #{@references.map do |ref|
                is_direct = ref[:via].is_a?(::ForemanAnsibleDirector::LifecycleEnvironmentContentUnitVersion)
                via_status = if is_direct
                               _('directly')
                             else # {' '}
                               _('via snapshot')
                             end
                action_text = if is_direct
                                _("To change this, unassign #{@cuv.version} version from #{ref[:lce].name}.")
                              else
                                _("To change this, promote a lifecycle environment that does not contain #{@cuv.version} to #{ref[:lce].name}.")
                              end

                <<~REFERENCE
                  - LCE #{ref[:lce].lifecycle_environment_path.name} > #{ref[:lce].name} (ID: #{ref[:lce].id}) #{via_status}
                  #{action_text}
                REFERENCE
              end.join("\n")
            }
          MESSAGE
        end

        def status_code
          422
        end
      end
    end
  end
end
