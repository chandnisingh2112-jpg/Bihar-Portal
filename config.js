const CONFIG = {
    API_BASE_URL: 'https://deviant-chump-preoccupy.ngrok-free.dev'
};

// Global Real-time Update Listener
(function() {
    const sseUrl = `${CONFIG.API_BASE_URL}/api/events`;
    let evtSource;

    async function connectSSE() {
        try {
            const response = await fetch(sseUrl, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'Accept': 'text/event-stream'
                }
            });
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const text = decoder.decode(value);
                if (text.includes('data: update')) {
                    console.log('Real-time update received! Refreshing data...');
                    window.dispatchEvent(new Event('appDataUpdated'));
                }
            }
        } catch (e) {
            console.warn('SSE connection lost, reconnecting...');
        }
        setTimeout(connectSSE, 3000);
    }

    connectSSE();
})();
