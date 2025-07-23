class Membership < ApplicationRecord
  belongs_to :user
  belongs_to :membership_type

  validates :expires_at, presence: true

  scope :active, -> { where("expires_at > ?", Time.current) }
  scope :expired, -> { where("expires_at <= ?", Time.current) }

  # 멤버십 활성 상태 확인
  def active?
    expires_at > Time.current
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
end
