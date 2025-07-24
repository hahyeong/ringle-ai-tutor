Rails.application.routes.draw do
  # API 라우트
  namespace :api do
    namespace :v1 do
      resources :users do
        resources :memberships, only: [ :index, :show, :create, :destroy ]
        # 멤버십 상태 확인 엔드포인트를 users 리소스 안에 추가
        get :membership_status, on: :member
      end

      resources :membership_types, only: [ :index, :show ]

      resources :conversations, only: [ :create ] do
        collection do
          post :chat
        end
      end

      # 결제 API (Mock)
      post "payments/process", to: "payments#process"
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end