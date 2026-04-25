// ============================================================================
// BTYCloud | RunSing Innovation Private Sub-Aggregator (Apple Ecosystem Edition)
// ============================================================================

let mytoken = 'auto';
let shareToken = 'share'; // 新增的分享專用密碼
let BotToken = ''; 
let ChatID = ''; 
let TG = 0; 
let FileName = 'BTYCloud-Sync'; 
let SUBUpdateTime = 6; 
let total = 99;
let timestamp = 4102329600000;

// 預設訂閱連結
let MainData = `
https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray
https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2
`

let urls = [];
let subConverter = "SUBAPI.fxxk.dedyn.io"; 
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini";
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		
		// 獲取路徑或參數中的 token
		let pathToken = url.pathname.replace(/^\/+/, '').split('?')[0];
		let queryToken = url.searchParams.get('token');
		let currentToken = queryToken || pathToken;

		mytoken = env.TOKEN || mytoken;
		shareToken = env.SHARE_TOKEN || shareToken;
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		TG = env.TG || TG;
		subConverter = env.SUBAPI || subConverter;
		
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);

		let isAdmin = (currentToken === mytoken || currentToken === fakeToken);
		let isShare = (currentToken === shareToken);

		// 1. 權限校驗：如果既不是管理員也不是分享客戶，返回假 Nginx 頁面
		if (!isAdmin && !isShare) {
			if (env.URL302) return Response.redirect(env.URL302, 302);
			return new Response(await nginx(), { status: 200, headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
		}

		// 2. POST 請求保存邏輯 (僅限管理員)
		if (request.method === "POST" && isAdmin) {
			if (!env.KV) return new Response("未绑定KV", { status: 400 });
			await env.KV.put('LINK.txt', await request.text());
			return new Response("保存成功");
		}

		// 3. 瀏覽器訪問攔截邏輯
		if (request.method === "GET" && userAgent.includes('mozilla') && !url.searchParams.has('clash') && !url.searchParams.has('sb') && !url.searchParams.has('sub')) {
			// 如果是朋友用瀏覽器打開分享連結 -> 攔截並警告
			if (isShare) {
				return new Response("【BTYCloud Infra 系統安全提示】\n\n訂閱數據庫連接正常。\n\n警告：此連結為私有加密訂閱，拒絕提供網頁預覽服務。\n\n操作指引：\n請將此連結完整複製，並添加至 Shadowrocket (小火箭)、Surge 或 Clash 中進行節點同步。", {
					headers: { "Content-Type": "text/plain; charset=utf-8" }
				});
			}
			// 如果是管理員用瀏覽器打開 -> 進入 UI 後台
			if (isAdmin) {
				return await renderAdminUI(request, env, 'LINK.txt', shareToken);
			}
		}

		// 4. 獲取訂閱邏輯 (客戶端請求，Admin和Share均可)
		if (env.KV) {
			MainData = await env.KV.get('LINK.txt') || MainData;
		} else {
			MainData = env.LINK || MainData;
			if (env.LINKSUB) urls = await ADD(env.LINKSUB);
		}
		
		let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
		let 自建节点 = "";
		let 订阅链接 = "";
		for (let x of 重新汇总所有链接) {
			if (x.toLowerCase().startsWith('http')) 订阅链接 += x + '\n';
			else 自建节点 += x + '\n';
		}
		MainData = 自建节点;
		urls = await ADD(订阅链接);

		let 订阅格式 = 'base64';
		if (userAgent.includes('clash') || url.searchParams.has('clash')) 订阅格式 = 'clash';
		else if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb')) 订阅格式 = 'singbox';
		else if (userAgent.includes('surge') || url.searchParams.has('surge')) 订阅格式 = 'surge';

		let subConverterUrl;
		let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
		let req_data = MainData;

		let 追加UA = 'v2rayn';
		if (订阅格式 === 'clash') 追加UA = 'clash';
		else if (订阅格式 === 'surge') 追加UA = 'surge';

		const 请求订阅响应内容 = await getSUB(urls, request, 追加UA, userAgentHeader);
		req_data += 请求订阅响应内容[0].join('\n');
		订阅转换URL += "|" + 请求订阅响应内容[1];

		const utf8Encoder = new TextEncoder();
		const encodedData = utf8Encoder.encode(req_data);
		const text = new TextDecoder().decode(encodedData);
		const uniqueLines = new Set(text.split('\n'));
		const result = [...uniqueLines].join('\n');

		let base64Data;
		try { base64Data = btoa(result); } catch (e) {
			// 簡單 base64 備用
			base64Data = Buffer.from(result).toString('base64');
		}

		if (订阅格式 == 'base64' || currentToken == fakeToken) {
			return new Response(base64Data, { headers: { "content-type": "text/plain; charset=utf-8", "Profile-Update-Interval": `${SUBUpdateTime}` }});
		} else if (订阅格式 == 'clash') {
			subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
		} else if (订阅格式 == 'singbox') {
			subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
		} else if (订阅格式 == 'surge') {
			subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
		}
		
		try {
			const subConverterResponse = await fetch(subConverterUrl);
			if (!subConverterResponse.ok) return new Response(base64Data, { headers: { "content-type": "text/plain; charset=utf-8" }});
			let subConverterContent = await subConverterResponse.text();
			if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
			return new Response(subConverterContent, {
				headers: {
					"Content-Disposition": `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`,
					"content-type": "text/plain; charset=utf-8",
					"Profile-Update-Interval": `${SUBUpdateTime}`,
				},
			});
		} catch (error) {
			return new Response(base64Data, { headers: { "content-type": "text/plain; charset=utf-8" }});
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, ',').replace(/,+/g, ',');
	if (addtext.charAt(0) == ',') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == ',') addtext = addtext.slice(0, addtext.length - 1);
	return addtext.split(',');
}

