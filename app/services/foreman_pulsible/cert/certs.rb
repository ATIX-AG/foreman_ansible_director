# frozen_string_literal: true

module ForemanPulsible
  module Cert
    module Certs
      def self.ssl_client_cert
        OpenSSL::X509::Certificate.new(File.read('/etc/foreman-proxy/foreman_ssl_cert.pem'))
      end

      def self.ssl_client_key
        OpenSSL::PKey::RSA.new(File.read('/etc/foreman-proxy/foreman_ssl_key.pem'))
      end
    end
  end
end
