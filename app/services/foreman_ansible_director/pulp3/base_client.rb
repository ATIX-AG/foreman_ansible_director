# frozen_string_literal: true

require 'pulpcore_client'
module ForemanAnsibleDirector
  module Pulp3
    class BaseClient
      class << self
        def pulp3_configuration(config_class)
          config_class.new do |config|
            uri = URI.parse(::SmartProxy.unscoped.first.url)
            config.host = uri.host
            config.scheme = uri.scheme
            pulp3_ssl_configuration(config)
          end
        end

        def pulp3_ssl_configuration(config, connection_adapter = Faraday.default_adapter)
          config.ssl_ca_file = ::ForemanAnsibleDirector::Cert::Certs.ca_cert_file
          case connection_adapter
          when :excon
            config.ssl_client_cert = ::ForemanAnsibleDirector::Cert::Certs.ssl_client_cert_file
            config.ssl_client_key = ::ForemanAnsibleDirector::Cert::Certs.ssl_client_key_file
          when :net_http
            config.ssl_client_cert = ::ForemanAnsibleDirector::Cert::Certs.ssl_client_cert
            config.ssl_client_key = ::ForemanAnsibleDirector::Cert::Certs.ssl_client_key
          else
            raise StandardError, "Connection adapter #{connection_adapter} not supported!"
          end
        end

        def core_api_client
          PulpcoreClient::ApiClient.new(pulp3_configuration(PulpcoreClient::Configuration))
        end

        def ansible_api_client
          PulpAnsibleClient::ApiClient.new(pulp3_configuration(PulpAnsibleClient::Configuration))
        end
      end
    end
  end
end
