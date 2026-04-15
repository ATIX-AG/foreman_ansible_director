# frozen_string_literal: true

module ForemanAnsibleDirector
  module Cert
    module Certs
      def self.ca_cert_file
        Setting[:ssl_ca_file]
      end

      def self.ssl_client_cert_file
        Setting[:ssl_certificate]
      end

      def self.ssl_client_key_file
        Setting[:ssl_priv_key]
      end

      def self.ssl_client_cert
        OpenSSL::X509::Certificate.new(File.read(ssl_client_cert_file))
      end

      def self.ssl_client_key
        OpenSSL::PKey::RSA.new(File.read(ssl_client_key_file))
      end
    end
  end
end
