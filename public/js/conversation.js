// public/js/conversation.js

// 대화 초기화
function initConversation() {
    // 오디오 지원 확인
    const audioSupport = checkAudioSupport();
    
    if (audioSupport.speechRecognition) {
        initSpeechRecognition();
    } else {
        console.warn('음성 인식이 지원되지 않습니다.');
        // 음성 버튼 비활성화
        const voiceButton = document.getElementById('voiceButton');
        voiceButton.disabled = true;
        voiceButton.title = '음성 인식을 지원하지 않는 브라우저입니다';
    }
    
    // 이벤트 리스너 등록
    setupEventListeners();
    
    // 멤버십 확인
    checkConversationPermission();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    const voiceButton = document.getElementById('voiceButton');
    const textInput = document.getElementById('textInput');
    const sendButton = document.getElementById('sendButton');
    
    // 음성 버튼 클릭
    voiceButton.addEventListener('click', function() {
        if (isRecording) {
            stopSpeechRecognition();
        } else {
            startSpeechRecognition();
        }
    });
    
    // 텍스트 입력 Enter 키
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const message = textInput.value.trim();
            if (message) {
                sendMessage(message);
            }
        }
    });
    
    // 전송 버튼 클릭
    sendButton.addEventListener('click', function() {
        const message = textInput.value.trim();
        if (message) {
            sendMessage(message);
        }
    });
}

// 대화 권한 확인
async function checkConversationPermission() {
    try {
        const membershipData = await getMembershipStatus(1);
        
        if (!membershipData.has_membership) {
            showError('활성화된 멤버십이 없습니다. 홈 화면에서 멤버십을 구매해주세요.');
            disableConversation();
            return;
        }
        
        const features = membershipData.membership.features;
        if (!features.includes('conversation')) {
            showError('대화 기능을 사용할 수 없는 멤버십입니다. 프리미엄 멤버십을 구매해주세요.');
            disableConversation();
            return;
        }
        
        console.log('대화 기능 사용 가능');
        
    } catch (error) {
        console.error('멤버십 확인 실패:', error);
        showError('멤버십 상태를 확인할 수 없습니다.');
    }
}

// 메시지 전송
async function sendMessage(message) {
    if (!message.trim()) return;
    
    // 사용자 메시지 표시
    addMessageToChat('user', message);
    
    // 입력 필드 초기화
    const textInput = document.getElementById('textInput');
    textInput.value = '';
    
    // 로딩 표시
    showLoadingIndicator(true);
    
    try {
        // Mock AI 응답 (실제로는 OpenAI/Claude API 사용)
        const aiResponse = await generateAIResponse(message);
        
        // AI 응답 표시
        addMessageToChat('ai', aiResponse);
        
        // TTS로 AI 응답 재생
        if (window.speechSynthesis) {
            speakText(aiResponse);
        }
        
    } catch (error) {
        console.error('AI 응답 생성 실패:', error);
        addMessageToChat('ai', '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        showLoadingIndicator(false);
    }
}

// AI 응답 생성 (실제 OpenAI API 호출)
async function generateAIResponse(userMessage) {
    try {
        const response = await fetch('/api/v1/conversations/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                user_id: 1
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        return data.ai_response;
        
    } catch (error) {
        console.error('AI API 호출 실패:', error);
        
        // Fallback to mock responses
        const fallbackResponses = [
            "I apologize, but I'm having trouble connecting right now. Could you try again?",
            "Sorry, there seems to be a technical issue. Let's continue our conversation in a moment.",
            "I'm experiencing some difficulties. Please try your message again!"
        ];
        
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
}

// 채팅에 메시지 추가
function addMessageToChat(sender, message) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = sender === 'ai' ? '🤖' : '👤';
    const currentTime = new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div>${message}</div>
            <div class="message-time">${currentTime}</div>
        </div>
    `;
    
    chatArea.appendChild(messageDiv);
    
    // 채팅 영역 스크롤을 맨 아래로
    chatArea.scrollTop = chatArea.scrollHeight;
}

// 로딩 인디케이터 표시/숨김
function showLoadingIndicator(show) {
    const indicator = document.getElementById('loadingIndicator');
    indicator.style.display = show ? 'block' : 'none';
    
    // 버튼 비활성화/활성화
    const sendButton = document.getElementById('sendButton');
    const voiceButton = document.getElementById('voiceButton');
    
    sendButton.disabled = show;
    voiceButton.disabled = show;
}

// 에러 메시지 표시
function showError(message) {
    addMessageToChat('ai', `⚠️ ${message}`);
}

// 대화 기능 비활성화
function disableConversation() {
    const textInput = document.getElementById('textInput');
    const sendButton = document.getElementById('sendButton');
    const voiceButton = document.getElementById('voiceButton');
    
    textInput.disabled = true;
    textInput.placeholder = '대화 기능을 사용할 수 없습니다.';
    sendButton.disabled = true;
    voiceButton.disabled = true;
}

// 페이지 언로드시 음성 정리
window.addEventListener('beforeunload', function() {
    if (recognition && isRecording) {
        recognition.stop();
    }
    if (speechSynthesis) {
        speechSynthesis.cancel();
    }
});