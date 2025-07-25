# app/controllers/api/v1/conversations_controller.rb
require "httparty"

class Api::V1::ConversationsController < ApplicationController
  include HTTParty
  base_uri "https://api.openai.com/v1"

  # POST /api/v1/conversations/chat
  def chat
    user_message = params[:message]
    user_id = params[:user_id] || 1

    Rails.logger.info "=== 대화 요청 시작 ==="
    Rails.logger.info "User ID: #{user_id}"
    Rails.logger.info "Message: #{user_message}"

    # 멤버십 확인
    user = User.find(user_id)
    membership = user.active_membership

    Rails.logger.info "User: #{user.name} (#{user.email})"

    unless user.has_feature?("conversation")
      Rails.logger.info "Access denied: No conversation feature"
      render json: {
        error: "대화 기능을 사용할 수 없습니다. 프리미엄 멤버십을 구매해주세요."
      }, status: :forbidden
      return
    end

    # 횟수제 멤버십 체크
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
    end

    if user_message.blank?
      render json: { error: "메시지를 입력해주세요." }, status: :bad_request
      return
    end

    begin
      # 실제 OpenAI API 호출
      ai_response = call_openai_api(user_message)

      render json: {
        user_message: user_message,
        ai_response: ai_response,
        timestamp: Time.current,
        usage_remaining: membership&.usage_based? ? membership.usage_remaining : nil
      }

    rescue => error
      Rails.logger.error "OpenAI API 오류: #{error.message}"
      Rails.logger.error error.backtrace.join("\n")

      # 에러 시 fallback 응답
      fallback_response = generate_fallback_response(user_message)

      render json: {
        user_message: user_message,
        ai_response: fallback_response,
        timestamp: Time.current,
        note: "OpenAI API 오류로 기본 응답을 제공했습니다: #{error.message}",
        usage_remaining: membership&.usage_based? ? membership.usage_remaining : nil
      }
    end
  end

  private

  def call_openai_api(user_message)
    # API 키 체크
    unless ENV["OPENAI_API_KEY"].present?
      raise "OpenAI API 키가 설정되지 않았습니다. .env 파일에 OPENAI_API_KEY를 설정해주세요."
    end

    Rails.logger.info "OpenAI API 호출 중..."

    # OpenAI API 호출
    response = self.class.post("/chat/completions",
      headers: {
        "Authorization" => "Bearer #{ENV['OPENAI_API_KEY']}",
        "Content-Type" => "application/json"
      },
      body: {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI English tutor for Korean students. Help them practice English conversation. Keep responses conversational, encouraging, and educational. Ask follow-up questions to continue the conversation."
          },
          {
            role: "user",
            content: user_message
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      }.to_json
    )

    Rails.logger.info "OpenAI API 응답 상태: #{response.code}"

    if response.success?
      ai_content = response.parsed_response.dig("choices", 0, "message", "content")

      if ai_content.present?
        Rails.logger.info "OpenAI API 응답 성공"
        ai_content.strip
      else
        raise "OpenAI API 응답에서 content를 찾을 수 없습니다: #{response.parsed_response}"
      end
    else
      error_message = response.parsed_response&.dig("error", "message") || "알 수 없는 오류"
      raise "OpenAI API 호출 실패 (#{response.code}): #{error_message}"
    end
  end

  def generate_fallback_response(user_message)
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
