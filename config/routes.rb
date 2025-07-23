Rails.application.routes.draw do
  # API 라우트
  namespace :api do
    namespace :v1 do
      resources :users do
        resources :memberships, only: [ :index, :show, :create, :destroy ]
      end

      resources :membership_types, only: [ :index, :show ]

      resources :conversations, only: [ :create ] do
        collection do
          post :chat
        end
      end

      # 멤버십 상태 확인 엔드포인트
      get "users/:user_id/membership_status", to: "memberships#status"

      # 결제 API (Mock)
      post "payments/process", to: "payments#process"
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
