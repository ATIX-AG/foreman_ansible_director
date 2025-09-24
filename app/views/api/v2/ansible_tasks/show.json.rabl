# frozen_string_literal: true

collection @steps

attributes :action_class, :state

node(:output) do |step|
  index = @steps.index(step)
  @step_outputs[index] if index
end