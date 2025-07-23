class MembershipType < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships

  validates :name, presence: true, uniqueness: true
  validates :features, presence: true
  validates :duration_days, presence: true, numericality: { greater_than: 0 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  # features를 JSON 배열로 저장
  # 예: ["learning", "conversation", "analysis"]
  def features_array
    JSON.parse(features) rescue []
  end

  def features_array=(array)
    self.features = array.to_json
  end

  # 기능 포함 여부 확인
  def includes_feature?(feature_name)
    features_array.include?(feature_name)
  end
end
