# db/seeds.rb

# 기존 데이터 정리
Membership.destroy_all
MembershipType.destroy_all
User.destroy_all

# 🔧 Auto increment 초기화 (SQLite)
ActiveRecord::Base.connection.execute("DELETE FROM sqlite_sequence WHERE name='users'")
ActiveRecord::Base.connection.execute("DELETE FROM sqlite_sequence WHERE name='membership_types'")
ActiveRecord::Base.connection.execute("DELETE FROM sqlite_sequence WHERE name='memberships'")

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

# 🔧 고정 ID로 테스트 사용자 생성
User.connection.execute("INSERT INTO users (id, email, name, created_at, updated_at) VALUES (17, 'test@ringle.co.kr', '테스트 사용자', datetime('now'), datetime('now'))")
User.connection.execute("INSERT INTO users (id, email, name, created_at, updated_at) VALUES (18, 'premium@ringle.co.kr', '프리미엄 사용자', datetime('now'), datetime('now'))")
User.connection.execute("INSERT INTO users (id, email, name, created_at, updated_at) VALUES (19, 'usage@ringle.co.kr', '횟수제 사용자', datetime('now'), datetime('now'))")
User.connection.execute("INSERT INTO users (id, email, name, created_at, updated_at) VALUES (20, 'guest@example.com', '멤버십 없음', datetime('now'), datetime('now'))")

# 사용자 객체 다시 로드
user1 = User.find(17)
user2 = User.find(18)
user3 = User.find(19)
user4 = User.find(20)

puts "사용자 생성 완료: #{User.count}명"

# 멤버십 할당
membership1 = Membership.create!(
  user: user1,
  membership_type: basic_membership,
  expires_at: 30.days.from_now,
  usage_count: 0,
  usage_limit: nil  # 무제한
)

# 프리미엄 멤버십은 횟수 제한 없음
membership2 = Membership.create!(
  user: user2,
  membership_type: premium_membership,
  expires_at: 60.days.from_now,
  usage_count: 0,
  usage_limit: nil  # 무제한
)

# 횟수제 멤버십만 usage_limit 설정
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
puts "고정 ID로 사용자 생성됨:"
User.all.each do |user|
  membership = user.active_membership
  if membership
    puts "#{user.id}. #{user.name} (#{user.email}) - #{membership.membership_type.name}"
    if membership.usage_based?
      puts "   └─ 사용 횟수: #{membership.usage_count}/#{membership.usage_limit}회"
    else
      puts "   └─ 무제한 사용"
    end
    puts "   └─ 만료일: #{membership.expires_at.strftime('%Y-%m-%d')}"
  else
    puts "#{user.id}. #{user.name} (#{user.email}) - 멤버십 없음"
  end
end

puts "\n로그인 테스트 안내:"
puts "1. 브라우저에서 http://localhost:3000/login.html 접속"
puts "2. '사용자 목록 새로고침' 버튼 클릭"
puts "3. 원하는 사용자 선택 후 로그인"
puts "4. 각 사용자별 멤버십 기능 테스트"
