class User < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :membership_types, through: :memberships

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

  # 현재 활성화된 멤버십 확인
  def active_membership
    memberships.where("expires_at > ?", Time.current).first
  end

  # 특정 기능 사용 권한 확인
  def has_feature?(feature_name)
    membership = active_membership
    return false unless membership

    features = JSON.parse(membership.membership_type.features)
    features.include?(feature_name)
  end

  # 멤버십 만료 여부 확인
  def membership_expired?
    active_membership.nil?
  end
end
