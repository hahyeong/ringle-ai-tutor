// public/js/audio.js

// 음성 인식 관련 변수
let recognition = null;
let isRecording = false;
let speechSynthesis = window.speechSynthesis;

// 음성 인식 초기화
function initSpeechRecognition() {
    // 브라우저 호환성 확인
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.error('이 브라우저는 음성 인식을 지원하지 않습니다.');
        alert('음성 인식을 지원하지 않는 브라우저입니다. Chrome을 사용해주세요.');
        return false;
    }
    
    recognition = new SpeechRecognition();
    
    // 음성 인식 설정
    recognition.continuous = false;          // 연속 인식 비활성화
    recognition.interimResults = true;       // 중간 결과 표시
    recognition.lang = 'en-US';             // 영어로 설정
    recognition.maxAlternatives = 1;        // 최대 대안 수
    
    // 음성 인식 이벤트 리스너
    recognition.onstart = function() {
        console.log('음성 인식 시작');
        isRecording = true;
        updateVoiceButton();
        showVoiceIndicator(true);
    };
    
    recognition.onresult = function(event) {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // 중간 결과 표시 (선택사항)
        if (interimTranscript) {
            console.log('중간 결과:', interimTranscript);
        }
        
        // 최종 결과 처리
        if (finalTranscript) {
            console.log('최종 결과:', finalTranscript);
            handleSpeechResult(finalTranscript.trim());
        }
    };
    
    recognition.onerror = function(event) {
        console.error('음성 인식 오류:', event.error);
        isRecording = false;
        updateVoiceButton();
        showVoiceIndicator(false);
        
        let errorMessage = '음성 인식 중 오류가 발생했습니다.';
        
        switch(event.error) {
            case 'no-speech':
                errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
                break;
            case 'network':
                errorMessage = '네트워크 오류가 발생했습니다.';
                break;
            case 'not-allowed':
                errorMessage = '마이크 권한이 필요합니다. 브라우저 설정을 확인해주세요.';
                break;
            default:
                errorMessage = `음성 인식 오류: ${event.error}`;
        }
        
        alert(errorMessage);
    };
    
    recognition.onend = function() {
        console.log('음성 인식 종료');
        isRecording = false;
        updateVoiceButton();
        showVoiceIndicator(false);
    };
    
    return true;
}

// 음성 인식 시작
function startSpeechRecognition() {
    if (!recognition) {
        console.error('음성 인식이 초기화되지 않았습니다.');
        return;
    }
    
    if (isRecording) {
        console.log('이미 녹음 중입니다.');
        return;
    }
    
    try {
        recognition.start();
    } catch (error) {
        console.error('음성 인식 시작 실패:', error);
        alert('음성 인식을 시작할 수 없습니다.');
    }
}

// 음성 인식 중단
function stopSpeechRecognition() {
    if (recognition && isRecording) {
        recognition.stop();
    }
}

// 음성 인식 결과 처리
function handleSpeechResult(transcript) {
    if (transcript) {
        // 텍스트 입력 필드에 결과 설정
        const textInput = document.getElementById('textInput');
        textInput.value = transcript;
        
        // 자동으로 메시지 전송
        sendMessage(transcript);
    }
}

// TTS (Text-to-Speech) 재생
function speakText(text, lang = 'en-US') {
    if (!speechSynthesis) {
        console.error('TTS를 지원하지 않는 브라우저입니다.');
        return;
    }
    
    // 기존 음성 정지
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;        // 속도
    utterance.pitch = 1;         // 음높이
    utterance.volume = 0.8;      // 볼륨
    
    // 음성 이벤트
    utterance.onstart = function() {
        console.log('TTS 재생 시작');
    };
    
    utterance.onend = function() {
        console.log('TTS 재생 완료');
    };
    
    utterance.onerror = function(event) {
        console.error('TTS 오류:', event.error);
    };
    
    speechSynthesis.speak(utterance);
}

// 음성 버튼 상태 업데이트
function updateVoiceButton() {
    const voiceButton = document.getElementById('voiceButton');
    
    if (isRecording) {
        voiceButton.classList.add('recording');
        voiceButton.textContent = '🛑';
        voiceButton.title = '녹음 중단';
    } else {
        voiceButton.classList.remove('recording');
        voiceButton.textContent = '🎤';
        voiceButton.title = '음성으로 말하기';
    }
}

// 음성 인식 상태 표시
function showVoiceIndicator(show) {
    const indicator = document.getElementById('voiceIndicator');
    indicator.style.display = show ? 'block' : 'none';
}

// 브라우저 호환성 확인
function checkAudioSupport() {
    const support = {
        speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
        speechSynthesis: !!window.speechSynthesis
    };
    
    console.log('오디오 지원 상태:', support);
    return support;
}