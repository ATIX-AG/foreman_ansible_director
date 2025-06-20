# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api do
    scope '(:apiv)',
      module: :v2,
      defaults: { apiv: 'v2' },
      apiv: /v1|v2/,
      constraints: ApiConstraints.new(version: 2, default: true) do
      scope '/pulsible' do
        resources :ansible_content, only: [] do
          collection do
            post '/', action: :create_units
            get '/', action: :index
            delete '/', action: :destroy_units
          end
        end
        resources :execution_environments, only: [] do
          collection do
            get '/', action: :index
            post '/', action: :create
          end
          member do
            patch '/', action: :update
            delete '/', action: :destroy
          end
        end
        resources :lifecycle_environments, only: [] do
          collection do
            post '/', action: :create
            resources :lifecycle_environment_paths, path: 'paths', only: [] do
              collection do
                get '/', action: :index, to: 'lifecycle_environment_paths#index'
                post '/', action: :create, to: 'lifecycle_environment_paths#create'
              end
              member do
                put '/', action: :update
                post '/promote', to: 'lifecycle_environment_paths#promote'
                delete '/', action: :destroy
              end
            end
          end
          member do
            get '/', action: :show
            delete '/', action: :destroy
            put '/', action: :update
          end
        end
      end
    end
  end

  match '/ansible/content' => 'react#index', :via => [:get]
end
