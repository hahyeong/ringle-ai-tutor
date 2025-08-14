source "https://rubygems.org" # Source Repository

# Gemfile이란 Ruby on Rails 애플리케이션의 의존성을 관리하는 파일입니다. (Spring Boot의 pom.xml 혹은 build.gradle과 유사합니다.)
# Gem이란 Ruby의 패키지로, 애플리케이션에서 사용할 수 있는 라이브러리나 프레임워크를 의미합니다. (Spring Boot의 의존성과 유사합니다.)

gem "rails", "~> 7.2.2"              # 전체 웹 프레임워크로 Rails 7.2.2 혹은 더 높은 버전을 사용합니다. (Spring Boot의 버전 관리와 유사합니다.)

gem "sqlite3", ">= 1.4" # 로컬 개발 DB로 SQLite3를 사용합니다. (Spring Boot의 H2 데이터베이스와 유사합니다.)
gem "puma", ">= 5.0" # 웹 애플리케이션 서버로 Puma를 사용합니다. (Spring Boot의 내장 Tomcat과 유사)

gem "tzinfo-data", platforms: %i[ windows jruby ]

gem "bootsnap", require: false # 부트 속도를 높이기 위해 Bootsnap을 사용합니다. (Spring Boot의 DevTools와 유사)

gem "dotenv-rails", groups: [ :development, :test ]

group :development, :test do
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude" # 디버깅을 위한 gem입니다. (Spring Boot의 DevTools와 유사)
  gem "brakeman", require: false # 보안 취약점 분석을 위한 Brakeman을 사용합니다.
  gem "rubocop-rails-omakase", require: false # 코드 스타일 검사 도구인 RuboCop을 사용합니다.
  gem "httparty" # HTTP 요청을 쉽게 처리하기 위한 HTTParty를 사용합니다. (Spring Boot의 RestTemplate 혹은 WebClient와 유사)
end