async function nginx() {
	return `<!DOCTYPE html><html><head><title>Welcome to nginx!</title><style>body { width: 35em; margin: 0 auto; font-family: Tahoma, Verdana, Arial, sans-serif; }</style></head><body><h1>Welcome to nginx!</h1><p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p></body></html>`;
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();
	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstHex = Array.from(new Uint8Array(firstPass)).map(b => b.toString(16).padStart(2, '0')).join('');
	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	return Array.from(new Uint8Array(secondPass)).map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines = content.includes('\r\n') ? content.split('\r\n') : content.split('\n');
		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) result += line.replace(/, mtu: 1280, udp: true/g, `, mtu: 1280, remote-dns-resolve: true, udp: true`) + '\n';
			else result += line + '\n';
		}
		return result;
	}
	return content;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) return [];
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	
	try {
		const responses = await Promise.allSettled(api.map(apiUrl => {
			const newHeaders = new Headers(request.headers);
			newHeaders.set("User-Agent", `v2rayN/6.45 cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);
			return fetch(new Request(apiUrl, { method: request.method, headers: newHeaders })).then(res => res.ok ? res.text() : Promise.reject(res));
		}));

		for (let i=0; i<responses.length; i++) {
			let response = responses[i];
			if (response.status === 'fulfilled') {
				const content = await response.value || ''; 
				if (content.includes('proxies') && content.includes('proxy-groups')) 订阅转换URLs += "|" + api[i]; 
				else if (content.includes('outbounds') && content.includes('inbounds')) 订阅转换URLs += "|" + api[i]; 
				else if (content.includes('://')) newapi += content + '\n'; 
				else newapi += (atob(content.replace(/\s/g, ''))) + '\n'; 
			}
		}
	} catch (error) {}
	return [await ADD(newapi + 异常订阅), 订阅转换URLs];
}

// ============================================================================
// UI 前端渲染邏輯 (Apple macOS 級別專屬 UI)
// ============================================================================
async function renderAdminUI(request, env, txt, shareToken) {
	const url = new URL(request.url);
	let content = '';
	let hasKV = !!env.KV;
	if (hasKV) { try { content = await env.KV.get(txt) || ''; } catch (e) {} }

	const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>BTYCloud | Sync Control Panel</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
    <style>
        /* Apple 級別的字體渲染 */
        body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
        .macos-glass { background: rgba(28, 28, 30, 0.65); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .input-glass { background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.05); }
        .btn-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .btn-hover:active { transform: scale(0.96); }
    </style>
</head>
<body class="bg-[#000000] text-gray-200 min-h-screen p-4 md:p-8 flex items-center justify-center selection:bg-blue-500/40" style="background-image: radial-gradient(circle at 50% 0%, #1e3a8a 0%, #000000 70%);">
    <div class="w-full max-w-6xl macos-glass rounded-2xl overflow-hidden">
        
        <div class="px-8 py-5 border-b border-white/5 flex justify-between items-center">
            <div class="flex items-center gap-4">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <div>
                    <h1 class="text-xl font-semibold text-white tracking-tight">BTYCloud <span class="font-light text-blue-400">Sync</span></h1>
                    <p class="text-[11px] text-gray-400 font-medium tracking-wide">RUNSING PRIVATE INFRASTRUCTURE</p>
                </div>
            </div>
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 input-glass rounded-full">
                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span class="text-xs text-gray-300 font-medium">系統安全防護中</span>
            </div>
        </div>

        <div class="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div class="lg:col-span-5 space-y-8">
                
                <div>
                    <h2 class="text-sm font-semibold text-white mb-4 flex items-center tracking-wide uppercase text-blue-400">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                        對外分享連結 (朋友專用)
                    </h2>
                    <div class="input-glass p-4 rounded-xl relative overflow-hidden group">
                        <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-sm font-medium text-white z-10">通用分享訂閱</span>
                            <span class="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30 font-medium z-10">小火箭 / Surge 首選</span>
                        </div>
                        <p class="text-[11px] text-gray-400 mb-3 z-10 relative">此連結已隱藏後台介面，朋友如果在瀏覽器打開會被系統攔截，極度安全。</p>
                        <div class="flex items-center gap-2 z-10 relative">
                            <code class="flex-1 block truncate bg-black/40 px-3 py-2.5 rounded-lg font-mono text-[12px] text-blue-300 border border-white/5">https://${url.hostname}/${shareToken}</code>
                            <button onclick="copyToClipboard('https://${url.hostname}/${shareToken}', 'qrcode_share')" class="btn-hover px-4 py-2.5 bg-white text-black hover:bg-gray-200 text-xs font-semibold rounded-lg shadow-lg flex-shrink-0">複製</button>
                        </div>
                        <div id="qrcode_share" class="mt-4 flex justify-center bg-white/10 rounded-xl p-3 hidden transition-all"></div>
                    </div>
                </div>

                <div class="pt-6 border-t border-white/5">
                    <h2 class="text-sm font-semibold text-white mb-4 flex items-center tracking-wide uppercase text-gray-400">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        管理員直連 (切勿外傳)
                    </h2>
                    <div class="space-y-3">
                        <div class="flex items-center gap-2">
                            <span class="w-16 text-xs text-gray-500 font-medium">Clash</span>
                            <code class="flex-1 block truncate input-glass px-3 py-2 rounded-lg font-mono text-[11px] text-gray-400">https://${url.hostname}/${env.TOKEN}?clash</code>
                            <button onclick="copyToClipboard('https://${url.hostname}/${env.TOKEN}?clash', 'qrcode_c')" class="btn-hover px-3 py-2 input-glass hover:bg-white/10 text-white text-[11px] font-medium rounded-lg">複製</button>
                        </div>
                        <div id="qrcode_c" class="flex justify-center bg-white/10 rounded-xl p-3 hidden"></div>
                        
                        <div class="flex items-center gap-2">
                            <span class="w-16 text-xs text-gray-500 font-medium">Sing-box</span>
                            <code class="flex-1 block truncate input-glass px-3 py-2 rounded-lg font-mono text-[11px] text-gray-400">https://${url.hostname}/${env.TOKEN}?sb</code>
                            <button onclick="copyToClipboard('https://${url.hostname}/${env.TOKEN}?sb', 'qrcode_s')" class="btn-hover px-3 py-2 input-glass hover:bg-white/10 text-white text-[11px] font-medium rounded-lg">複製</button>
                        </div>
                        <div id="qrcode_s" class="flex justify-center bg-white/10 rounded-xl p-3 hidden"></div>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-7 flex flex-col h-[550px] lg:h-auto">
                <div class="flex justify-between items-end mb-4">
                    <h2 class="text-sm font-semibold text-white tracking-wide uppercase">核心節點數據庫</h2>
                    <span class="text-[10px] text-gray-500 font-mono border border-white/10 px-2 py-0.5 rounded">vless / vmess / trojan / ss</span>
                </div>
                
                ${hasKV ? `
                <div class="flex-1 flex flex-col relative input-glass rounded-xl overflow-hidden shadow-2xl">
                    <textarea id="content" class="editor flex-1 w-full bg-transparent p-5 text-emerald-400 font-mono text-[13px] leading-loose focus:outline-none resize-none selection:bg-emerald-500/30" placeholder="在此輸入自建節點連結，每行一個...">${content}</textarea>
                    
                    <div class="h-14 bg-black/40 border-t border-white/5 px-5 flex items-center justify-between">
                        <span id="saveStatus" class="text-gray-400 text-[11px] tracking-wide">編輯結束後系統將自動保存</span>
                        <button id="saveBtn" onclick="saveContent(this)" class="btn-hover px-5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md border border-white/10">
                            立即同步
                        </button>
                    </div>
                </div>
                ` : `
                <div class="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                    <div class="text-center p-8">
                        <h3 class="text-white font-medium mb-2">未綁定 KV 空間</h3>
                        <p class="text-gray-400 text-xs">請在 wrangler.toml 中配置 KV Namespace</p>
                    </div>
                </div>
                `}
            </div>
        </div>
    </div>

    <div id="toast" class="fixed top-8 left-1/2 transform -translate-x-1/2 macos-glass border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl transition-all duration-400 opacity-0 translate-y-[-20px] flex items-center gap-3 z-50">
        <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span id="toast-msg" class="text-[13px] font-medium tracking-wide"></span>
    </div>

    <script>
    function showToast(msg) {
        const toast = document.getElementById('toast');
        document.getElementById('toast-msg').textContent = msg;
        toast.classList.remove('opacity-0', 'translate-y-[-20px]');
        setTimeout(() => toast.classList.add('opacity-0', 'translate-y-[-20px]'), 2000);
    }

    function copyToClipboard(text, qrcodeId) {
        navigator.clipboard.writeText(text).then(() => showToast('連結已複製，請前往小火箭導入')).catch(e => console.error('複製失敗', e));
        const qrcodeDiv = document.getElementById(qrcodeId);
        if (qrcodeDiv.classList.contains('hidden')) {
            qrcodeDiv.classList.remove('hidden');
            qrcodeDiv.innerHTML = '';
            new QRCode(qrcodeDiv, { text: text, width: 140, height: 140, colorDark: "#000000", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.L });
        } else {
            qrcodeDiv.classList.add('hidden');
        }
    }
        
    if (document.querySelector('.editor')) {
        let timer;
        const textarea = document.getElementById('content');
        
        function saveContent(button) {
            try {
                const btn = document.getElementById('saveBtn');
                btn.textContent = '同步中...';
                btn.classList.add('opacity-50');

                fetch(window.location.href, { method: 'POST', body: textarea.value || '', headers: { 'Content-Type': 'text/plain;charset=UTF-8' } })
                .then(response => {
                    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
                    const now = new Date().toLocaleTimeString('zh-TW', { hour12: false });
                    document.getElementById('saveStatus').innerHTML = \`<span class="text-green-400">✔ 數據已加密同步於 \${now}</span>\`;
                    showToast('數據源已更新');
                })
                .catch(error => { document.getElementById('saveStatus').innerHTML = \`<span class="text-red-400">✖ 保存失敗: \${error.message}</span>\`; })
                .finally(() => { btn.textContent = '立即同步'; btn.classList.remove('opacity-50'); });
            } catch (e) { console.error(e); }
        }

        textarea.addEventListener('blur', () => saveContent(document.getElementById('saveBtn')));
        textarea.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(() => saveContent(document.getElementById('saveBtn')), 2500);
        });
    }
    </script>
</body>
</html>
	`;
	return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
}
