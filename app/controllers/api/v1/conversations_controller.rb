# app/controllers/api/v1/conversations_controller.rb
require "httparty"

class Api::V1::ConversationsController < ApplicationController
  include HTTParty
  base_uri "https://api.openai.com/v1"

  # POST /api/v1/conversations/chat
  def chat
    user_message = params[:message]
    user_id = params[:user_id] || 1

    # 멤버십 확인
    user = User.find(user_id)
    unless user.has_feature?("conversation")
      render json: {
        error: "대화 기능을 사용할 수 없습니다. 프리미엄 멤버십을 구매해주세요."
      }, status: :forbidden
      return
    end

    # 🆕 횟수제 멤버십 쿠폰 차감
    membership = user.active_membership
    if membership&.usage_based?
      if membership.usage_exhausted?
        render json: {
          error: "사용 횟수를 모두 소진했습니다. 멤버십을 업그레이드해주세요."
        }, status: :forbidden
        return
      end

      # 사용 횟수 차감
      membership.consume_usage!
    end

    if user_message.blank?
      render json: { error: "메시지를 입력해주세요." }, status: :bad_request
      return
    end

    begin
      # OpenAI API 호출
      ai_response = call_openai_api(user_message)

      render json: {
        user_message: user_message,
        ai_response: ai_response,
        timestamp: Time.current,
        # 🆕 남은 사용 횟수 정보 추가
        usage_remaining: membership&.usage_remaining
      }
    rescue => error
      Rails.logger.error "OpenAI API 오류: #{error.message}"

      # 에러 시 fallback 응답
      fallback_response = generate_fallback_response(user_message)

      render json: {
        user_message: user_message,
        ai_response: fallback_response,
        timestamp: Time.current,
        note: "AI 서비스 일시 불가로 기본 응답을 제공했습니다.",
        usage_remaining: membership&.usage_remaining
      }
    end
  end

  private

  def call_openai_api(user_message)
    # API 키 가져오기
    api_key = Rails.application.credentials.openai[:api_key]

    if api_key.blank?
      raise "OpenAI API 키가 설정되지 않았습니다."
    end

    # OpenAI API 요청
    response = self.class.post("/chat/completions",
      headers: {
        "Authorization" => "Bearer #{api_key}",
        "Content-Type" => "application/json"
      },
      body: {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an English tutor AI assistant for Ringle. Help users practice English conversation. Be encouraging, correct mistakes gently, and ask follow-up questions to keep the conversation going. Keep responses conversational and not too long."
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

    if response.success?
      ai_message = response.parsed_response.dig("choices", 0, "message", "content")
      ai_message&.strip || "I'm sorry, I couldn't process your message. Could you try again?"
    else
      Rails.logger.error "OpenAI API 응답 오류: #{response.code} - #{response.body}"
      raise "OpenAI API 호출 실패: #{response.code}"
    end
  end

  def generate_fallback_response(user_message)
    # OpenAI API 실패 시 사용할 기본 응답들
    fallback_responses = [
      "That's interesting! Could you tell me more about that?",
      "Great! How do you feel about this topic?",
      "I understand. What would you like to practice next?",
      "Excellent! Your English is improving. Let's continue our conversation.",
      "That's a good point. What's your opinion on this matter?",
      "Nice! Can you explain that in different words?",
      "Perfect! Let's practice some more vocabulary related to this topic.",
      "Wonderful! How would you use this in a real conversation?"
    ]

    fallback_responses.sample
  end
end
