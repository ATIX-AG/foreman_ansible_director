
module ApplicationCable
class TestChannel < ApplicationCable::Base::AnsibleDirectorChannel
  def subscribed
    stream_from "task_#{params[:id]}"
  end

end
end