# frozen_string_literal: true

require 'pulpcore_client'
module ForemanAnsibleDirector
  module Proxy
    class BaseClient
      class << self
        def proxy_resource
          ssl_config = {
            ssl_client_cert: ::ForemanAnsibleDirector::Cert::Certs.ssl_client_cert,
            ssl_client_key: ::ForemanAnsibleDirector::Cert::Certs.ssl_client_key,
            ssl_ca_file: ::ForemanAnsibleDirector::Cert::Certs.ca_cert_file,
            verify_ssl: OpenSSL::SSL::VERIFY_PEER,
          }

          # TODO: This should be configurable by the user and use a selector
          if Rails.env.development?
            return RestClient::Resource.new(
              'http://192.168.121.1:8080'
            )
          end
          RestClient::Resource.new(
            ::SmartProxy.first.url, ssl_config
          )
        end
      end
    end
  end
end
