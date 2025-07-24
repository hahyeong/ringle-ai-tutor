class Api::V1::UsersController < ApplicationController
def membership_status
    user = User.find(params[:id])
    active_membership = user.active_membership

    if active_membership
      render json: {
        has_membership: true,
        membership: {
          id: active_membership.id,
          name: active_membership.membership_type.name,
          features: active_membership.membership_type.features_array,
          expires_at: active_membership.expires_at,
          days_remaining: active_membership.days_remaining
        }
      }
    else
      render json: {
        has_membership: false,
        message: "활성화된 멤버십이 없습니다"
      }
    end
  end
end