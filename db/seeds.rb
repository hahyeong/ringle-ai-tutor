# db/seeds.rb

# 기존 데이터 정리
Membership.destroy_all
MembershipType.destroy_all
User.destroy_all

puts "기존 데이터 정리 완료"

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

usage_membership = MembershipType.create!(
  name: "횟수제 멤버십",
  features: [ "conversation" ].to_json,
  duration_days: 30,
  price: 15000
)

puts "멤버십 타입 생성 완료: #{MembershipType.count}개"

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

# 멤버십 없는 사용자 (데모용)
user4 = User.create!(
  email: "guest@example.com",
  name: "멤버십 없음"
)

puts "사용자 생성 완료: #{User.count}명"

# 멤버십 할당
membership1 = Membership.create!(
  user: user1,
  membership_type: basic_membership,
  expires_at: 30.days.from_now,
  usage_count: 0
)

membership2 = Membership.create!(
  user: user2,
  membership_type: premium_membership,
  expires_at: 60.days.from_now,
  usage_count: 0
)

# 횟수제 멤버십 - usage_limit 설정
membership3 = Membership.create!(
  user: user3,
  membership_type: usage_membership,
  expires_at: 30.days.from_now,
  usage_count: 2,  # 이미 2회 사용함
  usage_limit: 10  # 총 10회 제한
)

# user4는 멤버십을 할당하지 않음 (멤버십 없는 상태 테스트용)

puts "멤버십 할당 완료: #{Membership.count}개"

puts "\n=== 시드 데이터 생성 완료 ==="
puts "사용자 목록:"
User.all.each_with_index do |user, index|
  membership = user.active_membership
  if membership
    puts "#{index + 1}. #{user.name} (#{user.email}) - #{membership.membership_type.name}"
    if membership.usage_based?
      puts "   └─ 사용 횟수: #{membership.usage_count}/#{membership.usage_limit}회"
    end
    puts "   └─ 만료일: #{membership.expires_at.strftime('%Y-%m-%d')}"
  else
    puts "#{index + 1}. #{user.name} (#{user.email}) - 멤버십 없음"
  end
end

puts "\n로그인 테스트 안내:"
puts "1. 브라우저에서 http://localhost:3000/login.html 접속"
puts "2. 원하는 사용자 선택 후 로그인"
puts "3. 각 사용자별 멤버십 기능 테스트"
