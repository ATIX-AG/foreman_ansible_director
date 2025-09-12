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
            post '/assign', action: :assign
          end
          member do
            post '/:<version>/assign/<:target_type>/<:target_id>', action: :assign
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
            post '/assign', action: :assign
          end
          member do
            get '/', action: :show
            get '/content', action: :content
            delete '/', action: :destroy
            put '/', action: :update
            patch '/', action: :update_content
          end
        end
        resources :status, only: [] do
          collection do
            get '/content', action: :content
          end
        end
        resources :ansible_runs, only: [] do
          collection do
            post '/run_all', action: :run_all
          end
        end
        resources :assignments, only: [] do
          collection do
            get '/:target/:target_id', action: :get_assignments
            post '/', action: :assign
          end
        end
      end
    end
  end

  match '/ansible/content' => 'react#index', :via => [:get]
  match '/ansible/environments' => 'react#index', :via => [:get]
  match '/ansible/execution_environments' => 'react#index', :via => [:get]
end
