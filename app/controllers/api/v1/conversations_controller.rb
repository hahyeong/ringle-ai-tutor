# app/controllers/api/v1/conversations_controller.rb
require "httparty"

class Api::V1::ConversationsController < ApplicationController
  include HTTParty
  base_uri "https://api.openai.com/v1"

  # POST /api/v1/conversations/chat
  def chat
    user_message = params[:message]
    user_id = params[:user_id] || 1

    # 🔧 디버깅을 위한 로깅 추가
    Rails.logger.info "=== 대화 요청 디버깅 시작 ==="
    Rails.logger.info "User ID: #{user_id}"
    Rails.logger.info "Message: #{user_message}"

    # 멤버십 확인
    user = User.find(user_id)
    membership = user.active_membership

    Rails.logger.info "User: #{user.name} (#{user.email})"
    if membership
      Rails.logger.info "Membership: #{membership.membership_type.name}"
      Rails.logger.info "Usage Count: #{membership.usage_count}"
      Rails.logger.info "Usage Limit: #{membership.usage_limit}"
      Rails.logger.info "Usage Based?: #{membership.usage_based?}"
      Rails.logger.info "Usage Exhausted?: #{membership.usage_exhausted?}"
      Rails.logger.info "Active?: #{membership.active?}"
    else
      Rails.logger.info "No active membership"
    end

    Rails.logger.info "Has conversation feature?: #{user.has_feature?('conversation')}"

    unless user.has_feature?("conversation")
      Rails.logger.info "Access denied: No conversation feature"
      render json: {
        error: "대화 기능을 사용할 수 없습니다. 프리미엄 멤버십을 구매해주세요."
      }, status: :forbidden
      return
    end

    # 🔧 수정: 횟수제 멤버십만 횟수 체크
    if membership&.usage_based?
      Rails.logger.info "Checking usage limits for usage-based membership"
      if membership.usage_exhausted?
        Rails.logger.info "Usage exhausted - denying access"
        render json: {
          error: "사용 횟수를 모두 소진했습니다. 멤버십을 업그레이드해주세요."
        }, status: :forbidden
        return
      end

      # 사용 횟수 차감
      Rails.logger.info "Consuming usage count"
      membership.consume_usage!
    else
      Rails.logger.info "Unlimited membership - proceeding without usage check"
    end

    if user_message.blank?
      render json: { error: "메시지를 입력해주세요." }, status: :bad_request
      return
    end

    begin
      # OpenAI API 호출 대신 fallback 응답 사용 (테스트용)
      ai_response = generate_fallback_response(user_message)

      render json: {
        user_message: user_message,
        ai_response: ai_response,
        timestamp: Time.current,
        note: "데모 모드: fallback 응답을 제공했습니다.",
        # 🔧 수정: 횟수제인 경우에만 사용 횟수 정보 제공
        usage_remaining: membership&.usage_based? ? membership.usage_remaining : nil
      }
    rescue => error
      Rails.logger.error "AI 응답 생성 오류: #{error.message}"

      # 에러 시 fallback 응답
      fallback_response = generate_fallback_response(user_message)

      render json: {
        user_message: user_message,
        ai_response: fallback_response,
        timestamp: Time.current,
        note: "에러 발생으로 기본 응답을 제공했습니다.",
        usage_remaining: membership&.usage_based? ? membership.usage_remaining : nil
      }
    end
  end

  private

  def generate_fallback_response(user_message)
    # 사용자 메시지 패턴에 따른 적절한 응답
    case user_message.downcase
    when /hello|hi|hey/
      "Hello! How are you doing today? Let's practice some English together!"
    when /how are you/
      "I'm doing great, thank you for asking! How about you? Tell me about your day."
    when /bye|goodbye/
      "Goodbye! It was nice talking with you. Keep practicing your English!"
    when /thank/
      "You're welcome! I'm here to help you practice English anytime."
    else
      fallback_responses = [
        "That's interesting! Could you tell me more about that?",
        "Great! How do you feel about this topic?",
        "I understand. What would you like to practice next?",
        "Excellent! Your English is improving. Let's continue our conversation.",
        "That's a good point. What's your opinion on this matter?",
        "Nice! Can you explain that in different words?",
        "Perfect! Let's practice some more vocabulary related to this topic."
      ]
      fallback_responses.sample
    end
  end
end
