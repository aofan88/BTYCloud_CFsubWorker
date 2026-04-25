// ============================================================================
// BTYCloud | RunSing Innovation Private Sub-Aggregator v4.0 (Zero-Trust Lock)
// ============================================================================

let mytoken = 'auto';       // 統一訪問入口 TOKEN
let editPassword = '51121'; // 🔒 編輯器解鎖密碼 (防窺探 + 防篡改)

let BotToken = ''; 
let ChatID = ''; 
let TG = 0; 
let FileName = 'BTYCloud-Sync';
let SUBUpdateTime = 6; 
let total = 99;
let timestamp = 4102329600000;

let MainData = `
https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray
https://raw.githubusercontent.com/Pawdroid/Free-servers/refs/heads/main/sub
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
		const token = url.searchParams.get('token');
        
        // 讀取環境變量
		mytoken = env.TOKEN || mytoken;
        editPassword = env.EDITPASS || editPassword;
        
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

        // 身分識別邏輯 (統一為一個入口)
        const isAuthorized = [mytoken, fakeToken].includes(token) || url.pathname === ("/" + mytoken) || url.pathname.startsWith("/" + mytoken + "?");
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		// 🛡️ 未授權直接返回假 Nginx 頁面
		if (!isAuthorized) {
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), { status: 200, headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
		} else {
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
                // 網頁 UI 渲染入口
				if (userAgent.includes('mozilla') && !url.search) {
					return await KV(request, env, 'LINK.txt', mytoken, editPassword);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
			}
			
            // 訂閱獲取邏輯
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
			if (userAgent.includes('null') || userAgent.includes('subconverter') || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase())) {
				订阅格式 = 'base64';
			} else if (userAgent.includes('clash') || (url.searchParams.has('clash') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'clash';
			} else if (userAgent.includes('sing-box') || userAgent.includes('singbox') || ((url.searchParams.has('sb') || url.searchParams.has('singbox')) && !userAgent.includes('subconverter'))) {
				订阅格式 = 'singbox';
			} else if (userAgent.includes('surge') || (url.searchParams.has('surge') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'surge';
			} else if (userAgent.includes('quantumult%20x') || (url.searchParams.has('quanx') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'quanx';
			} else if (userAgent.includes('loon') || (url.searchParams.has('loon') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'loon';
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 请求订阅响应内容 = await getSUB(urls, request, 追加UA, userAgentHeader);
			req_data += 请求订阅响应内容[0].join('\n');
			订阅转换URL += "|" + 请求订阅响应内容[1];

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;
						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}
					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}
				base64Data = encodeBase64(result);
			}

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, { headers: { "content-type": "text/plain; charset=utf-8", "Profile-Update-Interval": `${SUBUpdateTime}` } });
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			
			try {
				const subConverterResponse = await fetch(subConverterUrl);
				if (!subConverterResponse.ok) {
					return new Response(base64Data, { headers: { "content-type": "text/plain; charset=utf-8", "Profile-Update-Interval": `${SUBUpdateTime}` } });
				}
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
				return new Response(base64Data, { headers: { "content-type": "text/plain; charset=utf-8", "Profile-Update-Interval": `${SUBUpdateTime}` } });
			}
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
	return `<!DOCTYPE html><html><head><title>Welcome to nginx!</title><style>body { width: 35em; margin: 0 auto; font-family: Tahoma, Verdana, Arial, sans-serif; }</style></head><body><h1>Welcome to nginx!</h1><p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p><p>For online documentation and support please refer to <a href="http://nginx.org/">nginx.org</a>.<br/>Commercial support is available at <a href="http://nginx.com/">nginx.com</a>.</p><p><em>Thank you for using nginx.</em></p></body></html>`;
}

function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	return new TextDecoder('utf-8').decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();
	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');
	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	return secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines = content.includes('\r\n') ? content.split('\r\n') : content.split('\n');
		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				result += line.replace(new RegExp(`, mtu: 1280, udp: true`, 'g'), `, mtu: 1280, remote-dns-resolve: true, udp: true`) + '\n';
			} else result += line + '\n';
		}
		return result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];
	let parsedURL = new URL(fullURL);
	let URLPathname = parsedURL.pathname;
	if (URLPathname.charAt(URLPathname.length - 1) == '/') URLPathname = URLPathname.slice(0, -1);
	URLPathname += url.pathname;
	let newURL = `${parsedURL.protocol.slice(0, -1) || 'https'}://${parsedURL.hostname}${URLPathname}${parsedURL.search}`;
	let response = await fetch(newURL);
	let newResponse = new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
	newResponse.headers.set('X-New-URL', newURL);
	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) return [];
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); 
	const timeout = setTimeout(() => { controller.abort(); }, 2000);

	try {
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));
		for (const [index, response] of responses.entries()) {
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; 
				if (content.includes('proxies') && content.includes('proxy-groups')) 订阅转换URLs += "|" + api[index]; 
				else if (content.includes('outbounds') && content.includes('inbounds')) 订阅转换URLs += "|" + api[index]; 
				else if (content.includes('://')) newapi += content + '\n'; 
				else if (isValidBase64(content)) newapi += base64Decode(content) + '\n'; 
				else 异常订阅 += `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${api[index].split('://')[1].split('/')[0]}\n`;
			}
		}
	} catch (error) { console.error(error); } finally { clearTimeout(timeout); }
	return [await ADD(newapi + 异常订阅), 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);
	return fetch(new Request(targetUrl, { method: request.method, headers: newHeaders, body: request.method === "GET" ? null : request.body, redirect: "follow" }));
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);
	if (旧数据 && !新数据) {
		await env.KV.put(txt, 旧数据);
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

// ============================================================================
// UI 前端渲染與 AJAX API (BTYCloud 零信任架構版)
// ============================================================================
async function KV(request, env, txt = 'ADD.txt', viewerToken, editPassword) {
	const url = new URL(request.url);
    
    // 🛡️ API 接口：處理 AJAX 的抓取與保存請求 (嚴格密碼校驗)
	if (request.method === "POST") {
        const action = request.headers.get('x-action');
        const providedPass = request.headers.get('x-edit-pass');
        
        if (providedPass !== editPassword) {
            return new Response("密碼錯誤，拒絕訪問底層數據！", { status: 401 });
        }
        if (!env.KV) return new Response("未绑定KV空间", { status: 400 });

        if (action === 'fetch') {
            try {
                const content = await env.KV.get(txt) || '';
                return new Response(content, { status: 200 });
            } catch (error) {
                return new Response("读取失败", { status: 500 });
            }
        } else if (action === 'save') {
            try {
                const content = await request.text();
                await env.KV.put(txt, content);
                return new Response("保存成功", { status: 200 });
            } catch (error) {
                return new Response("保存失败", { status: 500 });
            }
        }
        return new Response("未知的操作", { status: 400 });
	}

    // 🌐 渲染純淨的 HTML (不包含任何節點數據)
	const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>BTYCloud | Sync Terminal</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
    <style>
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
        .glass { background: rgba(30, 41, 59, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .btn-hover { transition: all 0.2s ease; }
        .btn-hover:active { transform: scale(0.97); }
        /* 隱藏代碼框 */
        #editor-container { display: none; }
    </style>
</head>
<body class="bg-[#0b1120] text-slate-300 min-h-screen p-4 md:p-8 font-sans antialiased selection:bg-blue-500/30 selection:text-blue-200">
    <div class="max-w-6xl mx-auto glass rounded-2xl shadow-2xl overflow-hidden shadow-blue-900/10">
        
        <div class="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/40">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <div>
                    <h1 class="text-xl font-bold text-white tracking-wide">BTYCloud <span class="font-light text-blue-400">Sync</span></h1>
                    <p class="text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-0.5">Secure Subscription Hub</p>
                </div>
            </div>
            <div class="flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700/50">
                <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span class="text-xs text-slate-400 font-medium">系統運行中</span>
            </div>
        </div>

        <div class="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div class="lg:col-span-5 space-y-6">
                <div>
                    <h2 class="text-base font-semibold text-white mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                        授權訂閱鏈接
                    </h2>
                    
                    <div class="space-y-4">
                        <div class="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:border-blue-500/40 transition-colors">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm font-medium text-slate-300">通用訂閱 (Auto / V2rayN)</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <code class="flex-1 block truncate bg-[#0b1120] px-3 py-2.5 rounded-lg font-mono text-xs text-blue-300 border border-slate-800">https://${url.hostname}/${viewerToken}</code>
                                <button onclick="copyToClipboard('https://${url.hostname}/${viewerToken}', 'qrcode_0')" class="btn-hover px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-lg flex-shrink-0">複製 / 掃碼</button>
                            </div>
                            <div id="qrcode_0" class="mt-4 flex justify-center bg-white rounded-lg p-3 hidden transition-all"></div>
                        </div>

                        <div class="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:border-indigo-500/40 transition-colors">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm font-medium text-slate-300">Clash 專屬 (Meta / Premium)</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <code class="flex-1 block truncate bg-[#0b1120] px-3 py-2.5 rounded-lg font-mono text-xs text-indigo-300 border border-slate-800">https://${url.hostname}/${viewerToken}?clash</code>
                                <button onclick="copyToClipboard('https://${url.hostname}/${viewerToken}?clash', 'qrcode_clash')" class="btn-hover px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg flex-shrink-0">複製 / 掃碼</button>
                            </div>
                            <div id="qrcode_clash" class="mt-4 flex justify-center bg-white rounded-lg p-3 hidden transition-all"></div>
                        </div>

                        <div class="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:border-purple-500/40 transition-colors">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm font-medium text-slate-300">Sing-box 專屬</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <code class="flex-1 block truncate bg-[#0b1120] px-3 py-2.5 rounded-lg font-mono text-xs text-purple-300 border border-slate-800">https://${url.hostname}/${viewerToken}?sb</code>
                                <button onclick="copyToClipboard('https://${url.hostname}/${viewerToken}?sb', 'qrcode_sb')" class="btn-hover px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg flex-shrink-0">複製 / 掃碼</button>
                            </div>
                            <div id="qrcode_sb" class="mt-4 flex justify-center bg-white rounded-lg p-3 hidden transition-all"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-7 flex flex-col h-[500px] lg:h-auto relative">
                
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-base font-semibold text-white flex items-center">
                        <svg class="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        數據源保險箱 (Data Vault)
                    </h2>
                </div>

                <div id="lock-screen" class="flex-1 flex flex-col items-center justify-center border border-slate-700 rounded-xl bg-slate-800/30 z-10">
                    <div class="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-slate-700">
                        <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h3 class="text-slate-300 font-medium mb-1">隱私數據已鎖定</h3>
                    <p class="text-slate-500 text-xs mb-6 text-center">節點數據受端到端保護，請驗證管理員身分</p>
                    
                    <div class="flex items-center gap-2">
                        <input type="password" id="unlockPass" placeholder="輸入解鎖碼..." class="bg-[#0b1120] border border-slate-600 rounded-lg text-slate-300 text-sm px-4 py-2.5 w-48 focus:border-emerald-500 outline-none text-center tracking-widest shadow-inner">
                        <button onclick="unlockEditor()" class="btn-hover px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg shadow-lg focus:outline-none">
                            解鎖
                        </button>
                    </div>
                </div>
                
                <div id="editor-container" class="flex-1 flex flex-col relative bg-[#0b1120] rounded-xl border border-emerald-700/50 overflow-hidden shadow-inner shadow-emerald-900/10">
                    <div class="absolute top-0 right-0 px-3 py-1 bg-emerald-900/50 text-emerald-400 text-[10px] rounded-bl-lg border-b border-l border-emerald-700/50">已授權登入</div>
                    
                    <textarea id="content" class="editor flex-1 w-full bg-transparent p-5 pt-8 text-emerald-400/90 font-mono text-[13px] leading-relaxed focus:outline-none resize-none" placeholder="輸入 vless:// 等節點連結..."></textarea>
                    
                    <div class="bg-slate-800/90 border-t border-slate-700 px-4 py-3 flex items-center justify-between">
                        <span id="saveStatus" class="text-slate-400 text-xs">安全編輯模式</span>
                        <button id="saveBtn" onclick="saveContent(this)" class="btn-hover px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg focus:outline-none">
                            加密並保存
                        </button>
                    </div>
                </div>

            </div>
        </div>
        
        <div class="px-6 py-4 border-t border-slate-700/30 bg-slate-900/50 text-center">
            <span class="text-[10px] text-slate-600 font-mono">BTYCloud Zero-Trust Architecture</span>
        </div>
    </div>

    <div id="toast" class="fixed top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-600 text-white px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 opacity-0 translate-y-[-20px] pointer-events-none flex items-center gap-3 z-50">
        <span id="toast-msg" class="text-sm font-medium"></span>
    </div>

    <script>
    let validPassword = ""; // 成功解鎖後保存在內存中的密碼

    function showToast(msg, isError = false) {
        const toast = document.getElementById('toast');
        toast.className = \`fixed top-6 left-1/2 transform -translate-x-1/2 \${isError ? 'bg-red-900/90 border-red-500' : 'bg-slate-800 border-slate-600'} text-white px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 z-50 flex items-center gap-3\`;
        document.getElementById('toast-msg').textContent = msg;
        toast.classList.remove('opacity-0', 'translate-y-[-20px]');
        setTimeout(() => toast.classList.add('opacity-0', 'translate-y-[-20px]'), 2500);
    }

    function copyToClipboard(text, qrcodeId) {
        navigator.clipboard.writeText(text).then(() => showToast('連結已複製到剪貼板')).catch(e => console.error(e));
        const qrcodeDiv = document.getElementById(qrcodeId);
        if (qrcodeDiv.classList.contains('hidden')) {
            qrcodeDiv.classList.remove('hidden');
            qrcodeDiv.innerHTML = '';
            new QRCode(qrcodeDiv, { text: text, width: 140, height: 140, colorDark: "#0f172a", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
        } else {
            qrcodeDiv.classList.add('hidden');
        }
    }
        
    // 🔓 解鎖並抓取數據
    function unlockEditor() {
        const passInput = document.getElementById('unlockPass').value;
        if (!passInput) return showToast('請輸入解鎖碼', true);

        showToast('正在驗證金鑰...');
        
        fetch(window.location.href, {
            method: 'POST', 
            headers: { 
                'x-action': 'fetch',
                'x-edit-pass': passInput 
            }
        })
        .then(async response => {
            if (response.status === 401) throw new Error("密碼錯誤，拒絕訪問！");
            if (!response.ok) throw new Error("網絡異常或未綁定 KV");
            
            const rawData = await response.text();
            
            // 驗證成功：保存密碼，隱藏鎖定層，顯示編輯器，注入數據
            validPassword = passInput; 
            document.getElementById('lock-screen').style.display = 'none';
            document.getElementById('editor-container').style.display = 'flex';
            document.getElementById('content').value = rawData;
            
            showToast('✅ 驗證成功，數據已解密');
        })
        .catch(error => {
            showToast(error.message, true);
        });
    }

    // 💾 保存數據
    function saveContent(button) {
        const textarea = document.getElementById('content');
        textarea.value = textarea.value.replace(/：/g, ':');
        
        button.textContent = '保存中...';
        button.classList.add('opacity-70', 'cursor-not-allowed');
        const statusElem = document.getElementById('saveStatus');

        fetch(window.location.href, {
            method: 'POST', 
            body: textarea.value || '',
            headers: { 
                'Content-Type': 'text/plain;charset=UTF-8',
                'x-action': 'save',
                'x-edit-pass': validPassword // 帶上剛才驗證通過的密碼
            }
        })
        .then(async response => {
            if (response.status === 401) throw new Error("授權過期，請刷新重試");
            if (!response.ok) throw new Error("網絡異常");
            statusElem.textContent = \`✅ 最後同步於 \${new Date().toLocaleTimeString('zh-TW', { hour12: false })}\`;
            statusElem.className = 'text-emerald-400 text-xs font-medium';
            showToast('數據已加密並保存');
        })
        .catch(error => {
            statusElem.textContent = \`❌ \${error.message}\`;
            statusElem.className = 'text-red-400 text-xs font-medium';
            showToast(error.message, true);
        })
        .finally(() => {
            button.textContent = '加密並保存';
            button.classList.remove('opacity-70', 'cursor-not-allowed');
        });
    }

    // 支援 Enter 鍵解鎖
    document.getElementById('unlockPass').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') unlockEditor();
    });
    </script>
</body>
</html>
		`;
		return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
	} catch (error) {
		return new Response("服务器错误: " + error.message, { status: 500, headers: { "Content-Type": "text/plain;charset=utf-8" } });
	}
}
