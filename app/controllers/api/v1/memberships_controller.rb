class Api::V1::MembershipsController < ApplicationController
  before_action :set_user, only: [ :index, :create, :status ]
  before_action :set_membership, only: [ :destroy ]

  # GET /api/v1/users/:user_id/memberships
  def index
    memberships = @user.memberships.includes(:membership_type)
    render json: {
      memberships: memberships.map do |membership|
        {
          id: membership.id,
          membership_type: {
            id: membership.membership_type.id,
            name: membership.membership_type.name,
            features: membership.membership_type.features_array,
            duration_days: membership.membership_type.duration_days,
            price: membership.membership_type.price
          },
          expires_at: membership.expires_at,
          active: membership.active?,
          days_remaining: membership.days_remaining
        }
      end
    }
  end

  # GET /api/v1/users/:user_id/membership_status
  def status
    active_membership = @user.active_membership

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

  # POST /api/v1/users/:user_id/memberships
  def create
    membership_type = MembershipType.find(params[:membership_type_id])

    # 기존 활성 멤버십이 있으면 만료 처리
    existing_membership = @user.active_membership
    existing_membership&.update(expires_at: Time.current)

    # 새 멤버십 생성
    membership = @user.memberships.build(
      membership_type: membership_type,
      expires_at: membership_type.duration_days.days.from_now
    )

    if membership.save
      render json: {
        message: "멤버십이 성공적으로 할당되었습니다",
        membership: {
          id: membership.id,
          name: membership.membership_type.name,
          features: membership.membership_type.features_array,
          expires_at: membership.expires_at,
          days_remaining: membership.days_remaining
        }
      }, status: :created
    else
      render json: { errors: membership.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/memberships/:id
  def destroy
    @membership.update(expires_at: Time.current)
    render json: { message: "멤버십이 취소되었습니다" }
  end

  private

  def set_user
    @user = User.find(params[:user_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "사용자를 찾을 수 없습니다" }, status: :not_found
  end

  def set_membership
    @membership = Membership.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "멤버십을 찾을 수 없습니다" }, status: :not_found
  end
end
