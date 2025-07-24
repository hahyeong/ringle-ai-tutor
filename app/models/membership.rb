# app/models/membership.rb
class Membership < ApplicationRecord
  belongs_to :user
  belongs_to :membership_type

  validates :expires_at, presence: true

  scope :active, -> { where("expires_at > ?", Time.current) }
  scope :expired, -> { where("expires_at <= ?", Time.current) }

  # 멤버십 활성 상태 확인
  def active?
    expires_at > Time.current && !usage_exhausted?
  end

  # 멤버십 만료 상태 확인
  def expired?
    !active?
  end

  # 남은 일수 계산
  def days_remaining
    return 0 if expired?
    ((expires_at - Time.current) / 1.day).ceil
  end

  # 🆕 횟수제 멤버십 관련 메서드들

  # 횟수제 멤버십인지 확인
  def usage_based?
    usage_limit.present? && usage_limit > 0
  end

  # 사용 가능 횟수 확인
  def usage_remaining
    return nil unless usage_based?
    [ usage_limit - usage_count, 0 ].max
  end

  # 사용 횟수 소진 여부
  def usage_exhausted?
    usage_based? && usage_count >= usage_limit
  end

  # 사용 횟수 차감
  def consume_usage!
    if usage_based?
      increment!(:usage_count)
    end
  end

  # 사용 가능 여부 확인
  def can_use_feature?(feature_name)
    return false unless active?

    features = JSON.parse(membership_type.features)
    features.include?(feature_name.to_s)
  end
end
