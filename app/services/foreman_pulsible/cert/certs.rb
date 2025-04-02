# frozen_string_literal: true

module ForemanPulsible
  module Cert
    module Certs
      def self.ca_cert_file
        Setting[:ssl_ca_file]
      end

      def self.ssl_client_cert
        OpenSSL::X509::Certificate.new(File.read(Setting[:ssl_certificate]))
      end

      def self.ssl_client_key
        OpenSSL::PKey::RSA.new(File.read(Setting[:ssl_priv_key]))
      end
    end
  end
end
