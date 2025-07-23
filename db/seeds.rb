# 기존 데이터 정리
Membership.destroy_all
MembershipType.destroy_all
User.destroy_all

# 멤버십 타입 생성
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

# 테스트 사용자 생성
user1 = User.create!(
  email: "test@ringle.co.kr",
  name: "테스트 사용자"
)

user2 = User.create!(
  email: "premium@ringle.co.kr",
  name: "프리미엄 사용자"
)

# 멤버십 할당
Membership.create!(
  user: user1,
  membership_type: basic_membership,
  expires_at: 30.days.from_now
)

Membership.create!(
  user: user2,
  membership_type: premium_membership,
  expires_at: 60.days.from_now
)

puts "시드 데이터 생성 완료!"
puts "멤버십 타입: #{MembershipType.count}개"
puts "사용자: #{User.count}명"
puts "멤버십: #{Membership.count}개"
