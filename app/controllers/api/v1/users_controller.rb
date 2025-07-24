class Api::V1::UsersController < ApplicationController
  # GET /api/v1/users - 사용자 목록 조회
  def index
    users = User.includes(memberships: :membership_type)

    users_data = users.map do |user|
      membership = user.active_membership
      membership_info = if membership
        case membership.membership_type.name
        when /베이직/
          "✅ 베이직 멤버십 (학습 기능)"
        when /프리미엄/
          "⭐ 프리미엄 멤버십 (모든 기능)"
        when /횟수제/
          "🎯 횟수제 멤버십 (대화 제한)"
        else
          "✅ " + membership.membership_type.name
        end
      else
        "❌ 활성 멤버십 없음"
      end

      {
        id: user.id,
        name: user.name,
        email: user.email,
        membership: membership_info
      }
    end

    render json: users_data
  end

  # GET /api/v1/users/:id/membership_status - 멤버십 상태 조회
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
          days_remaining: active_membership.days_remaining,
          usage_based: active_membership.usage_based?,
          usage_remaining: active_membership.usage_based? ? active_membership.usage_remaining : nil
        }
      }
    else
      render json: {
        has_membership: false,
        message: "활성화된 멤버십이 없습니다"
      }
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "사용자를 찾을 수 없습니다" }, status: :not_found
  end
end
