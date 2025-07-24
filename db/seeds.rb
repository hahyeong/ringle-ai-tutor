# db/seeds.rb

# 기존 데이터 정리
Membership.destroy_all
MembershipType.destroy_all
User.destroy_all

# 멤버십 타입 생성 (usage_limit은 MembershipType에 없음!)
basic_membership = MembershipType.create!(
  name: "베이직 멤버십",
  features: [ "learning" ].to_json,
  duration_days: 30,
  price: 19000
)

premium_membership = MembershipType.create!(
  name: "프리미엄 멤버십",
  features: [ "learning", "conversation", "analysis" ].to_json,
  duration_days: 60,
  price: 49000
)

# 횟수제 멤버십 (usage_limit은 여기서 설정하지 않음)
usage_membership = MembershipType.create!(
  name: "횟수제 멤버십",
  features: [ "conversation" ].to_json,
  duration_days: 30,
  price: 15000
)

# 테스트 사용자 생성
user1 = User.create!(
  email: "test@ringle.co.kr",
  name: "테스트 사용자"
)

user2 = User.create!(
  email: "premium@ringle.co.kr",
  name: "프리미엄 사용자"
)

user3 = User.create!(
  email: "usage@ringle.co.kr",
  name: "횟수제 사용자"
)

# 멤버십 할당 (usage_limit은 Membership 테이블에!)
Membership.create!(
  user: user1,
  membership_type: basic_membership,
  expires_at: 30.days.from_now,
  usage_count: 0
)

Membership.create!(
  user: user2,
  membership_type: premium_membership,
  expires_at: 60.days.from_now,
  usage_count: 0
)

# 횟수제 멤버십 - usage_limit은 여기서 설정!
Membership.create!(
  user: user3,
  membership_type: usage_membership,
  expires_at: 30.days.from_now,
  usage_count: 0,
  usage_limit: 10  # 이건 Membership 테이블의 컬럼
)

puts "시드 데이터 생성 완료!"
puts "멤버십 타입: #{MembershipType.count}개"
puts "사용자: #{User.count}명"
puts "멤버십: #{Membership.count}개"
