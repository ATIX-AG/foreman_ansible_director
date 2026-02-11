# frozen_string_literal: true

Rails.application.routes.draw do
  scope module: 'foreman_ansible_director' do
    namespace :api do
      scope '(:apiv)',
        module: :v2,
        defaults: { apiv: 'v2' },
        apiv: /v1|v2/,
        constraints: ApiConstraints.new(version: 2, default: true) do
        scope '/ansible_director' do
          resources :ansible_content, only: [] do
            collection do
              post '/', action: :create_units
              get '/', action: :index
              delete '/', action: :destroy_units
              get '/:version', action: :version_detail
            end
          end
          resources :execution_environments, only: [] do
            collection do
              get '/', action: :index
              post '/', action: :create
              get 'auto_complete_search'
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
                  get 'auto_complete_search'
                end
                member do
                  put '/', action: :update
                  post '/promote', to: 'lifecycle_environment_paths#promote'
                  delete '/', action: :destroy
                end
              end
            end
            member do
              post '/assign/:target_type/:target_id', action: :assign
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
              get '/context', action: :context
            end
          end
          resources :assignments, only: [] do
            collection do
              get '/:target/:target_id', action: :assignments
              post '/', action: :assign
              post '/bulk', action: :assign_bulk
            end
            member do
              delete '/', action: :destroy
            end
          end
          resources :ansible_variables, only: [] do
            collection do
              get '/', action: :index
              resources :ansible_variable_overrides, path: 'overrides', only: [] do
                collection do
                  get '/:target/:target_id', action: :index_for_target
                end
              end
            end
            member do
              get '/', action: :show
              put '/', action: :update
            end
            resources :ansible_variable_overrides, path: 'overrides', only: [] do
              collection do
                post '/', action: :create
                get '/:target/:target_id', action: :index_for_target
              end
              member do
                delete '/', action: :destroy
                put '/', action: :update
              end
            end
          end
        end
      end
    end
  end
  match '/ansible/content' => 'react#index', :via => [:get]
  match '/ansible/environments' => 'react#index', :via => [:get]
  match '/ansible/execution_environments' => 'react#index', :via => [:get]
  match '/ansible/tasks' => 'react#index', :via => [:get]

  mount ActionCable.server => '/ansible/sock'
end
