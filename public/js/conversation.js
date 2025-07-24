// public/js/conversation.js

// 대화 초기화
function initConversation() {
    // 로그인 확인
    if (!getCurrentUserId()) {
        return; // 로그인 페이지로 리다이렉트됨
    }
    
    // 현재 사용자 정보 표시
    displayCurrentUserInHeader();
    
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

// 헤더에 현재 사용자 정보 표시
function displayCurrentUserInHeader() {
    const userInfo = getCurrentUserInfo();
    if (!userInfo) return;
    
    const header = document.querySelector('.conversation-header');
    if (header && !header.querySelector('.user-info')) {
        const userInfoDiv = document.createElement('div');
        userInfoDiv.className = 'user-info';
        userInfoDiv.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.2);
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 0.9rem;
        `;
        
        userInfoDiv.innerHTML = `
            <div>${userInfo.name}</div>
            <div style="opacity: 0.8;">${userInfo.membership}</div>
        `;
        
        header.appendChild(userInfoDiv);
    }
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
        const membershipData = await getMembershipStatus();
        
        if (!membershipData) {
            showError('로그인이 필요합니다.');
            disableConversation();
            return;
        }
        
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
        // API 함수 직접 호출 (api.js에서 가져온 함수)
        const response = await apiCall('/conversations/chat', {
            method: 'POST',
            body: JSON.stringify({
                message: message,
                user_id: getCurrentUserId()
            })
        });
        
        if (response && response.ai_response) {
            // AI 응답 표시
            addMessageToChat('ai', response.ai_response);
            
            // 사용 횟수 정보 표시 (횟수제 멤버십인 경우)
            if (response.usage_remaining !== undefined) {
                console.log(`남은 사용 횟수: ${response.usage_remaining}회`);
                if (response.usage_remaining <= 3) {
                    showUsageWarning(response.usage_remaining);
                }
            }
            
            // TTS로 AI 응답 재생
            if (window.speechSynthesis) {
                speakText(response.ai_response);
            }
        } else {
            throw new Error('AI 응답을 받을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('AI 응답 생성 실패:', error);

        let errorMessage = '죄송합니다. ';
        if (error.message.includes('401')) {
            errorMessage += 'API 인증에 문제가 있습니다.';
        } else if (error.message.includes('429')) {
            errorMessage += 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('500')) {
            errorMessage += '서버에 문제가 발생했습니다.';
        } else {
            errorMessage += '응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.';
        }

        addMessageToChat('ai', '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        showLoadingIndicator(false);
    }
}

// 사용 횟수 경고 표시
function showUsageWarning(remaining) {
    const warningMessage = remaining > 0 
        ? `⚠️ 남은 대화 횟수: ${remaining}회`
        : '❌ 대화 횟수가 모두 소진되었습니다.';
        
    addMessageToChat('ai', warningMessage);
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