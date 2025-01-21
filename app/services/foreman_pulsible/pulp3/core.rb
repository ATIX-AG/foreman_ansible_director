require "pulpcore_client"
module ForemanPulsible
  module Pulp3
    class Core
      class << self

        def pulp3_configuration(config_class)
          # TODO: parameterize
          url = 'https://centos9-katello-devel-stable.example.com'
          k = URI.parse(url)
          config_class.new do |config| uri = k
          config.host = uri.host
          config.scheme = uri.scheme
          config.ssl_client_cert = ::ForemanPulsible::Cert::Certs.ssl_client_cert
          config.ssl_client_key = ::ForemanPulsible::Cert::Certs.ssl_client_key
          end
        end

        def core_api_client
          PulpcoreClient::StatusApi.new(PulpcoreClient::ApiClient.new(pulp3_configuration(PulpcoreClient::Configuration)))
        end
      end
    end
  end
end
