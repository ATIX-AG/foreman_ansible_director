# frozen_string_literal: true

require 'pulpcore_client'
module ForemanAnsibleDirector
  module Proxy
    class BaseClient
      class << self
        def proxy_resource
          # TODO: SSL config, parametrize.

          _ssl_config = {
            ssl_client_cert: ::ForemanAnsibleDirector::Cert::Certs.ssl_client_cert,
            ssl_client_key: ::ForemanAnsibleDirector::Cert::Certs.ssl_client_key,
            ssl_ca_file: ::ForemanAnsibleDirector::Cert::Certs.ca_cert_file,
            verify_ssl: OpenSSL::SSL::VERIFY_NONE,
          }

          RestClient::Resource.new(
            'http://192.168.121.1:8080'
          )
        end
      end
    end
  end
end
